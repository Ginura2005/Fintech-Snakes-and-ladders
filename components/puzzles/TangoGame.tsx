"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, AlertTriangle, Check, Volume2, VolumeX, Lightbulb } from "lucide-react";
import { TangoLevel, TangoSymbol } from "./puzzleTypes";
import { generateTangoLevel } from "@/lib/puzzles/tango-engine";
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
import { PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

const TANGO_DIFFICULTIES: Array<"Easy" | "Medium" | "Hard"> = [
  "Easy",
  "Medium",
  "Hard",
];

interface ChallengeInfo {
  challengerName: string;
  targetSeconds: number;
  seed: number;
  difficulty?: string;
}

interface TangoGameProps {
  onBackToHub: () => void;
  customSeed?: number;
  challengeInfo?: ChallengeInfo | null;
  dateStr?: string;
  onOpenCodex?: () => void;
}

export default function TangoGame({
  onBackToHub,
  customSeed,
  challengeInfo,
  dateStr,
  onOpenCodex,
}: TangoGameProps) {
  const meta = PUZZLES_META.find((p) => p.id === "tango")!;
  const [diffIndex, setDiffIndex] = useState(() => {
    if (challengeInfo?.difficulty) {
      const match = TANGO_DIFFICULTIES.findIndex((d) =>
        d.toLowerCase() === challengeInfo.difficulty?.toLowerCase()
      );
      if (match >= 0) return match;
    }
    return 1;
  }); // Medium by default
  const difficulty = TANGO_DIFFICULTIES[diffIndex];

  const initialSeed =
    customSeed ||
    (dateStr ? getDailyPuzzleSeed(new Date(dateStr)) : getDailyPuzzleSeed());
  const [levelSeed, setLevelSeed] = useState(() => initialSeed);
  const [currentLevel, setCurrentLevel] = useState<TangoLevel>(() =>
    generateTangoLevel(difficulty, initialSeed)
  );
  const size = currentLevel.size;

  // Board state initialized with givens
  const [board, setBoard] = useState<TangoSymbol[][]>(() =>
    currentLevel.givens.map((r) => [...r])
  );
  const [history, setHistory] = useState<TangoSymbol[][][]>([]);
  const [soundProfile, setSoundProfileState] = useState<SoundProfile>(() => getGlobalSoundProfile());
  const isMuted = soundProfile === "muted";

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

  // Reset / regenerate on difficulty or seed change
  useEffect(() => {
    const level = generateTangoLevel(difficulty, levelSeed);
    setCurrentLevel(level);
    setBoard(level.givens.map((r) => [...r]));
    setHistory([]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setMistakesCount(0);
    setIsNewBestTime(false);
  }, [difficulty, levelSeed]);

  // Timer interval
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Check conflicts & calculate tallies
  const conflictCells = new Set<string>();
  const rowTallies = Array.from({ length: size }, () => ({ s: 0, m: 0 }));
  const colTallies = Array.from({ length: size }, () => ({ s: 0, m: 0 }));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      if (v === "S") {
        rowTallies[r].s++;
        colTallies[c].s++;
      } else if (v === "M") {
        rowTallies[r].m++;
        colTallies[c].m++;
      }
    }
  }

  // Row / Col count overflow
  for (let r = 0; r < size; r++) {
    if (rowTallies[r].s > 3 || rowTallies[r].m > 3) {
      for (let c = 0; c < size; c++) conflictCells.add(`${r},${c}`);
    }
  }
  for (let c = 0; c < size; c++) {
    if (colTallies[c].s > 3 || colTallies[c].m > 3) {
      for (let r = 0; r < size; r++) conflictCells.add(`${r},${c}`);
    }
  }

  // Row consecutive triples
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

  // Col consecutive triples
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

  // Horizontal edges validation
  const brokenHEdges = new Set<string>();
  const satisfiedHEdges = new Set<string>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      const edge = currentLevel.hEdges[r][c];
      if (!edge) continue;
      const v1 = board[r][c], v2 = board[r][c + 1];
      if (v1 && v2) {
        if ((edge === "=" && v1 !== v2) || (edge === "x" && v1 === v2)) {
          conflictCells.add(`${r},${c}`);
          conflictCells.add(`${r},${c + 1}`);
          brokenHEdges.add(`${r},${c}`);
        } else {
          satisfiedHEdges.add(`${r},${c}`);
        }
      }
    }
  }

  // Vertical edges validation
  const brokenVEdges = new Set<string>();
  const satisfiedVEdges = new Set<string>();
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      const edge = currentLevel.vEdges[r][c];
      if (!edge) continue;
      const v1 = board[r][c], v2 = board[r + 1][c];
      if (v1 && v2) {
        if ((edge === "=" && v1 !== v2) || (edge === "x" && v1 === v2)) {
          conflictCells.add(`${r},${c}`);
          conflictCells.add(`${r + 1},${c}`);
          brokenVEdges.add(`${r},${c}`);
        } else {
          satisfiedVEdges.add(`${r},${c}`);
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
    if (filled && conflictCells.size === 0 && !isWon && !isSolutionRevealed) {
      let correct = true;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r][c] !== currentLevel.solution[r][c]) correct = false;
        }
      }
      if (correct) {
        setIsWon(true);
        setShowWinModal(true);
        if (!isMuted) sounds.playVictory();

        const winResult = recordPuzzleWin(
          "tango",
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
      }
    }
  }, [
    board,
    conflictCells.size,
    isWon,
    isSolutionRevealed,
    size,
    currentLevel.solution,
    difficulty,
    secondsElapsed,
    mistakesCount,
    isMuted,
  ]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    if (currentLevel.givens[r][c] !== null) return; // locked

    if (!hasStarted) setHasStarted(true);

    const prevBoard = board.map((row) => [...row]);
    setHistory((prev) => [...prev, prevBoard]);

    const cur = board[r][c];
    let next: TangoSymbol = null;
    if (cur === null) {
      next = "S";
      if (!isMuted) sounds.playClick();
    } else if (cur === "S") {
      next = "M";
      if (!isMuted) sounds.playClick();
    } else {
      next = null;
      if (!isMuted) sounds.playClick();
    }

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
    setIsSolutionRevealed(false);
  };

  const handleNewPuzzle = () => {
    setLevelSeed(Math.floor(Math.random() * 1000000) + 1);
    setIsSolutionRevealed(false);
  };

  const handleHint = () => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === null) {
          const newBoard = board.map((row) => [...row]);
          newBoard[r][c] = currentLevel.solution[r][c];
          setBoard(newBoard);
          setMistakesCount((prev) => prev + 1);
          if (!isMuted) sounds.playMoveSuccess();
          return;
        }
      }
    }
  };

  const handleRevealSolution = () => {
    setBoard(currentLevel.solution.map((r) => [...r]));
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

  const rulesContent = (
    <>
      <p>
        <strong>Tango</strong> is LinkedIn&apos;s celestial binary logic puzzle. The goal is to fill the 6×6 grid with Suns and Moons so that:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Every row has exactly <strong>3 Suns</strong> and <strong>3 Moons</strong>.</li>
        <li>Every column has exactly <strong>3 Suns</strong> and <strong>3 Moons</strong>.</li>
        <li>
          <strong className="text-rose-400">No Triples:</strong> You cannot have 3 identical symbols consecutive in any row or column (no 3 consecutive Suns or Moons).
        </li>
        <li>
          <strong className="text-[#fec01f]">= Clue:</strong> Adjacent cells sharing an &apos;=&apos; sign must have the <strong>same</strong> symbol.
        </li>
        <li>
          <strong className="text-cyan-300">× Clue:</strong> Adjacent cells sharing an &apos;×&apos; sign must have <strong>opposite</strong> symbols.
        </li>
      </ul>
      <p className="text-xs text-white/60 flex items-center gap-1.5 pt-1">
        <Lightbulb size={13} className="text-[#fec01f] shrink-0" />
        <span><strong>Tip:</strong> Look at the edge tallies to see your current Sun and Moon counts for each row and column. They turn green with a checkmark once satisfied!</span>
      </p>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={TANGO_DIFFICULTIES}
        currentLevelIndex={diffIndex}
        onSelectLevel={setDiffIndex}
        secondsElapsed={secondsElapsed}
        mistakesCount={conflictCells.size > 0 ? conflictCells.size : undefined}
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
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto">
        {TANGO_DIFFICULTIES.map((diff, idx) => (
          <button
            key={diff}
            onClick={() => {
              setDiffIndex(idx);
              if (!isMuted) sounds.playClick();
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              diffIndex === idx
                ? diff === "Easy"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : diff === "Medium"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Guide Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#fec01f]">
            <Sun size={15} /> Sun
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Moon size={15} /> Moon
          </span>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <span><strong className="text-[#fec01f]">=</strong> same</span>
          <span><strong className="text-rose-400">×</strong> opposite</span>
          <span>Max 2 in a row</span>
        </div>
      </div>

      {/* Tango Grid with Row / Col Edge Tallies */}
      <div className="flex justify-center py-2 px-1">
        <div className="relative w-full max-w-[min(94vw,400px)] aspect-square p-2.5 sm:p-4 rounded-2xl bg-[#070722] border-2 border-white/15 shadow-2xl">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full h-full">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isGiven = currentLevel.givens[r][c] !== null;
                const isConflict = conflictCells.has(`${r},${c}`);
                const hEdge = c < size - 1 ? currentLevel.hEdges[r][c] : null;
                const vEdge = r < size - 1 ? currentLevel.vEdges[r][c] : null;

                const isHEdgeBroken = brokenHEdges.has(`${r},${c}`);
                const isHEdgeSatisfied = satisfiedHEdges.has(`${r},${c}`);
                const isVEdgeBroken = brokenVEdges.has(`${r},${c}`);
                const isVEdgeSatisfied = satisfiedVEdges.has(`${r},${c}`);

                return (
                  <div key={`${r}-${c}`} className="relative w-full h-full">
                    <button
                      onClick={() => handleCellClick(r, c)}
                      disabled={isGiven}
                      className={`w-full h-full aspect-square rounded-xl flex items-center justify-center text-base sm:text-lg transition-all font-bold ${
                        isGiven
                          ? "bg-white/10 text-white border border-white/25 cursor-not-allowed"
                          : "bg-white/[0.04] hover:bg-white/[0.09] border border-white/10"
                      } ${
                        isConflict
                          ? "ring-2 ring-rose-500 bg-rose-950/40 animate-pulse"
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
                          size={20}
                          className="text-[#fec01f] fill-[#fec01f] drop-shadow-[0_0_6px_rgba(254,192,31,0.8)] animate-scaleIn sm:w-6 sm:h-6"
                        />
                      )}
                      {cell === "M" && (
                        <Moon
                          size={18}
                          className="text-cyan-300 fill-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-scaleIn sm:w-5 sm:h-5"
                        />
                      )}
                    </button>

                    {/* Horizontal Edge Constraint between (r,c) and (r, c+1) */}
                    {hEdge && (
                      <div
                        className={`pointer-events-none absolute top-1/2 -right-2 sm:-right-2.5 -translate-y-1/2 z-20 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#06061f] border flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-bold shadow-md transition-all ${
                          isHEdgeBroken
                            ? "border-rose-500 text-rose-400 animate-pulse"
                            : isHEdgeSatisfied
                            ? "border-teal-500 text-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.6)]"
                            : "border-white/20 text-white"
                        }`}
                      >
                        {hEdge === "=" ? (
                          <span className="text-[#fec01f] leading-none">=</span>
                        ) : (
                          <span className="text-rose-400 leading-none">×</span>
                        )}
                      </div>
                    )}

                    {/* Vertical Edge Constraint between (r,c) and (r+1, c) */}
                    {vEdge && (
                      <div
                        className={`pointer-events-none absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 z-20 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#06061f] border flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-bold shadow-md transition-all ${
                          isVEdgeBroken
                            ? "border-rose-500 text-rose-400 animate-pulse"
                            : isVEdgeSatisfied
                            ? "border-teal-500 text-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.6)]"
                            : "border-white/20 text-white"
                        }`}
                      >
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
          isNewBestTime={isNewBestTime}
          currentStreak={currentStreak}
          pointsEarned={pointsEarned}
          arenaBonusPoints={arenaBonusPoints}
          hasNextLevel={diffIndex < TANGO_DIFFICULTIES.length - 1}
          onNextLevel={() => setDiffIndex((prev) => prev + 1)}
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
