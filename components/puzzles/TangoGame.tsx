"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, AlertTriangle } from "lucide-react";
import { TangoLevel, TangoSymbol } from "./puzzleTypes";
import { TANGO_LEVELS, PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

export default function TangoGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "tango")!;
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel: TangoLevel = TANGO_LEVELS[levelIndex];
  const size = currentLevel.size;

  // Board state initialized with givens
  const [board, setBoard] = useState<TangoSymbol[][]>(() =>
    currentLevel.givens.map((r) => [...r])
  );
  const [history, setHistory] = useState<TangoSymbol[][][]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Reset on level change
  useEffect(() => {
    setBoard(currentLevel.givens.map((r) => [...r]));
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
  }, [levelIndex, currentLevel]);

  // Timer interval
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Check conflicts
  const conflictCells = new Set<string>();

  // 1. Check rows and cols count > 3
  for (let r = 0; r < size; r++) {
    let sCount = 0, mCount = 0;
    for (let c = 0; c < size; c++) {
      if (board[r][c] === "S") sCount++;
      if (board[r][c] === "M") mCount++;
    }
    if (sCount > 3 || mCount > 3) {
      for (let c = 0; c < size; c++) conflictCells.add(`${r},${c}`);
    }
  }
  for (let c = 0; c < size; c++) {
    let sCount = 0, mCount = 0;
    for (let r = 0; r < size; r++) {
      if (board[r][c] === "S") sCount++;
      if (board[r][c] === "M") mCount++;
    }
    if (sCount > 3 || mCount > 3) {
      for (let r = 0; r < size; r++) conflictCells.add(`${r},${c}`);
    }
  }

  // 2. Check 3 consecutive identical in rows
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 3; c++) {
      const v0 = board[r][c], v1 = board[r][c + 1], v2 = board[r][c + 2];
      if (v0 && v0 === v1 && v1 === v2) {
        conflictCells.add(`${r},${c}`);
        conflictCells.add(`${r},${c + 1}`);
        conflictCells.add(`${r},${c + 2}`);
      }
    }
  }
  // 3. Check 3 consecutive identical in cols
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 3; r++) {
      const v0 = board[r][c], v1 = board[r + 1][c], v2 = board[r + 2][c];
      if (v0 && v0 === v1 && v1 === v2) {
        conflictCells.add(`${r},${c}`);
        conflictCells.add(`${r + 1},${c}`);
        conflictCells.add(`${r + 2},${c}`);
      }
    }
  }

  // 4. Check horizontal clues (= and x)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      const edge = currentLevel.hEdges[r][c];
      if (!edge) continue;
      const v1 = board[r][c], v2 = board[r][c + 1];
      if (v1 && v2) {
        if (edge === "=" && v1 !== v2) {
          conflictCells.add(`${r},${c}`);
          conflictCells.add(`${r},${c + 1}`);
        }
        if (edge === "x" && v1 === v2) {
          conflictCells.add(`${r},${c}`);
          conflictCells.add(`${r},${c + 1}`);
        }
      }
    }
  }

  // 5. Check vertical clues (= and x)
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      const edge = currentLevel.vEdges[r][c];
      if (!edge) continue;
      const v1 = board[r][c], v2 = board[r + 1][c];
      if (v1 && v2) {
        if (edge === "=" && v1 !== v2) {
          conflictCells.add(`${r},${c}`);
          conflictCells.add(`${r + 1},${c}`);
        }
        if (edge === "x" && v1 === v2) {
          conflictCells.add(`${r},${c}`);
          conflictCells.add(`${r + 1},${c}`);
        }
      }
    }
  }

  // Check win condition
  useEffect(() => {
    let filled = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === null) filled = false;
      }
    }
    if (filled && conflictCells.size === 0 && !isWon) {
      // Check solution matches
      let correct = true;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r][c] !== currentLevel.solution[r][c]) correct = false;
        }
      }
      if (correct) {
        setIsWon(true);
        setShowWinModal(true);
      }
    }
  }, [board, conflictCells.size, isWon, size, currentLevel.solution]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    if (currentLevel.givens[r][c] !== null) return; // locked

    if (!hasStarted) setHasStarted(true);

    const prevBoard = board.map((row) => [...row]);
    setHistory((prev) => [...prev, prevBoard]);

    const cur = board[r][c];
    let next: TangoSymbol = null;
    if (cur === null) next = "S";
    else if (cur === "S") next = "M";
    else next = null;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = next;
    setBoard(newBoard);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory((h) => h.slice(0, -1));
  };

  const handleReset = () => {
    setBoard(currentLevel.givens.map((r) => [...r]));
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
  };

  const handleHint = () => {
    // Find an empty cell and fill with solution
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === null) {
          const newBoard = board.map((row) => [...row]);
          newBoard[r][c] = currentLevel.solution[r][c];
          setBoard(newBoard);
          setMistakesCount((prev) => prev + 1);
          return;
        }
      }
    }
  };

  const rulesContent = (
    <>
      <p>
        <strong>Tango</strong> is LinkedIn&apos;s celestial binary logic puzzle. The goal is to fill the 6x6 grid with Suns ☀️ and Moons 🌙 so that:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Every row has exactly <strong>3 Suns</strong> and <strong>3 Moons</strong>.</li>
        <li>Every column has exactly <strong>3 Suns</strong> and <strong>3 Moons</strong>.</li>
        <li>
          <strong className="text-rose-400">No Triples:</strong> You cannot have 3 identical symbols in a row or column (no ☀️☀️☀️ or 🌙🌙🌙).
        </li>
        <li>
          <strong className="text-[#fec01f]">= Clue:</strong> Adjacent cells sharing an &apos;=&apos; sign must have the <strong>same</strong> symbol.
        </li>
        <li>
          <strong className="text-[#00f0ff]">× Clue:</strong> Adjacent cells sharing an &apos;×&apos; sign must have <strong>opposite</strong> symbols.
        </li>
      </ul>
      <p className="text-xs text-white/60">
        💡 <strong>Tip:</strong> Pre-filled squares cannot be changed. Tap an empty square to cycle: Empty → ☀️ → 🌙 → Empty.
      </p>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={TANGO_LEVELS.map((l) => l.name)}
        currentLevelIndex={levelIndex}
        onSelectLevel={setLevelIndex}
        secondsElapsed={secondsElapsed}
        mistakesCount={conflictCells.size > 0 ? conflictCells.size : undefined}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Guide Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#fec01f]">
            <Sun size={15} /> Sun (☀️)
          </span>
          <span className="flex items-center gap-1 text-cyan-300">
            <Moon size={15} /> Moon (🌙)
          </span>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <span><strong className="text-[#fec01f]">=</strong> same</span>
          <span><strong className="text-rose-400">×</strong> opposite</span>
          <span>Max 2 in a row</span>
        </div>
      </div>

      {/* Tango Grid */}
      <div className="flex justify-center py-2">
        <div className="relative p-4 rounded-2xl bg-[#080822] border-2 border-white/15 shadow-2xl">
          <div className="grid grid-cols-6 gap-2">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isGiven = currentLevel.givens[r][c] !== null;
                const isConflict = conflictCells.has(`${r},${c}`);
                const hEdge = c < size - 1 ? currentLevel.hEdges[r][c] : null;
                const vEdge = r < size - 1 ? currentLevel.vEdges[r][c] : null;

                return (
                  <div key={`${r}-${c}`} className="relative">
                    <button
                      onClick={() => handleCellClick(r, c)}
                      disabled={isGiven}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg transition-all font-bold ${
                        isGiven
                          ? "bg-white/10 text-white border border-white/25 cursor-not-allowed"
                          : "bg-white/[0.04] hover:bg-white/[0.09] border border-white/10"
                      } ${
                        isConflict
                          ? "ring-2 ring-rose-500 bg-rose-950/40"
                          : cell === "S"
                          ? "border-[#fec01f]/50 shadow-[0_0_12px_rgba(254,192,31,0.15)]"
                          : cell === "M"
                          ? "border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                          : ""
                      }`}
                      aria-label={`Row ${r + 1}, Col ${c + 1}`}
                    >
                      {cell === "S" && (
                        <Sun
                          size={24}
                          className="text-[#fec01f] fill-[#fec01f] drop-shadow-[0_0_6px_rgba(254,192,31,0.8)] animate-scaleIn"
                        />
                      )}
                      {cell === "M" && (
                        <Moon
                          size={22}
                          className="text-cyan-300 fill-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-scaleIn"
                        />
                      )}
                    </button>

                    {/* Horizontal Edge Constraint between (r,c) and (r, c+1) */}
                    {hEdge && (
                      <div className="pointer-events-none absolute top-1/2 -right-2.5 -translate-y-1/2 z-20 w-4 h-4 rounded-full bg-[#06061f] border border-white/20 flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-md">
                        {hEdge === "=" ? (
                          <span className="text-[#fec01f] leading-none">=</span>
                        ) : (
                          <span className="text-rose-400 leading-none">×</span>
                        )}
                      </div>
                    )}

                    {/* Vertical Edge Constraint between (r,c) and (r+1, c) */}
                    {vEdge && (
                      <div className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-[#06061f] border border-white/20 flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-md">
                        {vEdge === "=" ? (
                          <span className="text-[#fec01f] leading-none">=</span>
                        ) : (
                          <span className="text-rose-400 leading-none">×</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row/Col counters or conflict warnings */}
      {conflictCells.size > 0 && (
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs">
          <AlertTriangle size={14} />
          <span>Rule violation detected! Check 3-in-a-row or = / × clues.</span>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <PuzzleWinModal
          meta={meta}
          levelName={currentLevel.name}
          secondsElapsed={secondsElapsed}
          mistakesCount={mistakesCount}
          hasNextLevel={levelIndex < TANGO_LEVELS.length - 1}
          onNextLevel={() => setLevelIndex((prev) => prev + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
