"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, X, CheckCircle2, SlidersHorizontal, Check, AlertTriangle, Lightbulb } from "lucide-react";
import { QueensLevel } from "./puzzleTypes";
import { generateQueensLevel } from "@/lib/puzzles/queens-engine";
import { getDailyPuzzleSeed } from "@/lib/puzzles/prng";
import {
  recordPuzzleWin,
  getPuzzleStats,
  toggleGlobalPuzzleMute,
  getGlobalSoundProfile,
  setGlobalSoundProfile,
  SpeedTierInfo,
} from "@/lib/puzzles/puzzle-storage";
import { SoundProfile, sounds } from "@/lib/audio/sound-effects";
import { CodexCard } from "@/lib/puzzles/fintech-codex";

interface ChallengeInfo {
  challengerName: string;
  targetSeconds: number;
  seed: number;
  difficulty?: string;
}

interface QueensGameProps {
  onBackToHub: () => void;
  customSeed?: number;
  challengeInfo?: ChallengeInfo | null;
  dateStr?: string;
  onOpenCodex?: () => void;
}
import { PUZZLES_META } from "./puzzleData";
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
  "bg-blue-900/40 text-blue-300 border-blue-500/30",
];

const DIFFICULTY_SIZES: Array<{ label: string; size: 6 | 7 | 8 | 9 }> = [
  { label: "6×6 Easy", size: 6 },
  { label: "7×7 Medium", size: 7 },
  { label: "8×8 Hard", size: 8 },
  { label: "9×9 Expert", size: 9 },
];

export default function QueensGame({
  onBackToHub,
  customSeed,
  challengeInfo,
  dateStr,
  onOpenCodex,
}: QueensGameProps) {
  const meta = PUZZLES_META.find((p) => p.id === "queens")!;
  const [sizeIndex, setSizeIndex] = useState(() => {
    if (challengeInfo?.difficulty) {
      const match = DIFFICULTY_SIZES.findIndex((d) =>
        challengeInfo.difficulty?.toLowerCase().includes(d.size.toString())
      );
      if (match >= 0) return match;
    }
    return 0;
  });
  const currentSize = DIFFICULTY_SIZES[sizeIndex].size;

  // Active level state (Custom seed, archive date seed, or daily seed)
  const initialSeed =
    customSeed ||
    (dateStr ? getDailyPuzzleSeed(new Date(dateStr)) : getDailyPuzzleSeed());
  const [levelSeed, setLevelSeed] = useState(() => initialSeed);
  const [currentLevel, setCurrentLevel] = useState<QueensLevel>(() =>
    generateQueensLevel(currentSize, initialSeed)
  );

  const size = currentLevel.size;

  // Board state
  const [grid, setGrid] = useState<CellMark[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill("empty"))
  );
  const [history, setHistory] = useState<CellMark[][][]>([]);
  const [mode, setMode] = useState<"queen" | "x">("queen");
  const [autoX, setAutoX] = useState(true);

  // Sound profile state
  const [soundProfile, setSoundProfileState] = useState<SoundProfile>(() => getGlobalSoundProfile());
  const isMuted = soundProfile === "muted";

  // Drag-to-cross state
  const isDraggingCrossRef = useRef(false);

  // Timer & Stats
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pointsEarned, setPointsEarned] = useState<number | undefined>(undefined);
  const [arenaBonusPoints, setArenaBonusPoints] = useState<number | undefined>(undefined);
  const [speedTier, setSpeedTier] = useState<SpeedTierInfo | undefined>(undefined);
  const [newCodexCard, setNewCodexCard] = useState<CodexCard | null>(null);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);

  // Regenerate level on size change or new puzzle trigger
  useEffect(() => {
    const level = generateQueensLevel(currentSize, levelSeed);
    setCurrentLevel(level);
    setGrid(Array.from({ length: level.size }, () => Array(level.size).fill("empty")));
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
    setIsNewBestTime(false);
  }, [currentSize, levelSeed]);

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

  // Row, Col, and Region satisfaction checks
  const rowQueens = Array(size).fill(0);
  const colQueens = Array(size).fill(0);
  const regQueens = Array(size).fill(0);
  for (const [r, c] of queenPositions) {
    rowQueens[r]++;
    colQueens[c]++;
    regQueens[currentLevel.regions[r][c]]++;
  }

  const satisfiedRows = new Set<number>();
  for (let r = 0; r < size; r++) if (rowQueens[r] === 1) satisfiedRows.add(r);
  const satisfiedCols = new Set<number>();
  for (let c = 0; c < size; c++) if (colQueens[c] === 1) satisfiedCols.add(c);
  const satisfiedRegs = new Set<number>();
  for (let reg = 0; reg < size; reg++) if (regQueens[reg] === 1) satisfiedRegs.add(reg);

  // Check win condition
  useEffect(() => {
    if (queensCount === size && conflictingCells.size === 0 && !isWon && !isSolutionRevealed) {
      const allRows = rowQueens.every((cnt) => cnt === 1);
      const allCols = colQueens.every((cnt) => cnt === 1);
      const allRegs = regQueens.every((cnt) => cnt === 1);

      if (allRows && allCols && allRegs) {
        setIsWon(true);
        setShowWinModal(true);
        if (!isMuted) sounds.playVictory();

        // Record win
        const difficultyName = DIFFICULTY_SIZES[sizeIndex].label.split(" ")[1];
        const winResult = recordPuzzleWin(
          "queens",
          difficultyName,
          secondsElapsed,
          mistakesCount
        );
        setIsNewBestTime(winResult.isNewBestTime);
        setCurrentStreak(winResult.newStreak);
        setPointsEarned(winResult.pointsEarned);
        setArenaBonusPoints(winResult.arenaBonusPoints);
        setSpeedTier(winResult.speedTier);
        setNewCodexCard(winResult.newCodexCard);
        if (winResult.newCodexCard && !isMuted) {
          sounds.playCodexUnlock();
        }
      }
    }
  }, [
    queensCount,
    conflictingCells.size,
    isWon,
    isSolutionRevealed,
    size,
    rowQueens,
    colQueens,
    regQueens,
    sizeIndex,
    secondsElapsed,
    mistakesCount,
    isMuted,
  ]);

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
        if (!isMuted) sounds.playClick();
      } else {
        newGrid[r][c] = "queen";
        if (!isMuted) sounds.playMoveSuccess();

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
        if (!isMuted) sounds.playClick();
      }
    }

    setGrid(newGrid);
  };

  const handleCellRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    handleCellClick(r, c, grid[r][c] === "x" ? "queen" : "x");
  };

  const handlePointerDown = (r: number, c: number) => {
    handleCellClick(r, c);
    if (mode === "x") {
      isDraggingCrossRef.current = true;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCrossRef.current || mode !== "x") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const cellEl = el.closest("[data-queen-coord]");
    if (cellEl) {
      const coord = cellEl.getAttribute("data-queen-coord");
      if (coord) {
        const [r, c] = coord.split(",").map(Number);
        if (grid[r]?.[c] === "empty") {
          handleCellClick(r, c, "x");
        }
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingCrossRef.current = false;
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
    setIsSolutionRevealed(false);
  };

  const handleNewPuzzle = () => {
    setLevelSeed(Math.floor(Math.random() * 1000000) + 1);
    setIsSolutionRevealed(false);
  };

  const handleHint = () => {
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

  const handleRevealSolution = () => {
    const sol = currentLevel.solution;
    const solGrid: CellMark[][] = Array.from({ length: size }, () =>
      Array(size).fill("x")
    );
    for (let r = 0; r < size; r++) {
      solGrid[r][sol[r]] = "queen";
    }
    setGrid(solGrid);
    setIsSolutionRevealed(true);
    setHasStarted(false);
    sounds.playGiveUpReveal();
  };

  const handleSoundProfileChange = (profile: SoundProfile) => {
    setGlobalSoundProfile(profile);
    setSoundProfileState(profile);
  };

  const handleToggleSound = () => {
    const nextMuted = toggleGlobalPuzzleMute();
    setSoundProfileState(nextMuted ? "muted" : "arcade");
  };

  // Border classes to separate different colored regions visually
  const getCellBorders = (r: number, c: number) => {
    const reg = currentLevel.regions[r][c];
    const borderTop = r === 0 || currentLevel.regions[r - 1][c] !== reg ? "border-t-2 border-t-white/60" : "border-t border-t-white/10";
    const borderBottom = r === size - 1 || currentLevel.regions[r + 1][c] !== reg ? "border-b-2 border-b-white/60" : "border-b border-b-white/10";
    const borderLeft = c === 0 || currentLevel.regions[r][c - 1] !== reg ? "border-l-2 border-l-white/60" : "border-l border-l-white/10";
    const borderRight = c === size - 1 || currentLevel.regions[r][c + 1] !== reg ? "border-r-2 border-r-white/60" : "border-r border-r-white/10";
    return `${borderTop} ${borderBottom} ${borderLeft} ${borderRight}`;
  };

  const rulesContent = (
    <>
      <p>
        <strong>Queens</strong> is LinkedIn&apos;s flagship daily logic puzzle. The goal is to place crowns on the board such that every single rule is satisfied:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Exactly <strong>1 Queen</strong> in every row.</li>
        <li>Exactly <strong>1 Queen</strong> in every column.</li>
        <li>Exactly <strong>1 Queen</strong> in each colored territory/region.</li>
        <li>
          <strong className="text-[#fec01f]">No Touching:</strong> Queens cannot touch horizontally, vertically, or diagonally (no two queens can occupy adjacent squares).
        </li>
      </ul>
      <p className="text-xs text-white/60 flex items-center gap-1.5 pt-1">
        <Lightbulb size={13} className="text-[#fec01f] shrink-0" />
        <span><strong>Pro-Tip:</strong> Drag across squares in Mark Cross mode to cross them out in one smooth sweep! Turn on Auto-X to automatically cross out invalid squares when you place a Queen.</span>
      </p>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={DIFFICULTY_SIZES.map((d) => d.label)}
        currentLevelIndex={sizeIndex}
        onSelectLevel={setSizeIndex}
        secondsElapsed={secondsElapsed}
        movesCount={queensCount}
        mistakesCount={conflictingCells.size > 0 ? conflictingCells.size : undefined}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onNewPuzzle={handleNewPuzzle}
        isSoundMuted={isMuted}
        soundProfile={soundProfile}
        onChangeSoundProfile={handleSoundProfileChange}
        onToggleSound={handleToggleSound}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
        onRevealSolution={handleRevealSolution}
        isSolutionRevealed={isSolutionRevealed}
        challengeInfo={challengeInfo}
      />

      {/* Difficulty Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-md mx-auto">
        {DIFFICULTY_SIZES.map((d, idx) => (
          <button
            key={d.label}
            onClick={() => {
              setSizeIndex(idx);
              if (!isMuted) sounds.playClick();
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              sizeIndex === idx
                ? idx === 0
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : idx === 1
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : idx === 2
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

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
            <span>Place Crown</span>
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
            <span>Mark Cross</span>
          </button>
        </div>

        {/* Progress & Auto-X Toggle */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="text-white/40">Queens:</span>
            <span className="text-[#fec01f] font-bold">{queensCount}</span>
            <span className="text-white/40">/ {size}</span>
            {queensCount === size && conflictingCells.size === 0 && (
              <Check size={14} className="text-teal-400" />
            )}
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

      {/* Queens Board (Fluid Responsive Aspect-Square Container) */}
      <div className="flex justify-center py-2 px-1">
        <div
          className="relative w-full max-w-[min(94vw,440px)] aspect-square select-none rounded-2xl p-2 sm:p-3 bg-[#070720] border-2 border-white/20 shadow-2xl overflow-hidden touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const regId = currentLevel.regions[r][c];
                const colorClass = REGION_COLORS[regId % REGION_COLORS.length];
                const isConflict = conflictingCells.has(`${r},${c}`);
                const borderStyles = getCellBorders(r, c);

                const isRowSatisfied = satisfiedRows.has(r) && !conflictingCells.has(`${r},${c}`);
                const isColSatisfied = satisfiedCols.has(c) && !conflictingCells.has(`${r},${c}`);
                const isRegSatisfied = satisfiedRegs.has(regId) && !conflictingCells.has(`${r},${c}`);

                return (
                  <button
                    key={`${r}-${c}`}
                    data-queen-coord={`${r},${c}`}
                    onPointerDown={() => handlePointerDown(r, c)}
                    onContextMenu={(e) => handleCellRightClick(e, r, c)}
                    className={`relative w-full h-full aspect-square flex items-center justify-center transition-all ${colorClass} ${borderStyles} ${
                      isConflict
                        ? "ring-2 ring-rose-500 ring-inset bg-rose-950/60 animate-pulse z-10"
                        : isRowSatisfied && isColSatisfied && isRegSatisfied
                        ? "brightness-105"
                        : "hover:brightness-125"
                    }`}
                    aria-label={`Row ${r + 1}, Column ${c + 1}`}
                  >
                    {cell === "queen" && (
                      <Crown
                        size={size >= 9 ? 18 : size >= 8 ? 20 : 25}
                        className={`transition-transform duration-150 scale-100 ${
                          isConflict
                            ? "text-rose-400 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                            : "text-[#fec01f] fill-[#fec01f] drop-shadow-[0_0_10px_rgba(254,192,31,0.7)] animate-scaleIn"
                        }`}
                      />
                    )}
                    {cell === "x" && (
                      <X
                        size={size >= 9 ? 12 : size >= 8 ? 14 : 17}
                        className="text-white/40 hover:text-white/70 transition-colors"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Instructions footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/50 px-2 gap-2 text-center sm:text-left">
        <span>Click to toggle cell · Drag across in Cross mode to sweep</span>
        {conflictingCells.size > 0 && (
          <span className="inline-flex items-center gap-1 text-rose-400 font-bold animate-pulse">
            <AlertTriangle size={13} />
            <span>Queens are conflicting or touching!</span>
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
          isNewBestTime={isNewBestTime}
          currentStreak={currentStreak}
          pointsEarned={pointsEarned}
          arenaBonusPoints={arenaBonusPoints}
          hasNextLevel={sizeIndex < DIFFICULTY_SIZES.length - 1}
          onNextLevel={() => setSizeIndex((prev) => prev + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
          speedTier={speedTier}
          newCodexCard={newCodexCard}
          onOpenCodex={onOpenCodex}
          levelSeed={levelSeed}
          challengeInfo={challengeInfo}
        />
      )}
    </div>
  );
}
