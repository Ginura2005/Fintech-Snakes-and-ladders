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
        relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 ${borderColor}
        shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center p-3
        transition-all duration-200 select-none
        ${
          isRolling
            ? "animate-pulse scale-105 rotate-6 shadow-[0_0_30px_rgba(254,192,31,0.5)]"
            : clickable
            ? "cursor-pointer hover:scale-105 hover:border-[#fec01f] active:scale-95"
            : ""
        }
      `}
      title={clickable ? "Click die to roll!" : undefined}
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1 items-center justify-items-center">
        {dots.map((pos, idx) => (
          <div
            key={idx}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotColor} ${pos}`}
          />
        ))}
      </div>

      {clickable && !isRolling && (
        <span className="absolute -bottom-2 text-[8px] font-mono font-bold bg-[#fec01f] text-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
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
  const [muted, setMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="festival-card p-4 sm:p-5 border-2 border-white/15 bg-[#0a0a28]/95 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        
        {/* Dice Visualizers & Sound Toggle */}
        <div className="flex items-center gap-6">
          {/* Player Die */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] font-bold text-[#fec01f] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles size={11} className="text-[#fec01f]" />
              Your Die
            </span>
            <DieFace
              value={lastRoll}
              isRolling={rolling}
              color="teal"
              clickable={isPlayerTurn && !rolling && !disabled}
              onClick={onRoll}
            />
          </div>

          {/* Computer Die */}
          {(computerRoll !== null || computerRolling) && (
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">
                FinTech AI
              </span>
              <DieFace
                value={computerRoll}
                isRolling={computerRolling}
                color="burgundy"
                clickable={false}
              />
            </div>
          )}

          {/* Mute / Unmute Button */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title={muted ? "Unmute game audio" : "Mute game audio"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-[#fec01f]" />}
          </button>
        </div>

        {/* Action button & turn instructions */}
        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
          {isPlayerTurn ? (
            <button
              onClick={onRoll}
              disabled={rolling || disabled}
              className={`
                w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-extrabold text-base
                transition-all duration-200 shadow-lg flex items-center justify-center gap-3
                ${
                  rolling || disabled
                    ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                    : "interactive-btn interactive-btn--primary shadow-[0_0_30px_rgba(254,192,31,0.5)] cursor-pointer hover:scale-105 active:scale-95"
                }
              `}
            >
              {rolling ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-sm tracking-wider uppercase">Rolling Die…</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🎲</span>
                  <span className="tracking-wider uppercase">ROLL THE DIE</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2.5">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>FinTech AI is rolling &amp; moving…</span>
            </div>
          )}

          {/* Context tip */}
          <div className="mt-2 text-xs font-mono text-white/60 text-center sm:text-right">
            {playerPosition >= 19 ? (
              <span className="text-[#fec01f] font-semibold">
                🎯 Exactly {neededToFinish} needed to reach finish! (overshooting stays in place)
              </span>
            ) : (
              <span>Roll 1–6 to advance toward Square 25.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
