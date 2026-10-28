"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, RotateCcw, Check, Flag, Shuffle, Volume2, VolumeX } from "lucide-react";
import { ZipLevel, ZipWaypoint } from "./puzzleTypes";
import { generateZipLevel } from "@/lib/puzzles/zip-engine";
import { getDailyPuzzleSeed } from "@/lib/puzzles/prng";
import { recordPuzzleWin, getPuzzleStats, toggleGlobalPuzzleMute } from "@/lib/puzzles/puzzle-storage";
import { sounds } from "@/lib/audio/sound-effects";
import { PUZZLES_META } from "./puzzleData";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleWinModal from "./PuzzleWinModal";

const ZIP_SIZES: Array<{ label: string; size: 5 | 6 | 7 }> = [
  { label: "5×5 Easy", size: 5 },
  { label: "6×6 Medium", size: 6 },
  { label: "7×7 Hard", size: 7 },
];

export default function ZipGame({ onBackToHub }: { onBackToHub: () => void }) {
  const meta = PUZZLES_META.find((p) => p.id === "zip")!;
  const [sizeIndex, setSizeIndex] = useState(0);
  const currentSize = ZIP_SIZES[sizeIndex].size;

  const [levelSeed, setLevelSeed] = useState(() => getDailyPuzzleSeed());
  const [currentLevel, setCurrentLevel] = useState<ZipLevel>(() =>
    generateZipLevel(currentSize, getDailyPuzzleSeed())
  );
  const { rows, cols, waypoints } = currentLevel;
  const totalCells = rows * cols;

  // Find start waypoint (step 1)
  const startWp = waypoints.find((w) => w.step === 1)!;

  // Path of cells: array of [r, c]
  const [path, setPath] = useState<[number, number][]>([[startWp.row, startWp.col]]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(() => getPuzzleStats().soundMuted);

  const isDraggingRef = useRef(false);

  // Map of waypoint positions to step
  const waypointMap = new Map<string, number>();
  waypoints.forEach((w) => {
    waypointMap.set(`${w.row},${w.col}`, w.step);
  });

  // Reset on level change or seed change
  useEffect(() => {
    const level = generateZipLevel(currentSize, levelSeed);
    setCurrentLevel(level);
    const sw = level.waypoints.find((w) => w.step === 1)!;
    setPath([[sw.row, sw.col]]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
    setIsNewBestTime(false);
  }, [currentSize, levelSeed]);

  // Timer
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Track which step we need to hit next
  const waypointsHit: number[] = [];
  for (const [r, c] of path) {
    const wp = waypointMap.get(`${r},${c}`);
    if (wp) waypointsHit.push(wp);
  }
  const lastWaypointHit = waypointsHit.length > 0 ? Math.max(...waypointsHit) : 1;
  const nextRequiredWaypoint = lastWaypointHit + 1;

  // Check win condition: path covers all cells and final waypoint is reached
  useEffect(() => {
    if (path.length === totalCells && lastWaypointHit === waypoints.length && !isWon) {
      setIsWon(true);
      setShowWinModal(true);
      if (!isMuted) sounds.playVictory();

      const { isNewBestTime: isBest, newStreak } = recordPuzzleWin(
        "zip",
        currentSize.toString(),
        secondsElapsed
      );
      setIsNewBestTime(isBest);
      setCurrentStreak(newStreak);
    }
  }, [path.length, totalCells, lastWaypointHit, waypoints.length, isWon, currentSize, secondsElapsed, isMuted]);

  // Extend or rewind path
  const tryMoveTo = (r: number, c: number) => {
    if (isWon) return;
    if (!hasStarted) setHasStarted(true);

    const cellKey = `${r},${c}`;
    const head = path[path.length - 1];

    // Check if clicking on an earlier step in path -> Rewind!
    const existingIndex = path.findIndex(([pr, pc]) => pr === r && pc === c);
    if (existingIndex !== -1) {
      if (existingIndex < path.length - 1) {
        setPath(path.slice(0, existingIndex + 1));
        if (!isMuted) sounds.playClick();
      }
      return;
    }

    // Check adjacency with head
    const dr = Math.abs(head[0] - r);
    const dc = Math.abs(head[1] - c);
    const isAdjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    if (!isAdjacent) return;

    // Check if cell has waypoint
    const wpStep = waypointMap.get(cellKey);
    if (wpStep !== undefined) {
      if (wpStep !== nextRequiredWaypoint) {
        return; // cannot skip ahead or revisit
      }
      if (!isMuted) sounds.playMoveSuccess();
    } else {
      if (!isMuted) sounds.playClick();
    }

    setPath([...path, [r, c]]);
  };

  const handleReset = () => {
    setPath([[startWp.row, startWp.col]]);
    setSecondsElapsed(0);
    setHasStarted(false);
    setIsWon(false);
    setShowWinModal(false);
  };

  const handleNewPuzzle = () => {
    setLevelSeed(Math.floor(Math.random() * 1000000) + 1);
  };

  const handleHint = () => {
    const sol = currentLevel.solutionPath;
    if (path.length < sol.length) {
      setPath(sol.slice(0, path.length + 1));
      if (!isMuted) sounds.playMoveSuccess();
    }
  };

  const handleToggleSound = () => {
    const muted = toggleGlobalPuzzleMute();
    setIsMuted(muted);
  };

  const rulesContent = (
    <>
      <p>
        <strong>Zip</strong> is LinkedIn&apos;s continuous single-path maze puzzle:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Start at waypoint <strong className="text-[#fec01f]">1</strong>.</li>
        <li>Draw a single unbroken line that visits waypoints <strong>1 → 2 → 3 → ...</strong> in strict numerical order.</li>
        <li>No diagonals: move orthogonally (up, down, left, right).</li>
        <li>
          <strong className="text-rose-400">Exhaustive:</strong> The path must visit <strong>every single square</strong> on the entire board without any overlaps!
        </li>
        <li>Click any previously visited square to rewind your trail back to that point.</li>
      </ul>
    </>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PuzzleHeader
        meta={meta}
        levelNames={ZIP_SIZES.map((s) => s.label)}
        currentLevelIndex={sizeIndex}
        onSelectLevel={setSizeIndex}
        secondsElapsed={secondsElapsed}
        movesCount={path.length}
        onReset={handleReset}
        onHint={handleHint}
        canHint={!isWon}
        onNewPuzzle={handleNewPuzzle}
        isSoundMuted={isMuted}
        onToggleSound={handleToggleSound}
        onBackToHub={onBackToHub}
        rulesContent={rulesContent}
      />

      {/* Progress Bar & Live Coverage */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white/70">
            Coverage: <strong className="text-[#fec01f]">{path.length}</strong> / {totalCells} squares (
            {Math.round((path.length / totalCells) * 100)}%)
          </span>
          <span className="text-white/70">
            Target:{" "}
            <strong className="text-teal-300">
              {nextRequiredWaypoint <= waypoints.length
                ? `Waypoint #${nextRequiredWaypoint}`
                : "Complete Grid!"}
            </strong>
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#fec01f] via-rose-500 to-teal-400 transition-all duration-200"
            style={{ width: `${(path.length / totalCells) * 100}%` }}
          />
        </div>
      </div>

      {/* Zip Grid */}
      <div className="flex justify-center py-2">
        <div
          className="relative inline-grid p-3.5 rounded-2xl bg-[#070720] border-2 border-white/15 shadow-2xl select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: "0.5rem",
          }}
          onMouseDown={() => {
            isDraggingRef.current = true;
          }}
          onMouseUp={() => {
            isDraggingRef.current = false;
          }}
          onMouseLeave={() => {
            isDraggingRef.current = false;
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const key = `${r},${c}`;
              const wpStep = waypointMap.get(key);
              const pathIndex = path.findIndex(([pr, pc]) => pr === r && pc === c);
              const isVisited = pathIndex !== -1;
              const isHead =
                path.length > 0 &&
                path[path.length - 1][0] === r &&
                path[path.length - 1][1] === c;

              const cellSizeClass =
                rows === 5
                  ? "w-12 h-12 sm:w-16 sm:h-16"
                  : rows === 6
                  ? "w-11 h-11 sm:w-14 sm:h-14"
                  : "w-9 h-9 sm:w-12 sm:h-12";

              return (
                <button
                  key={key}
                  onClick={() => tryMoveTo(r, c)}
                  onMouseEnter={() => {
                    if (isDraggingRef.current) tryMoveTo(r, c);
                  }}
                  className={`${cellSizeClass} rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all relative ${
                    isHead
                      ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.8)] scale-105 z-10 animate-pulse"
                      : isVisited
                      ? "bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-white/50 border border-white/10"
                  }`}
                >
                  {/* Waypoint Badge */}
                  {wpStep !== undefined ? (
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                        isVisited
                          ? "bg-[#fec01f] text-black shadow-[0_0_8px_rgba(254,192,31,0.6)]"
                          : wpStep === nextRequiredWaypoint
                          ? "bg-teal-500 text-white ring-2 ring-teal-400 animate-pulse"
                          : "bg-white/15 text-white/90 border border-white/30"
                      }`}
                    >
                      {wpStep}
                    </div>
                  ) : isVisited ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fec01f]/70" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="text-center text-xs font-mono text-white/50">
        <span>Click or drag through squares · Click earlier square to rewind path</span>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <PuzzleWinModal
          meta={meta}
          levelName={currentLevel.name}
          secondsElapsed={secondsElapsed}
          movesCount={path.length}
          isNewBestTime={isNewBestTime}
          currentStreak={currentStreak}
          hasNextLevel={sizeIndex < ZIP_SIZES.length - 1}
          onNextLevel={() => setSizeIndex((p) => p + 1)}
          onReplay={handleReset}
          onBackToHub={onBackToHub}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
}
