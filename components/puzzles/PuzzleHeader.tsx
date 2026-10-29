"use client";

import { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Lightbulb,
  HelpCircle,
  Clock,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  X,
  Swords,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { PuzzleMeta } from "./puzzleTypes";
import PuzzleIcon from "./PuzzleIcon";
import { SoundProfile } from "@/lib/audio/sound-effects";

interface ChallengeInfo {
  challengerName: string;
  targetSeconds: number;
  seed: number;
  difficulty?: string;
}

interface PuzzleHeaderProps {
  meta: PuzzleMeta;
  levelNames: string[];
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  secondsElapsed: number;
  movesCount?: number;
  mistakesCount?: number;
  onUndo?: () => void;
  canUndo?: boolean;
  onReset: () => void;
  onHint?: () => void;
  canHint?: boolean;
  onNewPuzzle?: () => void;
  isSoundMuted?: boolean;
  soundProfile?: SoundProfile;
  onChangeSoundProfile?: (profile: SoundProfile) => void;
  onToggleSound?: () => void;
  onBackToHub: () => void;
  rulesContent: React.ReactNode;
  onRevealSolution?: () => void;
  isSolutionRevealed?: boolean;
  challengeInfo?: ChallengeInfo | null;
}

export default function PuzzleHeader({
  meta,
  levelNames,
  currentLevelIndex,
  onSelectLevel,
  secondsElapsed,
  movesCount,
  mistakesCount,
  onUndo,
  canUndo = false,
  onReset,
  onHint,
  canHint = true,
  onNewPuzzle,
  isSoundMuted = false,
  soundProfile = "arcade",
  onChangeSoundProfile,
  onToggleSound,
  onBackToHub,
  rulesContent,
  onRevealSolution,
  isSolutionRevealed = false,
  challengeInfo,
}: PuzzleHeaderProps) {
  const [showRules, setShowRules] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCycleSound = () => {
    if (onChangeSoundProfile) {
      const nextProfile: SoundProfile =
        soundProfile === "arcade"
          ? "subtle"
          : soundProfile === "subtle"
          ? "muted"
          : "arcade";
      onChangeSoundProfile(nextProfile);
    } else if (onToggleSound) {
      onToggleSound();
    }
  };

  const isChallenge = Boolean(challengeInfo && challengeInfo.targetSeconds > 0);
  const targetSeconds = challengeInfo?.targetSeconds || 0;
  const isAheadOfPace = isChallenge && secondsElapsed <= targetSeconds;
  const paceDiff = Math.abs(targetSeconds - secondsElapsed);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* 1v1 Challenge Ghost Pacer Banner (if challenge active) */}
      {isChallenge && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-teal-950/60 via-[#00f0ff]/10 to-amber-950/40 border border-[#00f0ff]/40 flex flex-wrap items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-7 h-7 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center font-bold">
              <Swords size={15} />
            </span>
            <div>
              <span className="text-white/60 text-[10px] uppercase tracking-wider block">
                1v1 Duel vs {challengeInfo?.challengerName || "Challenger"}
              </span>
              <span className="font-bold text-white">
                Target Time: {formatTime(targetSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isAheadOfPace
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {isAheadOfPace
                ? `⚡ ${paceDiff}s Ahead of Pace`
                : `⏱️ ${paceDiff}s Behind Pace`}
            </span>
          </div>
        </div>
      )}

      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-[#fec01f] transition-colors px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-[#fec01f]/40 bg-white/[0.03] min-h-[36px]"
          >
            <ArrowLeft size={14} />
            <span>Hub</span>
          </button>

          <div className="flex items-center gap-2">
            <PuzzleIcon id={meta.id} size={22} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-bold text-white">
                  {meta.title}
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/60">
                  {meta.badge}
                </span>
              </div>
              <p className="text-xs text-white/50 hidden md:block">
                {meta.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-[#fec01f] min-h-[36px]">
            <Clock size={13} className="opacity-80" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {/* Moves or Mistakes if provided */}
          {typeof movesCount === "number" && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/80 min-h-[36px]">
              <span className="text-white/50">Moves:</span>
              <span>{movesCount}</span>
            </div>
          )}

          {typeof mistakesCount === "number" && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-rose-400 min-h-[36px]">
              <span className="text-white/50">Mistakes:</span>
              <span>{mistakesCount}</span>
            </div>
          )}

          {/* 3-State Sound Mode Toggle */}
          {(onChangeSoundProfile || onToggleSound) && (
            <button
              onClick={handleCycleSound}
              title={`Audio: ${soundProfile.toUpperCase()} (Click to toggle: Arcade -> Subtle -> Muted)`}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-[#fec01f]/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center gap-1 text-[11px] font-mono"
            >
              {soundProfile === "muted" || isSoundMuted ? (
                <VolumeX size={15} className="text-rose-400" />
              ) : soundProfile === "subtle" ? (
                <Volume1 size={15} className="text-[#00f0ff]" />
              ) : (
                <Volume2 size={15} className="text-[#fec01f]" />
              )}
              <span className="hidden md:inline uppercase text-[10px]">
                {soundProfile}
              </span>
            </button>
          )}

          {/* Undo Button */}
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo || isSolutionRevealed}
              title="Undo last move"
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-[#fec01f]/40 disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <Undo2 size={15} />
            </button>
          )}

          {/* Hint Button */}
          {onHint && (
            <button
              onClick={onHint}
              disabled={!canHint || isSolutionRevealed}
              title="Get a hint"
              className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[#fec01f] hover:bg-amber-500/20 disabled:opacity-40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <Lightbulb size={15} />
            </button>
          )}

          {/* Reveal Solution / Give Up Button */}
          {onRevealSolution && (
            <button
              onClick={() => setShowGiveUpConfirm(true)}
              disabled={isSolutionRevealed}
              title="Give up & reveal complete solution"
              className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center gap-1 font-mono text-xs"
            >
              <Eye size={14} />
              <span className="hidden lg:inline text-[10px] uppercase font-bold">Solve</span>
            </button>
          )}

          {/* New Random Puzzle Button */}
          {onNewPuzzle && (
            <button
              onClick={onNewPuzzle}
              title="Generate fresh procedural puzzle"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 font-mono text-xs uppercase tracking-wider transition-colors min-h-[36px]"
            >
              <Shuffle size={13} />
              <span className="hidden sm:inline">New</span>
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            title="Restart current puzzle"
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-rose-400 hover:border-rose-400/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <RotateCcw size={15} />
          </button>

          {/* Rules Modal Trigger */}
          <button
            onClick={() => setShowRules(true)}
            title="How to Play"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white hover:border-[#fec01f]/40 transition-colors min-h-[36px]"
          >
            <HelpCircle size={14} className="text-[#fec01f]" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </div>

      {/* Solution Revealed Notice Banner */}
      {isSolutionRevealed && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <Eye size={15} />
            <span>Solution Walkthrough Displayed · Forfeited this round</span>
          </div>
          <button
            onClick={onReset}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[#fec01f] border border-amber-500/40 uppercase font-bold text-[10px]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Level selection tabs */}
      {levelNames.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono uppercase tracking-wider text-white/40 shrink-0">
            Mode / Difficulty:
          </span>
          {levelNames.map((name, i) => (
            <button
              key={i}
              onClick={() => onSelectLevel(i)}
              className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                currentLevelIndex === i
                  ? "bg-[#fec01f] text-black font-bold shadow-md shadow-[#fec01f]/20"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Give Up / Reveal Solution Confirmation Dialog */}
      {showGiveUpConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="festival-panel max-w-sm w-full p-6 space-y-4 border border-rose-500/40 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-lg">
                Reveal Solution?
              </h3>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                Stuck on this board? You can inspect the complete walkthrough to learn the logic pattern. You will forfeit score points for this attempt.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowGiveUpConfirm(false)}
                className="py-2 px-3 rounded-lg border border-white/15 bg-white/5 text-xs font-mono uppercase font-bold text-white/80 hover:text-white"
              >
                Keep Trying
              </button>
              <button
                onClick={() => {
                  setShowGiveUpConfirm(false);
                  onRevealSolution?.();
                }}
                className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs uppercase font-bold shadow-md"
              >
                Reveal Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="festival-panel max-w-lg w-full max-h-[88vh] flex flex-col p-4 sm:p-6 space-y-4 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <PuzzleIcon id={meta.id} size={24} />
                <div>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg">
                    How to Play {meta.title}
                  </h3>
                  <p className="text-xs font-mono text-[#fec01f]">
                    {meta.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="text-white/50 hover:text-white p-1.5 rounded-md hover:bg-white/10 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close rules"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-sm text-white/80 space-y-3 leading-relaxed overflow-y-auto pr-1">
              {rulesContent}
            </div>

            <div className="pt-2 flex justify-end shrink-0 border-t border-white/10">
              <button
                onClick={() => setShowRules(false)}
                className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-2.5 px-5"
              >
                Got It, Let&apos;s Play!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
