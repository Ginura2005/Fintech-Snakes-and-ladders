"use client";

import { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Undo2,
  Lightbulb,
  HelpCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Shuffle,
  X,
} from "lucide-react";
import { PuzzleMeta } from "./puzzleTypes";
import PuzzleIcon from "./PuzzleIcon";

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
  onToggleSound?: () => void;
  onBackToHub: () => void;
  rulesContent: React.ReactNode;
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
  onToggleSound,
  onBackToHub,
  rulesContent,
}: PuzzleHeaderProps) {
  const [showRules, setShowRules] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-[#fec01f] transition-colors px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-[#fec01f]/40 bg-white/[0.03]"
          >
            <ArrowLeft size={14} />
            <span>Puzzles Hub</span>
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
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-[#fec01f]">
            <Clock size={13} className="opacity-80" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {/* Moves or Mistakes if provided */}
          {typeof movesCount === "number" && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white/80">
              <span className="text-white/50">Moves:</span>
              <span>{movesCount}</span>
            </div>
          )}

          {typeof mistakesCount === "number" && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-rose-400">
              <span className="text-white/50">Mistakes:</span>
              <span>{mistakesCount}</span>
            </div>
          )}

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={isSoundMuted ? "Unmute audio" : "Mute audio"}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-[#fec01f]/40 transition-colors"
            >
              {isSoundMuted ? (
                <VolumeX size={15} />
              ) : (
                <Volume2 size={15} className="text-[#fec01f]" />
              )}
            </button>
          )}

          {/* Undo Button */}
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo last move"
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-[#fec01f]/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Undo2 size={15} />
            </button>
          )}

          {/* Hint Button */}
          {onHint && (
            <button
              onClick={onHint}
              disabled={!canHint}
              title="Get a hint"
              className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[#fec01f] hover:bg-amber-500/20 disabled:opacity-40 transition-colors"
            >
              <Lightbulb size={15} />
            </button>
          )}

          {/* New Random Puzzle Button */}
          {onNewPuzzle && (
            <button
              onClick={onNewPuzzle}
              title="Generate fresh procedural puzzle"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <Shuffle size={13} />
              <span className="hidden sm:inline">New</span>
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            title="Restart current puzzle"
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-rose-400 hover:border-rose-400/40 transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          {/* Rules Modal Trigger */}
          <button
            onClick={() => setShowRules(true)}
            title="How to Play"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white hover:border-[#fec01f]/40 transition-colors"
          >
            <HelpCircle size={14} className="text-[#fec01f]" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </div>

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
