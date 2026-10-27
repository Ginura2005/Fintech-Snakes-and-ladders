"use client";

import { useState, useEffect } from "react";
import { Edit3, Eraser, AlertTriangle, Check } from "lucide-react";
import { MiniSudokuLevel } from "./puzzleTypes";
import { MINI_SUDOKU_LEVELS, PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

export default function MiniSudokuGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "mini-sudoku")!;
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel: MiniSudokuLevel = MINI_SUDOKU_LEVELS[levelIndex];

  // Grid of 6x6 numbers: 0 for empty
  const [grid, setGrid] = useState<number[][]>(() =>
    currentLevel.givens.map((r) => [...r])
  );
  // Notes / pencil marks: [r][c] is set of candidate numbers
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [notesMode, setNotesMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [highlightNum, setHighlightNum] = useState<number | null>(null);

  const [history, setHistory] = useState<number[][][]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Reset on level change
  useEffect(() => {
    setGrid(currentLevel.givens.map((r) => [...r]));
    setNotes({});
    setSelectedCell([0, 0]);
    setHighlightNum(null);
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
  }, [levelIndex, currentLevel]);

  // Timer
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Conflict detection
  const conflicts = new Set<string>();
  // Rows
  for (let r = 0; r < 6; r++) {
    const seen = new Map<number, number>();
    for (let c = 0; c < 6; c++) {
      const v = grid[r][c];
      if (v !== 0) {
        if (seen.has(v)) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${r},${seen.get(v)}`);
        } else {
          seen.set(v, c);
        }
      }
    }
  }
  // Cols
  for (let c = 0; c < 6; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < 6; r++) {
      const v = grid[r][c];
      if (v !== 0) {
        if (seen.has(v)) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${seen.get(v)},${c}`);
        } else {
          seen.set(v, r);
        }
      }
    }
  }
  // 2x3 Blocks
  for (let br = 0; br < 6; br += 2) {
    for (let bc = 0; bc < 6; bc += 3) {
      const seen = new Map<number, [number, number]>();
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const v = grid[br + r][bc + c];
          if (v !== 0) {
            if (seen.has(v)) {
              conflicts.add(`${br + r},${bc + c}`);
              const [pr, pc] = seen.get(v)!;
              conflicts.add(`${pr},${pc}`);
            } else {
              seen.set(v, [br + r, bc + c]);
            }
          }
        }
      }
    }
  }

  // Check win condition
  useEffect(() => {
    let filled = true;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (grid[r][c] === 0) filled = false;
      }
    }
    if (filled && conflicts.size === 0 && !isWon) {
      let matches = true;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (grid[r][c] !== currentLevel.solution[r][c]) matches = false;
        }
      }
      if (matches) {
        setIsWon(true);
        setShowWinModal(true);
      }
    }
  }, [grid, conflicts.size, isWon, currentLevel.solution]);

  // Handle number input
  const inputNumber = (num: number) => {
    if (isWon || !selectedCell) return;
    const [r, c] = selectedCell;
    if (currentLevel.givens[r][c] !== 0) return; // locked

    if (!hasStarted) setHasStarted(true);

    if (notesMode) {
      const key = `${r},${c}`;
      const curNotes = notes[key] || [];
      const updatedNotes = curNotes.includes(num)
        ? curNotes.filter((n) => n !== num)
        : [...curNotes, num].sort();
      setNotes((prev) => ({ ...prev, [key]: updatedNotes }));
    } else {
      setHistory((prev) => [...prev, grid.map((row) => [...row])]);
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      setHighlightNum(num);

      // Check if wrong against solution
      if (num !== currentLevel.solution[r][c]) {
        setMistakesCount((prev) => prev + 1);
      }
    }
  };

  const handleErase = () => {
    if (isWon || !selectedCell) return;
    const [r, c] = selectedCell;
    if (currentLevel.givens[r][c] !== 0) return;

    if (notesMode) {
      setNotes((prev) => ({ ...prev, [`${r},${c}`]: [] }));
    } else {
      setHistory((prev) => [...prev, grid.map((row) => [...row])]);
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = 0;
      setGrid(newGrid);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (e.key >= "1" && e.key <= "6") {
        inputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key === "ArrowUp") {
        setSelectedCell((prev) => (prev ? [Math.max(0, prev[0] - 1), prev[1]] : [0, 0]));
      } else if (e.key === "ArrowDown") {
        setSelectedCell((prev) => (prev ? [Math.min(5, prev[0] + 1), prev[1]] : [0, 0]));
      } else if (e.key === "ArrowLeft") {
        setSelectedCell((prev) => (prev ? [prev[0], Math.max(0, prev[1] - 1)] : [0, 0]));
      } else if (e.key === "ArrowRight") {
        setSelectedCell((prev) => (prev ? [prev[0], Math.min(5, prev[1] + 1)] : [0, 0]));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setGrid(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const handleReset = () => {
    setGrid(currentLevel.givens.map((r) => [...r]));
    setNotes({});
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
  };

  const handleHint = () => {
    // Fill selected cell or first empty cell with solution
    const [sr, sc] = selectedCell || [0, 0];
    if (grid[sr][sc] === 0) {
      inputNumber(currentLevel.solution[sr][sc]);
      return;
    }
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (grid[r][c] === 0) {
          setSelectedCell([r, c]);
          const newGrid = grid.map((row) => [...row]);
          newGrid[r][c] = currentLevel.solution[r][c];
          setGrid(newGrid);
          setMistakesCount((prev) => prev + 1);
          return;
        }
      }
    }
  };

  const rulesContent = (
    <>
      <p>
        <strong>Mini Sudoku</strong> is LinkedIn&apos;s fast 6x6 number grid puzzle:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Fill the grid with numbers <strong>1 through 6</strong>.</li>
        <li>Every row must contain digits 1-6 with no repeats.</li>
        <li>Every column must contain digits 1-6 with no repeats.</li>
        <li>Each outlined <strong>2x3 block</strong> (2 rows by 3 columns) must contain 1-6.</li>
      </ul>
      <p className="text-xs text-white/60">
        💡 <strong>Tip:</strong> Toggle Notes mode 📝 to jot down potential candidates. You can also use your physical keyboard keys (1-6) and arrow keys!
      </p>
    </>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={MINI_SUDOKU_LEVELS.map((l) => l.name)}
        currentLevelIndex={levelIndex}
        onSelectLevel={setLevelIndex}
        secondsElapsed={secondsElapsed}
        mistakesCount={mistakesCount}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Mini Sudoku Grid */}
      <div className="flex justify-center py-2">
        <div className="p-3 rounded-2xl bg-[#080820] border-2 border-white/20 shadow-2xl">
          <div className="grid grid-cols-6 border border-white/20 bg-white/5 rounded-xl overflow-hidden">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isGiven = currentLevel.givens[r][c] !== 0;
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isConflict = conflicts.has(`${r},${c}`);
                const isSameNum = highlightNum !== null && val === highlightNum && val !== 0;
                const cellNotes = notes[`${r},${c}`] || [];

                // 2x3 block borders
                const borderBottom = (r + 1) % 2 === 0 && r !== 5 ? "border-b-2 border-b-white/50" : "border-b border-b-white/10";
                const borderRight = (c + 1) % 3 === 0 && c !== 5 ? "border-r-2 border-r-white/50" : "border-r border-r-white/10";

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      setSelectedCell([r, c]);
                      if (val !== 0) setHighlightNum(val);
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-mono font-bold text-lg sm:text-xl transition-all relative ${borderBottom} ${borderRight} ${
                      isSelected
                        ? "bg-[#fec01f]/25 ring-2 ring-[#fec01f] ring-inset"
                        : isSameNum
                        ? "bg-teal-500/20 text-[#fec01f]"
                        : "hover:bg-white/[0.08]"
                    } ${
                      isConflict
                        ? "bg-rose-950/60 text-rose-300 ring-1 ring-rose-500"
                        : isGiven
                        ? "text-white font-extrabold"
                        : "text-[#fec01f] font-semibold"
                    }`}
                  >
                    {val !== 0 ? (
                      val
                    ) : (
                      // Render notes inside empty cell
                      <div className="grid grid-cols-3 gap-0.5 text-[8px] sm:text-[9px] text-white/50 leading-none pointer-events-none p-1">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <span key={num} className="w-2.5 h-2.5 text-center">
                            {cellNotes.includes(num) ? num : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Conflict banner */}
      {conflicts.size > 0 && (
        <div className="flex items-center justify-center gap-2 text-rose-300 font-mono text-xs">
          <AlertTriangle size={13} />
          <span>Duplicate number found in row, column, or 2x3 block!</span>
        </div>
      )}

      {/* Keypad & Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => inputNumber(num)}
              className="w-11 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.06] hover:bg-[#fec01f] hover:text-black border border-white/15 hover:border-[#fec01f] font-mono font-bold text-lg sm:text-xl transition-all shadow-md active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors border ${
              notesMode
                ? "bg-[#fec01f] text-black font-bold border-[#fec01f]"
                : "bg-white/5 hover:bg-white/10 text-white/70 border-white/15"
            }`}
          >
            <Edit3 size={14} />
            <span>Notes: {notesMode ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={handleErase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/70 border border-white/15 transition-colors"
          >
            <Eraser size={14} />
            <span>Erase</span>
          </button>
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <PuzzleWinModal
          meta={meta}
          levelName={currentLevel.name}
          secondsElapsed={secondsElapsed}
          mistakesCount={mistakesCount}
          hasNextLevel={levelIndex < MINI_SUDOKU_LEVELS.length - 1}
          onNextLevel={() => setLevelIndex((p) => p + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
