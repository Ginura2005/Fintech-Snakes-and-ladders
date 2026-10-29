"use client";

import { useState, useEffect } from "react";
import { Edit3, Eraser, AlertTriangle, Check, Shuffle, SlidersHorizontal, Calendar, Lightbulb } from "lucide-react";
import { MiniSudokuLevel } from "./puzzleTypes";
import { MINI_SUDOKU_LEVELS, PUZZLES_META } from "./puzzleData";
import { generateMiniSudokuLevel } from "@/lib/puzzles/mini-sudoku-engine";
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
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

type Difficulty = "Easy" | "Medium" | "Hard";
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

interface ChallengeInfo {
  challengerName: string;
  targetSeconds: number;
  seed: number;
  difficulty?: string;
}

interface MiniSudokuGameProps {
  onBackToHub: () => void;
  customSeed?: number;
  challengeInfo?: ChallengeInfo | null;
  dateStr?: string;
  onOpenCodex?: () => void;
}

export default function MiniSudokuGame({
  onBackToHub,
  customSeed,
  challengeInfo,
  dateStr,
  onOpenCodex,
}: MiniSudokuGameProps) {
  const meta = PUZZLES_META.find((p) => p.id === "mini-sudoku")!;

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    if (challengeInfo?.difficulty) {
      const match = DIFFICULTIES.find((d) =>
        d.toLowerCase() === challengeInfo.difficulty?.toLowerCase()
      );
      if (match) return match;
    }
    return "Easy";
  });

  const initialSeed =
    customSeed ||
    (dateStr ? getDailyPuzzleSeed(new Date(dateStr)) : getDailyPuzzleSeed());
  const [levelSeed, setLevelSeed] = useState(() => initialSeed);
  const [useProcedural, setUseProcedural] = useState(true);
  const [presetIndex, setPresetIndex] = useState(0);

  // Active level calculation
  const [currentLevel, setCurrentLevel] = useState<MiniSudokuLevel>(() =>
    generateMiniSudokuLevel(difficulty, initialSeed)
  );

  // Grid of 6x6 numbers: 0 for empty
  const [grid, setGrid] = useState<number[][]>(() =>
    currentLevel.givens.map((r) => [...r])
  );
  // Notes / pencil marks: [r][c] is array of candidate numbers
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
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pointsEarned, setPointsEarned] = useState<number | undefined>(undefined);
  const [arenaBonusPoints, setArenaBonusPoints] = useState<number | undefined>(undefined);
  const [speedTier, setSpeedTier] = useState<SpeedTierInfo | undefined>(undefined);
  const [newCodexCard, setNewCodexCard] = useState<CodexCard | null>(null);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);

  // Audio mute state
  const [soundProfile, setSoundProfileState] = useState<SoundProfile>(() => getGlobalSoundProfile());
  const isMuted = soundProfile === "muted";

  // Regeneration helper
  const loadNewLevel = (diff: Difficulty, seed: number) => {
    const lvl = generateMiniSudokuLevel(diff, seed);
    setCurrentLevel(lvl);
    setGrid(lvl.givens.map((r) => [...r]));
    setNotes({});
    setSelectedCell([0, 0]);
    setHighlightNum(null);
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
  };

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    setUseProcedural(true);
    const newSeed = Date.now();
    setLevelSeed(newSeed);
    loadNewLevel(diff, newSeed);
    if (!isMuted) sounds.playClick();
  };

  const handleRandomPuzzle = () => {
    setUseProcedural(true);
    const newSeed = Date.now();
    setLevelSeed(newSeed);
    loadNewLevel(difficulty, newSeed);
    if (!isMuted) sounds.playClick();
  };

  const handleDailyPuzzle = () => {
    setUseProcedural(true);
    const seed = getDailyPuzzleSeed();
    setLevelSeed(seed);
    loadNewLevel(difficulty, seed);
    if (!isMuted) sounds.playClick();
  };

  const handleToggleMute = () => {
    const nextMuted = toggleGlobalPuzzleMute();
    setSoundProfileState(nextMuted ? "muted" : "arcade");
  };

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

  // Count placed occurrences per digit (1 to 6)
  const digitCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const v = grid[r][c];
      if (v >= 1 && v <= 6) {
        digitCounts[v]++;
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
    if (filled && conflicts.size === 0 && !isWon && !isSolutionRevealed) {
      let matches = true;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (grid[r][c] !== currentLevel.solution[r][c]) matches = false;
        }
      }
      if (matches) {
        setIsWon(true);
        setShowWinModal(true);
        const winResult = recordPuzzleWin(
          "mini-sudoku",
          difficulty,
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
        if (!isMuted) sounds.playVictory();
      }
    }
  }, [
    grid,
    conflicts.size,
    isWon,
    isSolutionRevealed,
    currentLevel.solution,
    secondsElapsed,
    difficulty,
    mistakesCount,
    isMuted,
  ]);

  // Handle number input
  const inputNumber = (num: number) => {
    if (isWon || !selectedCell) return;
    const [r, c] = selectedCell;
    if (currentLevel.givens[r][c] !== 0) return; // locked cell

    if (!hasStarted) setHasStarted(true);

    if (notesMode) {
      const key = `${r},${c}`;
      const curNotes = notes[key] || [];
      const updatedNotes = curNotes.includes(num)
        ? curNotes.filter((n) => n !== num)
        : [...curNotes, num].sort();
      setNotes((prev) => ({ ...prev, [key]: updatedNotes }));
      if (!isMuted) sounds.playClick();
    } else {
      setHistory((prev) => [...prev, grid.map((row) => [...row])]);
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      setHighlightNum(num);

      if (num !== currentLevel.solution[r][c]) {
        setMistakesCount((prev) => prev + 1);
        if (!isMuted) sounds.playMistake();
      } else {
        if (!isMuted) sounds.playMoveSuccess();
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
    if (!isMuted) sounds.playClick();
  };

  // Keyboard navigation & input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= "1" && e.key <= "6") {
        inputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleErase();
      } else if (e.key === "n" || e.key === "N") {
        setNotesMode((prev) => !prev);
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCell((prev) => (prev ? [Math.max(0, prev[0] - 1), prev[1]] : [0, 0]));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCell((prev) => (prev ? [Math.min(5, prev[0] + 1), prev[1]] : [0, 0]));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedCell((prev) => (prev ? [prev[0], Math.max(0, prev[1] - 1)] : [0, 0]));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
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
    if (!isMuted) sounds.playUndo();
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
    setIsSolutionRevealed(false);
    if (!isMuted) sounds.playClick();
  };

  const handleRevealSolution = () => {
    setGrid(currentLevel.solution.map((r) => [...r]));
    setNotes({});
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

  const handleHint = () => {
    const [sr, sc] = selectedCell || [0, 0];
    if (grid[sr][sc] === 0) {
      inputNumber(currentLevel.solution[sr][sc]);
      if (!isMuted) sounds.playHint();
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
          if (!isMuted) sounds.playHint();
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
        <li>Fill every empty cell with digits <strong>1 through 6</strong>.</li>
        <li>Every row must contain digits 1-6 with no repeats.</li>
        <li>Every column must contain digits 1-6 with no repeats.</li>
        <li>Each outlined <strong>2x3 block</strong> (2 rows by 3 columns) must contain digits 1-6.</li>
      </ul>
      <p className="text-xs text-white/60 flex items-center gap-1.5 pt-1">
        <Lightbulb size={13} className="text-[#00f0ff] shrink-0" />
        <span><strong>Pro-Tip:</strong> Toggle Notes mode (or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#00f0ff]">N</kbd>) to jot down candidates. Arrow keys navigate cells, and number keys (1-6) enter values.</span>
      </p>
    </>
  );

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <PuzzleHeader
        meta={meta}
        levelNames={DIFFICULTIES.map((d) => `Difficulty: ${d}`)}
        currentLevelIndex={DIFFICULTIES.indexOf(difficulty)}
        onSelectLevel={(idx) => handleDifficultyChange(DIFFICULTIES[idx])}
        secondsElapsed={secondsElapsed}
        mistakesCount={mistakesCount}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
        isSoundMuted={isMuted}
        soundProfile={soundProfile}
        onChangeSoundProfile={handleSoundProfileChange}
        onToggleSound={handleToggleSound}
        onNewPuzzle={handleRandomPuzzle}
        onRevealSolution={handleRevealSolution}
        isSolutionRevealed={isSolutionRevealed}
        challengeInfo={challengeInfo}
      />

      {/* Difficulty & Generator Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-[#00f0ff]" />
          <span className="text-white/60 font-semibold uppercase tracking-wider">Difficulty:</span>
        </div>
        <div className="flex items-center gap-1 bg-[#06061f] p-1 rounded-lg border border-white/10">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              className={`px-3 py-1 rounded-md transition-all text-xs font-bold ${
                difficulty === diff
                  ? "bg-[#fec01f] text-black shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDailyPuzzle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors text-[11px]"
            title="Load today's synchronized daily Mini Sudoku seed"
          >
            <Calendar size={12} />
            <span>Daily</span>
          </button>
          <button
            onClick={handleRandomPuzzle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 transition-colors text-[11px] font-bold"
            title="Generate a brand new unique Mini Sudoku level"
          >
            <Shuffle size={11} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Mini Sudoku Grid (Fluid Responsive Container) */}
      <div className="flex justify-center py-1 px-1">
        <div className="w-full max-w-[min(94vw,390px)] aspect-square p-2 sm:p-3 rounded-2xl bg-[#080820] border-2 border-white/20 shadow-2xl relative">
          <div className="w-full h-full grid grid-cols-6 border-2 border-white/30 bg-[#06061f] rounded-xl overflow-hidden shadow-inner">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isGiven = currentLevel.givens[r][c] !== 0;
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isConflict = conflicts.has(`${r},${c}`);
                const isSameNum = highlightNum !== null && val === highlightNum && val !== 0;
                const cellNotes = notes[`${r},${c}`] || [];

                // Crosshair check (same row, col, or 2x3 block)
                const inSameRow = selectedCell?.[0] === r;
                const inSameCol = selectedCell?.[1] === c;
                const inSameBlock =
                  selectedCell !== null &&
                  Math.floor(selectedCell[0] / 2) === Math.floor(r / 2) &&
                  Math.floor(selectedCell[1] / 3) === Math.floor(c / 3);
                const isInCrosshair = !isSelected && (inSameRow || inSameCol || inSameBlock);

                // 2x3 block borders
                const borderBottom =
                  (r + 1) % 2 === 0 && r !== 5
                    ? "border-b-2 border-b-white/50"
                    : "border-b border-b-white/10";
                const borderRight =
                  (c + 1) % 3 === 0 && c !== 5
                    ? "border-r-2 border-r-white/50"
                    : "border-r border-r-white/10";

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      setSelectedCell([r, c]);
                      if (val !== 0) setHighlightNum(val);
                      if (!isMuted) sounds.playClick();
                    }}
                    className={`w-full h-full aspect-square flex items-center justify-center font-mono font-bold text-base sm:text-xl transition-all relative ${borderBottom} ${borderRight} ${
                      isSelected
                        ? "bg-[#fec01f]/25 ring-2 ring-[#fec01f] ring-inset z-10"
                        : isConflict
                        ? "bg-rose-950/70 text-rose-300 ring-2 ring-rose-500 animate-pulse"
                        : isSameNum
                        ? "bg-[#00f0ff]/20 text-[#00f0ff] ring-1 ring-[#00f0ff]/40"
                        : isInCrosshair
                        ? "bg-white/[0.04]"
                        : "hover:bg-white/[0.08]"
                    } ${
                      isGiven
                        ? "text-white font-extrabold"
                        : val !== 0
                        ? "text-[#fec01f] font-semibold"
                        : "text-white/40"
                    }`}
                  >
                    {val !== 0 ? (
                      val
                    ) : (
                      // Render notes inside empty cell
                      <div className="grid grid-cols-3 gap-0.5 text-[7px] sm:text-[9px] text-white/50 leading-none pointer-events-none p-0.5 w-full h-full place-items-center">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <span
                            key={num}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 flex items-center justify-center rounded-sm ${
                              cellNotes.includes(num)
                                ? highlightNum === num
                                ? "text-[#00f0ff] font-bold bg-[#00f0ff]/20"
                                : "text-white/80 font-medium"
                              : ""
                            }`}
                          >
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
        <div className="flex items-center justify-center gap-2 text-rose-300 font-mono text-xs bg-rose-950/30 border border-rose-800/40 py-2 px-3 rounded-lg">
          <AlertTriangle size={14} className="shrink-0 text-rose-400" />
          <span>Duplicate detected in row, column, or 2×3 partition!</span>
        </div>
      )}

      {/* Keypad & Controls */}
      <div className="space-y-3">
        {/* Digits 1-6 with occurrence count badges */}
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const count = digitCounts[num] || 0;
            const remaining = Math.max(0, 6 - count);
            const isComplete = remaining === 0;

            return (
              <button
                key={num}
                onClick={() => inputNumber(num)}
                className={`relative h-14 rounded-xl border font-mono font-bold text-lg sm:text-xl transition-all shadow-md active:scale-95 flex flex-col items-center justify-center ${
                  isComplete
                    ? "bg-white/[0.03] border-emerald-500/30 text-emerald-400/80 hover:bg-emerald-500/10"
                    : "bg-white/[0.06] hover:bg-[#fec01f] hover:text-black border-white/15 hover:border-[#fec01f] text-white"
                }`}
              >
                <span>{num}</span>
                <span className="text-[9px] font-mono -mt-0.5">
                  {isComplete ? (
                    <Check size={10} className="inline text-emerald-400 stroke-[3]" />
                  ) : (
                    <span className="text-white/40">{remaining} left</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Toggles: Notes & Erase */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setNotesMode(!notesMode);
              if (!isMuted) sounds.playClick();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
              notesMode
                ? "bg-[#fec01f] text-black font-bold border-[#fec01f] shadow-md shadow-[#fec01f]/20"
                : "bg-white/5 hover:bg-white/10 text-white/70 border-white/15"
            }`}
          >
            <Edit3 size={14} />
            <span>Notes: {notesMode ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={handleErase}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/70 border border-white/15 transition-colors"
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
          hasNextLevel={true}
          onNextLevel={() => handleRandomPuzzle()}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
          isNewBestTime={isNewBestTime}
          currentStreak={currentStreak}
          pointsEarned={pointsEarned}
          arenaBonusPoints={arenaBonusPoints}
          speedTier={speedTier}
          newCodexCard={newCodexCard}
          onOpenCodex={onOpenCodex}
          levelSeed={levelSeed}
          challengeInfo={challengeInfo}
          educationalFact="Mini Sudoku demonstrates deterministic state machine verification and constraint propagation—analogous to how double-entry distributed ledgers validate that debits and credits balance across all account partitions without contradiction."
        />
      )}
    </div>
  );
}
