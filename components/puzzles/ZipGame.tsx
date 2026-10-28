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
  const [pointsEarned, setPointsEarned] = useState<number | undefined>(undefined);
  const [arenaBonusPoints, setArenaBonusPoints] = useState<number | undefined>(undefined);
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

      const diffName = ZIP_SIZES[sizeIndex].label.split(" ")[1];
      const { isNewBestTime: isBest, newStreak, pointsEarned: pts, arenaBonusPoints: arenaPts } = recordPuzzleWin(
        "zip",
        diffName,
        secondsElapsed
      );
      setIsNewBestTime(isBest);
      setCurrentStreak(newStreak);
      setPointsEarned(pts);
      setArenaBonusPoints(arenaPts);
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
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([25, 30, 45]);
      }
    } else {
      if (!isMuted) sounds.playClick();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }

    setPath([...path, [r, c]]);
  };

  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    isDraggingRef.current = true;
    tryMoveTo(r, c);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const cellEl = el.closest("[data-cell-coord]");
    if (cellEl) {
      const coord = cellEl.getAttribute("data-cell-coord");
      if (coord) {
        const [r, c] = coord.split(",").map(Number);
        tryMoveTo(r, c);
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleUndoStep = () => {
    if (path.length > 1) {
      setPath(path.slice(0, -1));
      if (!isMuted) sounds.playClick();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(12);
      }
    }
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

      {/* Difficulty Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto">
        {ZIP_SIZES.map((s, idx) => (
          <button
            key={s.label}
            onClick={() => {
              setSizeIndex(idx);
              if (!isMuted) sounds.playClick();
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              sizeIndex === idx
                ? idx === 0
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : idx === 1
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

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

      {/* Zip Grid (Fluid responsive sizing + SVG snake trail + touch drag) */}
      <div className="flex justify-center py-2 px-1">
        <div
          className="relative w-full max-w-[min(94vw,390px)] aspect-square p-2.5 sm:p-3.5 rounded-2xl bg-[#070720] border-2 border-white/15 shadow-2xl select-none touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Neon SVG Path Trace */}
          {path.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 p-2.5 sm:p-3.5"
              viewBox={`0 0 ${cols * 100} ${rows * 100}`}
              preserveAspectRatio="none"
            >
              <polyline
                points={path.map(([r, c]) => `${c * 100 + 50},${r * 100 + 50}`).join(" ")}
                fill="none"
                stroke="#fec01f"
                strokeWidth={cols === 5 ? "16" : cols === 6 ? "13" : "11"}
                strokeOpacity="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={path.map(([r, c]) => `${c * 100 + 50},${r * 100 + 50}`).join(" ")}
                fill="none"
                stroke="#fec01f"
                strokeWidth={cols === 5 ? "6" : cols === 6 ? "5" : "4"}
                strokeOpacity="0.95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          <div
            className="w-full h-full grid relative z-20"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              gap: cols === 7 ? "0.2rem" : "0.35rem",
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

                return (
                  <button
                    key={key}
                    data-cell-coord={`${r},${c}`}
                    onPointerDown={(e) => handlePointerDown(r, c, e)}
                    className={`w-full h-full rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm transition-all relative ${
                      isHead
                        ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.8)] scale-105 z-30 animate-pulse ring-2 ring-white/50"
                        : isVisited
                        ? "bg-[#fec01f]/20 text-[#fec01f] border border-[#fec01f]/40"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-white/50 border border-white/10"
                    }`}
                  >
                    {/* Waypoint Badge */}
                    {wpStep !== undefined ? (
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-md transition-all ${
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
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#fec01f]/80" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile-First Action Bar */}
      <div className="flex items-center justify-between gap-2 max-w-sm mx-auto px-2">
        <button
          onClick={handleUndoStep}
          disabled={path.length <= 1 || isWon}
          className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 font-mono text-xs uppercase font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw size={13} />
          <span>Undo Step</span>
        </button>

        <button
          onClick={handleReset}
          className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs uppercase font-bold text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Clear Path</span>
        </button>

        <button
          onClick={handleHint}
          disabled={isWon}
          className="py-2.5 px-3.5 rounded-xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 font-mono text-xs uppercase font-bold text-[#00f0ff] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Zap size={13} className="fill-current" />
          <span>Hint</span>
        </button>
      </div>

      <div className="text-center text-[11px] font-mono text-white/50 px-2">
        <span>Drag through squares continuously · Tap earlier square or Undo to rewind</span>
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
          pointsEarned={pointsEarned}
          arenaBonusPoints={arenaBonusPoints}
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
