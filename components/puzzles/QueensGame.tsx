"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, X, Sparkles, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { QueensLevel } from "./puzzleTypes";
import { QUEENS_LEVELS, PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

type CellMark = "empty" | "x" | "queen";

const REGION_COLORS = [
  "bg-teal-900/40 text-teal-300 border-teal-500/30",
  "bg-amber-900/40 text-amber-300 border-amber-500/30",
  "bg-indigo-900/40 text-indigo-300 border-indigo-500/30",
  "bg-rose-900/40 text-rose-300 border-rose-500/30",
  "bg-cyan-900/40 text-cyan-300 border-cyan-500/30",
  "bg-purple-900/40 text-purple-300 border-purple-500/30",
  "bg-emerald-900/40 text-emerald-300 border-emerald-500/30",
  "bg-orange-900/40 text-orange-300 border-orange-500/30",
];

export default function QueensGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "queens")!;
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel: QueensLevel = QUEENS_LEVELS[levelIndex];
  const size = currentLevel.size;

  // Board state
  const [grid, setGrid] = useState<CellMark[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill("empty"))
  );
  const [history, setHistory] = useState<CellMark[][][]>([]);
  const [mode, setMode] = useState<"queen" | "x">("queen");
  const [autoX, setAutoX] = useState(true);

  // Timer & Stats
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Reset board on level change
  useEffect(() => {
    setGrid(Array.from({ length: currentLevel.size }, () => Array(currentLevel.size).fill("empty")));
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
  }, [levelIndex, currentLevel.size]);

  // Timer interval
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Count placed queens
  let queensCount = 0;
  const queenPositions: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "queen") {
        queensCount++;
        queenPositions.push([r, c]);
      }
    }
  }

  // Conflict detection
  const conflictingCells = new Set<string>();
  for (let i = 0; i < queenPositions.length; i++) {
    for (let j = i + 1; j < queenPositions.length; j++) {
      const [r1, c1] = queenPositions[i];
      const [r2, c2] = queenPositions[j];
      const sameRow = r1 === r2;
      const sameCol = c1 === c2;
      const sameRegion = currentLevel.regions[r1][c1] === currentLevel.regions[r2][c2];
      const touches = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;

      if (sameRow || sameCol || sameRegion || touches) {
        conflictingCells.add(`${r1},${c1}`);
        conflictingCells.add(`${r2},${c2}`);
      }
    }
  }

  // Check win condition
  useEffect(() => {
    if (queensCount === size && conflictingCells.size === 0 && !isWon) {
      // Also verify 1 queen per row, col, region
      const rowCounts = Array(size).fill(0);
      const colCounts = Array(size).fill(0);
      const regionCounts = Array(size).fill(0);
      for (const [r, c] of queenPositions) {
        rowCounts[r]++;
        colCounts[c]++;
        regionCounts[currentLevel.regions[r][c]]++;
      }
      const allRows = rowCounts.every((cnt) => cnt === 1);
      const allCols = colCounts.every((cnt) => cnt === 1);
      const allRegs = regionCounts.every((cnt) => cnt === 1);

      if (allRows && allCols && allRegs) {
        setIsWon(true);
        setShowWinModal(true);
      }
    }
  }, [queensCount, conflictingCells.size, isWon, size, currentLevel.regions, queenPositions]);

  // Cell interaction
  const handleCellClick = (r: number, c: number, overrideAction?: "queen" | "x") => {
    if (isWon) return;
    if (!hasStarted) setHasStarted(true);

    const prevGrid = grid.map((row) => [...row]);
    setHistory((prev) => [...prev, prevGrid]);

    const currentMark = grid[r][c];
    const newGrid = grid.map((row) => [...row]);
    const action = overrideAction || mode;

    if (action === "queen") {
      if (currentMark === "queen") {
        newGrid[r][c] = "empty";
      } else {
        newGrid[r][c] = "queen";
        if (autoX) {
          // Fill row, col, and 8 neighbors with X where empty
          for (let j = 0; j < size; j++) {
            if (j !== c && newGrid[r][j] === "empty") newGrid[r][j] = "x";
          }
          for (let i = 0; i < size; i++) {
            if (i !== r && newGrid[i][c] === "empty") newGrid[i][c] = "x";
          }
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                if (newGrid[nr][nc] === "empty") newGrid[nr][nc] = "x";
              }
            }
          }
        }
      }
    } else {
      // Cross mode
      if (currentMark === "x") {
        newGrid[r][c] = "empty";
      } else {
        newGrid[r][c] = "x";
      }
    }

    setGrid(newGrid);
  };

  const handleCellRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    handleCellClick(r, c, grid[r][c] === "x" ? "queen" : "x");
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setGrid(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setGrid(Array.from({ length: size }, () => Array(size).fill("empty")));
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
  };

  const handleHint = () => {
    // Reveal one correct queen position that is empty
    const sol = currentLevel.solution;
    for (let r = 0; r < size; r++) {
      const c = sol[r];
      if (grid[r][c] !== "queen") {
        handleCellClick(r, c, "queen");
        setMistakesCount((prev) => prev + 1);
        break;
      }
    }
  };

  // Border classes to separate different colored regions visually
  const getCellBorders = (r: number, c: number) => {
    const reg = currentLevel.regions[r][c];
    let borderTop = r === 0 || currentLevel.regions[r - 1][c] !== reg ? "border-t-2 border-t-white/50" : "border-t border-t-white/10";
    let borderBottom = r === size - 1 || currentLevel.regions[r + 1][c] !== reg ? "border-b-2 border-b-white/50" : "border-b border-b-white/10";
    let borderLeft = c === 0 || currentLevel.regions[r][c - 1] !== reg ? "border-l-2 border-l-white/50" : "border-l border-l-white/10";
    let borderRight = c === size - 1 || currentLevel.regions[r][c + 1] !== reg ? "border-r-2 border-r-white/50" : "border-r border-r-white/10";
    return `${borderTop} ${borderBottom} ${borderLeft} ${borderRight}`;
  };

  const rulesContent = (
    <>
      <p>
        <strong>Queens</strong> is LinkedIn&apos;s standout daily logic puzzle. The goal is to place crowns 👑 on the board such that every single rule is satisfied:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Exactly <strong>1 Queen</strong> in every row.</li>
        <li>Exactly <strong>1 Queen</strong> in every column.</li>
        <li>Exactly <strong>1 Queen</strong> in each colored territory/region.</li>
        <li>
          <strong className="text-[#fec01f]">No Touching:</strong> Queens cannot touch horizontally, vertically, or diagonally (no two queens can occupy adjacent cells).
        </li>
      </ul>
      <p className="text-xs text-white/60">
        💡 <strong>Tip:</strong> Toggle to ❌ mode or right-click to cross out cells that cannot hold a Queen. Use the Auto-X switch to automatically mark invalid rows and diagonals!
      </p>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={QUEENS_LEVELS.map((l) => l.name)}
        currentLevelIndex={levelIndex}
        onSelectLevel={setLevelIndex}
        secondsElapsed={secondsElapsed}
        movesCount={queensCount}
        mistakesCount={conflictingCells.size > 0 ? conflictingCells.size : undefined}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Control bar: Mode toggles + Auto-X */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode("queen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              mode === "queen"
                ? "bg-[#fec01f] text-black font-bold shadow-md shadow-[#fec01f]/20"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            <Crown size={14} className="fill-current" />
            <span>Place Crown 👑</span>
          </button>

          <button
            onClick={() => setMode("x")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              mode === "x"
                ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
            }`}
          >
            <X size={14} />
            <span>Mark Cross ❌</span>
          </button>
        </div>

        {/* Progress & Auto-X Toggle */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 text-white/80">
            <span className="text-white/40">Queens:</span>
            <span className="text-[#fec01f] font-bold">{queensCount}</span>
            <span className="text-white/40">/ {size}</span>
          </div>

          <label className="flex items-center gap-1.5 text-white/60 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={autoX}
              onChange={(e) => setAutoX(e.target.checked)}
              className="accent-[#fec01f] rounded"
            />
            <span>Auto-X</span>
          </label>
        </div>
      </div>

      {/* Queens Board */}
      <div className="flex justify-center py-2">
        <div
          className="inline-grid select-none rounded-xl p-2 bg-[#080820] border-2 border-white/20 shadow-2xl overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const regId = currentLevel.regions[r][c];
              const colorClass = REGION_COLORS[regId % REGION_COLORS.length];
              const isConflict = conflictingCells.has(`${r},${c}`);
              const borderStyles = getCellBorders(r, c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleCellRightClick(e, r, c)}
                  className={`relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center transition-all ${colorClass} ${borderStyles} ${
                    isConflict
                      ? "ring-2 ring-rose-500 ring-inset bg-rose-950/60 animate-pulse"
                      : "hover:brightness-125"
                  }`}
                  aria-label={`Row ${r + 1}, Column ${c + 1}`}
                >
                  {cell === "queen" && (
                    <Crown
                      size={24}
                      className={`transition-transform duration-150 scale-100 ${
                        isConflict
                          ? "text-rose-400 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                          : "text-[#fec01f] fill-[#fec01f] drop-shadow-[0_0_8px_rgba(254,192,31,0.6)]"
                      }`}
                    />
                  )}
                  {cell === "x" && (
                    <X
                      size={18}
                      className="text-white/35 hover:text-white/60 transition-colors"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Helpful Instructions footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/50 px-2 gap-2 text-center sm:text-left">
        <span>Click to toggle cell · Right-click or 2nd mode for ❌</span>
        {conflictingCells.size > 0 && (
          <span className="text-rose-400 font-bold">
            ⚠️ Queens are conflicting or touching!
          </span>
        )}
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <PuzzleWinModal
          meta={meta}
          levelName={currentLevel.name}
          secondsElapsed={secondsElapsed}
          movesCount={queensCount}
          mistakesCount={mistakesCount}
          hasNextLevel={levelIndex < QUEENS_LEVELS.length - 1}
          onNextLevel={() => setLevelIndex((prev) => prev + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
