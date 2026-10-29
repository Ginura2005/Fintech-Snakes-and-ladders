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
  Volume1,
  VolumeX,
  Calendar,
  CheckCircle2,
  Zap,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { PuzzleId } from "./puzzleTypes";
import { PUZZLES_META } from "./puzzleData";
import PuzzleIcon from "./PuzzleIcon";
import {
  getPuzzleStats,
  getArenaPuzzleBonus,
  PuzzleStatsData,
  getDailyProgress,
  getGlobalSoundProfile,
  setGlobalSoundProfile,
} from "@/lib/puzzles/puzzle-storage";
import { SoundProfile } from "@/lib/audio/sound-effects";
import PuzzleArchiveModal from "./PuzzleArchiveModal";
import FintechCodexDrawer from "./FintechCodexDrawer";

interface PuzzleHubProps {
  onSelectPuzzle: (id: PuzzleId, dateStr?: string) => void;
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export default function PuzzleHub({
  onSelectPuzzle,
  selectedDate: propDate,
  onSelectDate: propOnSelectDate,
}: PuzzleHubProps) {
  const [stats, setStats] = useState<PuzzleStatsData>(() => getPuzzleStats());
  const [mounted, setMounted] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [soundProfile, setSoundProfileState] = useState<SoundProfile>("arcade");

  const todayStr = new Date().toISOString().split("T")[0];
  const [activeDate, setActiveDate] = useState<string>(propDate || todayStr);

  useEffect(() => {
    setMounted(true);
    const loadedStats = getPuzzleStats();
    setStats(loadedStats);
    setSoundProfileState(getGlobalSoundProfile());
  }, []);

  const handleCycleSound = () => {
    const next: SoundProfile =
      soundProfile === "arcade"
        ? "subtle"
        : soundProfile === "subtle"
        ? "muted"
        : "arcade";
    setGlobalSoundProfile(next);
    setSoundProfileState(next);
    setStats((prev) => ({ ...prev, soundProfile: next, soundMuted: next === "muted" }));
  };

  const handleSelectDate = (dateStr: string) => {
    setActiveDate(dateStr);
    propOnSelectDate?.(dateStr);
    setShowArchive(false);
  };

  // Formatted active date string
  const [ay, am, ad] = activeDate.split("-").map(Number);
  const activeDateObj = new Date(ay, am - 1, ad);
  const activeDateFormatted = activeDateObj.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isToday = activeDate === todayStr;
  const dailyProgress = getDailyProgress(activeDate, stats);
  const arenaBonus = getArenaPuzzleBonus(stats);
  const unlockedCodexCount = stats.unlockedCodexCards?.length || 0;

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
    onSelectPuzzle(randomPick, activeDate);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Active Archive Date Notification Banner (if viewing past date) */}
      {!isToday && (
        <div className="p-3.5 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center font-bold">
              <Calendar size={15} />
            </span>
            <div>
              <span className="text-white/60 text-[10px] uppercase tracking-wider block">
                Time Machine Active
              </span>
              <span className="font-bold text-white">
                Playing Archive Seed for {activeDateFormatted}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSelectDate(todayStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 uppercase font-bold text-[11px] transition-colors"
          >
            <RotateCcw size={12} />
            <span>Return to Today</span>
          </button>
        </div>
      )}

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
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-mono tracking-wider text-white/70">
            {/* Archive / Date Picker Trigger */}
            <button
              onClick={() => setShowArchive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm transition-colors text-white/90"
              title="Open Daily Archive & Time Machine"
            >
              <Calendar size={13} className="text-[#00f0ff]" />
              <span>{isToday ? activeDateFormatted : `Archive: ${activeDate}`}</span>
            </button>

            {/* FinTech Codex Drawer Trigger */}
            <button
              onClick={() => setShowCodex(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-sm transition-colors"
              title="Inspect unlocked FinTech Codex cards"
            >
              <BookOpen size={13} className="text-purple-400" />
              <span className="font-bold">{unlockedCodexCount} / 24 Codex</span>
            </button>

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

            {/* 3-State Sound Mode Switcher */}
            <button
              onClick={handleCycleSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
              title={`Audio: ${soundProfile.toUpperCase()} (Click to toggle: Arcade -> Subtle -> Muted)`}
            >
              {soundProfile === "muted" ? (
                <>
                  <VolumeX size={13} className="text-rose-400" />
                  <span>Muted</span>
                </>
              ) : soundProfile === "subtle" ? (
                <>
                  <Volume1 size={13} className="text-[#00f0ff]" />
                  <span>Subtle</span>
                </>
              ) : (
                <>
                  <Volume2 size={13} className="text-emerald-400" />
                  <span>Arcade</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Grand Slam & Trifecta Progress Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#00f0ff]/30 bg-gradient-to-r from-[#00f0ff]/10 via-purple-500/5 to-[#fec01f]/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-[10px] uppercase font-bold tracking-widest border border-[#00f0ff]/40">
              Daily Challenge Seed
            </span>
            <span className="text-xs text-white/50 font-mono">
              {isToday ? "Synchronized daily at 00:00 UTC" : `Historical Archive: ${activeDate}`}
            </span>
          </div>

          <h2 className="text-lg font-heading font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <span>Daily Progress: {dailyProgress.solvedCount} of 6 Solved</span>
            {dailyProgress.isGrandSlam ? (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#fec01f] text-black">
                👑 GRAND SLAM (+35 pts)
              </span>
            ) : dailyProgress.isTrifecta ? (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-400 text-black">
                🌟 TRIFECTA (+15 pts)
              </span>
            ) : null}
          </h2>

          <p className="text-xs text-white/60 max-w-xl">
            Solve any 3 daily puzzles to unlock the <strong>Trifecta Bonus (+15 pts)</strong>. Complete all 6 for the <strong>Grand Slam (+35 pts)</strong> and decrypt rare FinTech Codex intelligence cards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowArchive(true)}
            className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-colors"
          >
            <Calendar size={14} />
            <span className="hidden sm:inline">Archive</span>
          </button>

          <button
            onClick={handleDailyShuffle}
            className="interactive-btn interactive-btn--primary px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-lg shadow-[#fec01f]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Zap size={14} className="fill-current" />
            <span>Launch Next Game</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 LinkedIn Puzzles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Choose Your Puzzle
            </h2>
            <p className="text-xs text-white/50 font-mono">
              6 official games · Scalable Easy/Medium/Hard · Real-world FinTech themes
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
            const isDailySolved = (stats.dailySolves?.[activeDate] || []).includes(puzzle.id);

            // Find best time
            const times = Object.entries(stats.bestTimes)
              .filter(([k]) => k.startsWith(`${puzzle.id}-`))
              .map(([, v]) => v);
            const bestTime = times.length > 0 ? Math.min(...times) : null;

            return (
              <div
                key={puzzle.id}
                className={`festival-card p-6 flex flex-col justify-between group hover:border-[#fec01f]/60 transition-all cursor-pointer relative overflow-hidden ${
                  isDailySolved
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                onClick={() => onSelectPuzzle(puzzle.id, activeDate)}
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
                      {isDailySolved ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 size={10} />
                          <span>Cleared Today</span>
                        </span>
                      ) : isSolved ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
                          <span>Played</span>
                        </span>
                      ) : null}
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
                      onSelectPuzzle(puzzle.id, activeDate);
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

      {/* Daily Archive Modal (Time Machine) */}
      {showArchive && (
        <PuzzleArchiveModal
          stats={stats}
          selectedDate={activeDate}
          onSelectDate={handleSelectDate}
          onClose={() => setShowArchive(false)}
        />
      )}

      {/* FinTech Codex Intelligence Drawer */}
      {showCodex && (
        <FintechCodexDrawer
          unlockedIds={stats.unlockedCodexCards || []}
          onClose={() => setShowCodex(false)}
        />
      )}
    </div>
  );
}
