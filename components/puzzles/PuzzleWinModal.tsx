"use client";

import { useState } from "react";
import { Award, Share2, Check, ArrowRight, RotateCcw, Grid, Flame, Trophy, Star } from "lucide-react";
import { PuzzleMeta } from "./puzzleTypes";
import PuzzleIcon from "./PuzzleIcon";

interface PuzzleWinModalProps {
  meta: PuzzleMeta;
  levelName: string;
  secondsElapsed: number;
  movesCount?: number;
  mistakesCount?: number;
  isNewBestTime?: boolean;
  currentStreak?: number;
  educationalFact?: string;
  pointsEarned?: number;
  arenaBonusPoints?: number;
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
  pointsEarned,
  arenaBonusPoints,
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

  const getStarCount = () => {
    if (typeof mistakesCount === "number") {
      if (mistakesCount === 0) return 3;
      if (mistakesCount <= 2) return 2;
      return 1;
    }
    if (secondsElapsed < 90) return 3;
    if (secondsElapsed < 180) return 2;
    return 1;
  };

  const starCount = getStarCount();
  const getStarRatingString = () => "★".repeat(starCount) + "☆".repeat(3 - starCount);

  const shareText = `Lanka FinTechverse Puzzles | ${meta.title}
Solved ${meta.title} — ${levelName} in ${formatTime(secondsElapsed)}!
${typeof pointsEarned === "number" ? `Earned +${pointsEarned} Challenge Points · ` : ""}Rating: ${getStarRatingString()}${typeof movesCount === "number" ? ` · ${movesCount} moves` : ""}
Play daily logic puzzles at fintechfestival.lk/puzzles`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="festival-panel max-w-md w-full max-h-[88dvh] overflow-y-auto p-4 sm:p-8 space-y-3.5 sm:space-y-5 border border-primary/40 text-center relative scrollbar-none pb-safe">
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
          <PuzzleIcon id={meta.id} size={36} />
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
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= starCount ? "fill-[#fec01f] text-[#fec01f]" : "text-white/20"}
                />
              ))}
            </div>
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

        {/* Points Contribution Banner */}
        {typeof pointsEarned === "number" && pointsEarned > 0 && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#fec01f]/15 via-amber-500/10 to-[#00f0ff]/15 border border-[#fec01f]/35 flex items-center justify-between text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fec01f]/20 border border-[#fec01f]/50 flex items-center justify-center text-[#fec01f] shrink-0 shadow-inner">
                <Trophy size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <span>+{pointsEarned} Challenge Points</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#fec01f]/20 text-[#fec01f] font-mono font-bold uppercase tracking-wider">
                    Added
                  </span>
                </div>
                <p className="text-[11px] text-white/70 leading-tight">
                  {typeof arenaBonusPoints === "number" && arenaBonusPoints > 0
                    ? `Contributes to Arena game score (Active Bonus: +${arenaBonusPoints} pts, max 50)`
                    : "Contributes +10 pts to your Arena game score (up to 50 max)"}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-heading font-extrabold text-[#fec01f] text-xl">
                +{pointsEarned}
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-wider text-white/40">
                Points
              </span>
            </div>
          </div>
        )}

        {/* Educational Fact / Takeaway Card if available */}
        {educationalFact && (
          <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-left space-y-1">
            <div className="text-teal-300 font-mono text-[10px] uppercase tracking-wider font-bold">
              FinTech Intelligence Takeaway
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
          <p className="font-bold text-white/90">Lanka FinTechverse Puzzles · {meta.title}</p>
          <p>Solved {meta.title} in {formatTime(secondsElapsed)} ({getStarRatingString()})</p>
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
