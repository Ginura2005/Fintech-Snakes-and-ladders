"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Clock,
  Sparkles,
  Brain,
  ArrowRight,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { PuzzleId } from "./puzzleTypes";
import { PUZZLES_META } from "./puzzleData";
import PuzzleIcon from "./PuzzleIcon";
import {
  getPuzzleStats,
  toggleGlobalPuzzleMute,
  getArenaPuzzleBonus,
  PuzzleStatsData,
} from "@/lib/puzzles/puzzle-storage";

interface PuzzleHubProps {
  onSelectPuzzle: (id: PuzzleId) => void;
}

export default function PuzzleHub({ onSelectPuzzle }: PuzzleHubProps) {
  const [stats, setStats] = useState<PuzzleStatsData>(() => getPuzzleStats());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getPuzzleStats());
  }, []);

  const handleToggleMute = () => {
    const next = toggleGlobalPuzzleMute();
    setStats((prev) => ({ ...prev, soundMuted: next }));
  };

  // Formatted today date
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const arenaBonus = getArenaPuzzleBonus(stats);

  // Helper to format best time in seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Quick random daily puzzle launcher
  const handleDailyShuffle = () => {
    const list: PuzzleId[] = ["queens", "tango", "pinpoint", "crossclimb", "zip", "mini-sudoku"];
    const randomPick = list[Math.floor(Math.random() * list.length)];
    onSelectPuzzle(randomPick);
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e0e38] via-white/[0.03] to-transparent p-6 sm:p-10 text-center shadow-2xl">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#fec01f]/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 w-80 h-80 bg-[#00f0ff]/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="section-badge section-badge-primary">
              LINKEDIN DAILY LOGIC SUITE
            </span>
            <span className="section-badge section-badge-teal">
              SRI LANKA FINTECH FESTIVAL 2026
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Daily Coffee-Break <span className="text-[#fec01f]">Brain Games</span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Experience LinkedIn&apos;s most viral daily logic games reimagined for the FinTechverse.
            Test spatial deduction, binary parity, word ladders, and single-trail pathing while learning real-world digital finance concepts.
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono tracking-wider text-white/70">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm">
              <Calendar size={13} className="text-[#00f0ff]" />
              <span className="text-white/90">{todayStr}</span>
            </div>

            {mounted && (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Flame size={14} className="text-amber-400 fill-amber-400/40" />
                  <span className="font-bold">{stats.currentStreak} Day Streak</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <Trophy size={14} className="text-emerald-400" />
                  <span className="font-bold">{stats.totalWins} Puzzles Solved</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fec01f]/10 border border-[#fec01f]/25 text-[#fec01f]">
                  <Sparkles size={14} className="text-[#fec01f]" />
                  <span className="font-bold">{stats.totalPuzzlePoints || 0} Challenge Pts</span>
                </div>

                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#00f0ff]"
                  title="Modest score boost applied to your main Snakes & Ladders matches (tiered bonus by difficulty: Easy +5, Medium +10, Hard +15, up to +50 pts max)"
                >
                  <Zap size={13} className="text-[#00f0ff] fill-[#00f0ff]/40" />
                  <span className="font-bold">+{arenaBonus} / 50 Arena Bonus</span>
                </div>
              </>
            )}

            <button
              onClick={handleToggleMute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
              title={stats.soundMuted ? "Unmute audio effects" : "Mute audio effects"}
            >
              {stats.soundMuted ? (
                <>
                  <VolumeX size={13} className="text-rose-400" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 size={13} className="text-emerald-400" />
                  <span>Audio ON</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge Spotlight */}
      <div className="relative overflow-hidden rounded-2xl border border-[#00f0ff]/30 bg-gradient-to-r from-[#00f0ff]/10 via-purple-500/5 to-[#fec01f]/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-[10px] uppercase font-bold tracking-widest border border-[#00f0ff]/40">
              Synchronized Daily Seed
            </span>
            <span className="text-xs text-white/50 font-mono">Resets daily at 00:00 UTC</span>
          </div>
          <h2 className="text-lg font-heading font-bold text-white">
            Ready for your daily logic streak?
          </h2>
          <p className="text-xs text-white/60 max-w-xl">
            Every game is seeded deterministically from today&apos;s date. Solving puzzles also contributes an Arena Intel bonus (tiered by difficulty: Easy +5, Medium +10, Hard +15, up to +50 pts max) added directly to your Snakes & Ladders match score.
          </p>
        </div>

        <button
          onClick={handleDailyShuffle}
          className="interactive-btn interactive-btn--primary px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 shrink-0 shadow-lg shadow-[#fec01f]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Zap size={14} className="fill-current" />
          <span>Launch Today&apos;s Challenge</span>
        </button>
      </div>

      {/* Grid of 6 LinkedIn Puzzles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Choose Your Puzzle
            </h2>
            <p className="text-xs text-white/50 font-mono">
              6 official games · Endless procedural generation · Real-world FinTech themes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PUZZLES_META.map((puzzle) => {
            // Check if player has solved this puzzle
            const puzzleWinsKeys = Object.keys(stats.completedLevels).filter((k) =>
              k.startsWith(`${puzzle.id}-`)
            );
            const isSolved = puzzleWinsKeys.length > 0;

            // Find best time
            const times = Object.entries(stats.bestTimes)
              .filter(([k]) => k.startsWith(`${puzzle.id}-`))
              .map(([, v]) => v);
            const bestTime = times.length > 0 ? Math.min(...times) : null;

            return (
              <div
                key={puzzle.id}
                className="festival-card p-6 flex flex-col justify-between group hover:border-[#fec01f]/60 transition-all cursor-pointer relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04]"
                onClick={() => onSelectPuzzle(puzzle.id)}
              >
                {/* Card top badge & icon */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/15 bg-white/5 group-hover:scale-110 transition-transform shadow-inner"
                      style={{
                        boxShadow: `0 0 24px ${puzzle.color}25`,
                      }}
                    >
                      <PuzzleIcon id={puzzle.id} size={28} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-white/70">
                        {puzzle.badge}
                      </span>
                      {isSolved && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 size={10} />
                          <span>Solved</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Titles */}
                  <h3 className="font-heading text-xl font-bold text-white group-hover:text-[#fec01f] transition-colors mb-1">
                    {puzzle.title}
                  </h3>
                  <p className="font-mono text-xs text-[#fec01f]/90 mb-3 font-semibold">
                    {puzzle.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-white/65 leading-relaxed mb-6">
                    {puzzle.description}
                  </p>
                </div>

                {/* Card footer details & CTA */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-col text-xs font-mono text-white/50">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        <span>{puzzle.estimatedTime}</span>
                      </span>
                      <span>•</span>
                      <span>{puzzle.difficulty}</span>
                    </div>
                    {bestTime !== null && (
                      <span className="text-[11px] text-[#00f0ff] font-semibold mt-0.5 inline-flex items-center gap-1">
                        <Zap size={11} />
                        <span>Best: {formatTime(bestTime)}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPuzzle(puzzle.id);
                    }}
                    className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-2 px-3.5 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Play</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why LinkedIn Puzzles Section */}
      <div className="festival-panel p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#fec01f]" />
          <h3 className="font-heading font-bold text-lg text-white">
            Why We Built LinkedIn Puzzles for Lanka FinTechverse
          </h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
          LinkedIn revolutionized professional downtime by introducing quick, tactile logic puzzles designed for coffee breaks.
          For the Sri Lanka FinTech Festival 2026, we incorporated all 6 signature LinkedIn games into our arena—infused with digital payments,
          banking trivia, and algorithmic challenges. Play daily, share your scores with colleagues, and warm up your strategic instincts!
        </p>
      </div>
    </div>
  );
}
