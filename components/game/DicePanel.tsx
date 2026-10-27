"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { sounds } from "@/lib/audio/sound-effects";

interface DicePanelProps {
  isPlayerTurn: boolean;
  rolling: boolean;
  computerRolling?: boolean;
  lastRoll: number | null;
  computerRoll: number | null;
  onRoll: () => void;
  disabled: boolean;
  playerPosition?: number;
}

const DOT_POSITIONS: Record<number, string[]> = {
  1: ["col-start-2 row-start-2"],
  2: ["col-start-1 row-start-1", "col-start-3 row-start-3"],
  3: ["col-start-1 row-start-1", "col-start-2 row-start-2", "col-start-3 row-start-3"],
  4: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
  5: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-2 row-start-2",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
  6: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-1 row-start-2",
    "col-start-3 row-start-2",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
};

function DieFace({
  value,
  isRolling,
  color = "teal",
  clickable = false,
  onClick,
}: {
  value: number | null;
  isRolling: boolean;
  color?: "teal" | "burgundy";
  clickable?: boolean;
  onClick?: () => void;
}) {
  const [displayVal, setDisplayVal] = useState<number>(value || 1);

  // Fast shuffle animation while rolling
  useEffect(() => {
    if (!isRolling) {
      if (value) setDisplayVal(value);
      return;
    }
    const interval = setInterval(() => {
      setDisplayVal(Math.floor(Math.random() * 6) + 1);
    }, 65);
    return () => clearInterval(interval);
  }, [isRolling, value]);

  const dots = DOT_POSITIONS[displayVal] || [];
  const isTeal = color === "teal";
  const dotColor = isTeal
    ? "bg-[#fec01f] shadow-[0_0_8px_rgba(254,192,31,0.9)]"
    : "bg-[#fb7185] shadow-[0_0_8px_rgba(251,113,133,0.9)]";

  const borderColor = isTeal
    ? "border-[#fec01f]/70 bg-gradient-to-br from-[#125252] via-[#091f24] to-[#0a0a28]"
    : "border-rose-500/70 bg-gradient-to-br from-[#8d1739] via-[#2a0815] to-[#0a0a28]";

  return (
    <div
      onClick={clickable && !isRolling ? onClick : undefined}
      className={`
        relative w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 ${borderColor}
        shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex items-center justify-center p-2 sm:p-2.5
        transition-all duration-200 select-none shrink-0
        ${
          isRolling
            ? "animate-pulse scale-105 rotate-3 shadow-[0_0_25px_rgba(254,192,31,0.5)]"
            : clickable
            ? "cursor-pointer hover:scale-105 hover:border-[#fec01f] active:scale-95"
            : ""
        }
      `}
      title={clickable ? "Tap die to roll!" : undefined}
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 sm:gap-1 items-center justify-items-center">
        {dots.map((pos, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${dotColor} ${pos}`}
          />
        ))}
      </div>

      {clickable && !isRolling && (
        <span className="absolute -bottom-1.5 text-[7px] sm:text-[8px] font-mono font-bold bg-[#fec01f] text-black px-1 rounded-full uppercase tracking-tighter">
          Tap
        </span>
      )}
    </div>
  );
}

export default function DicePanel({
  isPlayerTurn,
  rolling,
  computerRolling = false,
  lastRoll,
  computerRoll,
  onRoll,
  disabled,
  playerPosition = 1,
}: DicePanelProps) {
  const neededToFinish = 25 - playerPosition;

  return (
    <div className="festival-card p-2.5 sm:p-4 border-2 border-white/15 bg-[#0a0a28]/95 shadow-[0_12px_35px_rgba(0,0,0,0.6)] max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Dice Visualizers */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Player Die */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#fec01f] uppercase tracking-wider mb-1 flex items-center gap-0.5">
              <Sparkles size={10} className="text-[#fec01f]" />
              You
            </span>
            <DieFace
              value={lastRoll}
              isRolling={rolling}
              color="teal"
              clickable={isPlayerTurn && !rolling && !disabled}
              onClick={onRoll}
            />
          </div>

          {/* AI Die */}
          {(computerRoll !== null || computerRolling) && (
            <div className="flex flex-col items-center">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                AI
              </span>
              <DieFace
                value={computerRoll}
                isRolling={computerRolling}
                color="burgundy"
                clickable={false}
              />
            </div>
          )}
        </div>

        {/* Right: Large Thumb Action Button & Prompt */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {isPlayerTurn ? (
            <button
              onClick={onRoll}
              disabled={rolling || disabled}
              className={`
                w-full py-3 sm:py-3.5 px-4 rounded-xl font-heading font-extrabold text-sm sm:text-base
                transition-all duration-200 shadow-lg flex items-center justify-center gap-2 sm:gap-3
                ${
                  rolling || disabled
                    ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                    : "interactive-btn interactive-btn--primary shadow-[0_0_25px_rgba(254,192,31,0.45)] cursor-pointer hover:scale-[1.02] active:scale-95"
                }
              `}
            >
              {rolling ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs sm:text-sm tracking-wider uppercase">Rolling…</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🎲</span>
                  <span className="tracking-wider uppercase">ROLL DIE</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-3 sm:py-3.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="truncate">AI is rolling &amp; moving…</span>
            </div>
          )}

          {/* Status Subtext */}
          <div className="mt-1 text-[10px] sm:text-xs font-mono text-white/60 text-center sm:text-right truncate">
            {playerPosition >= 19 ? (
              <span className="text-[#fec01f] font-semibold">
                🎯 Exactly {neededToFinish} needed for Square 25!
              </span>
            ) : (
              <span>Square {playerPosition} · Roll 1–6 to advance</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
