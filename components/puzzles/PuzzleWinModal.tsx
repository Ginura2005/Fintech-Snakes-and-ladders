"use client";

import { useState } from "react";
import { Award, Share2, Check, ArrowRight, RotateCcw, Grid, Flame, Trophy, Sparkles } from "lucide-react";
import { PuzzleMeta } from "./puzzleTypes";

interface PuzzleWinModalProps {
  meta: PuzzleMeta;
  levelName: string;
  secondsElapsed: number;
  movesCount?: number;
  mistakesCount?: number;
  isNewBestTime?: boolean;
  currentStreak?: number;
  educationalFact?: string;
  hasNextLevel: boolean;
  onNextLevel?: () => void;
  onReplay: () => void;
  onBackToHub: () => void;
  onClose: () => void;
}

export default function PuzzleWinModal({
  meta,
  levelName,
  secondsElapsed,
  movesCount,
  mistakesCount,
  isNewBestTime = false,
  currentStreak,
  educationalFact,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onBackToHub,
  onClose,
}: PuzzleWinModalProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getStarRating = () => {
    if (typeof mistakesCount === "number") {
      if (mistakesCount === 0) return "⭐⭐⭐";
      if (mistakesCount <= 2) return "⭐⭐";
      return "⭐";
    }
    if (secondsElapsed < 90) return "⭐⭐⭐";
    if (secondsElapsed < 180) return "⭐⭐";
    return "⭐";
  };

  const shareText = `Lanka FinTechverse Puzzles ${meta.icon}
Solved ${meta.title} — ${levelName} in ${formatTime(secondsElapsed)}!
Rating: ${getStarRating()}${typeof movesCount === "number" ? ` · ${movesCount} moves` : ""}
Play LinkedIn-style puzzles at fintechfestival.lk/puzzles`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="festival-panel max-w-md w-full p-6 sm:p-8 space-y-5 border border-[#fec01f]/40 shadow-[0_0_50px_rgba(254,192,31,0.2)] text-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#fec01f]/15 rounded-full blur-3xl" />

        {/* Big Icon */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#fec01f]/20 to-teal-500/20 border border-[#fec01f]/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner animate-bounce">
          {meta.icon}
        </div>

        {/* Win Title */}
        <div className="space-y-1">
          <span className="section-badge section-badge-primary">
            PUZZLE SOLVED!
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Brilliant Victory!
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-white/60">
            {meta.title} · {levelName}
          </p>
        </div>

        {/* Badges for New Best Time & Streak */}
        <div className="flex items-center justify-center gap-2">
          {isNewBestTime && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#fec01f]/20 border border-[#fec01f] text-[#fec01f] animate-pulse">
              <Trophy size={13} /> New Best Time!
            </span>
          )}
          {typeof currentStreak === "number" && currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 border border-rose-500 text-rose-300">
              <Flame size={13} /> {currentStreak} Day Streak
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="p-2">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-white/50">
              Clear Time
            </span>
            <span className="font-mono text-lg font-bold text-[#fec01f]">
              {formatTime(secondsElapsed)}
            </span>
          </div>

          <div className="p-2">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-white/50">
              Score Rating
            </span>
            <span className="font-mono text-base font-bold text-amber-300">
              {getStarRating()}
            </span>
          </div>

          <div className="p-2 col-span-2 sm:col-span-1">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-white/50">
              {typeof mistakesCount === "number" ? "Mistakes" : "Moves"}
            </span>
            <span className="font-mono text-lg font-bold text-teal-400">
              {typeof mistakesCount === "number" ? mistakesCount : (movesCount ?? "-")}
            </span>
          </div>
        </div>

        {/* Educational Fact / Takeaway Card if available */}
        {educationalFact && (
          <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-teal-300 font-mono text-[10px] uppercase tracking-wider font-bold">
              <Sparkles size={12} />
              <span>FinTech Intelligence Takeaway</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {educationalFact}
            </p>
          </div>
        )}

        {/* LinkedIn-style Share Preview */}
        <div className="text-left p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-white/70 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 pb-1 border-b border-white/5">
            <span>Shareable Result</span>
            <span>LinkedIn Style</span>
          </div>
          <p className="font-bold text-white/90">Lanka FinTechverse Puzzles {meta.icon}</p>
          <p>Solved {meta.title} in {formatTime(secondsElapsed)} {getStarRating()}</p>
          <p className="text-[11px] text-[#fec01f]/80">fintechfestival.lk/puzzles</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCopy}
            className="w-full interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-3 flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy LinkedIn Score"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {hasNextLevel && onNextLevel ? (
              <button
                onClick={onNextLevel}
                className="interactive-btn interactive-btn--outline text-xs uppercase tracking-wider py-2.5 flex items-center justify-center gap-1.5"
              >
                <span>Next Puzzle</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={onReplay}
                className="interactive-btn interactive-btn--outline text-xs uppercase tracking-wider py-2.5 flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Replay</span>
              </button>
            )}

            <button
              onClick={onBackToHub}
              className="p-2.5 rounded-lg border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white hover:border-[#fec01f] transition-colors flex items-center justify-center gap-1.5"
            >
              <Grid size={14} />
              <span>All Puzzles</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-white/50 hover:text-white transition-colors underline underline-offset-4"
          >
            Inspect Solved Board
          </button>
        </div>
      </div>
    </div>
  );
}
