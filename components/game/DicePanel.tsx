"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
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
  const [justLanded, setJustLanded] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Dynamic throw physics variables
  const [throwPhysics, setThrowPhysics] = useState<{
    tilt: number;
    arc: number;
    dur: number;
  }>({ tilt: 14, arc: -20, dur: 0.3 });

  // Fast shuffle animation while rolling & smooth physical land bounce
  useEffect(() => {
    if (isRolling) {
      setJustLanded(false);
      const interval = setInterval(() => {
        setDisplayVal(Math.floor(Math.random() * 6) + 1);
      }, 45); // Snappy 45ms shuffle
      return () => clearInterval(interval);
    } else if (value) {
      setDisplayVal(value);
      setJustLanded(true);
      const timer = setTimeout(() => setJustLanded(false), 380);
      return () => clearTimeout(timer);
    }
  }, [isRolling, value]);

  // Touch & Swipe-to-Throw gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!clickable || isRolling) return;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!clickable || isRolling) return;
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!start) {
      onClick?.();
      return;
    }

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = Math.max(35, Date.now() - start.time);
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      // User swiped/flicked the die!
      const speed = Math.min(2.8, Math.max(0.7, (dist / dt) * 1.6));
      // Horizontal flick tilt (flicking left tilts negative, flicking right tilts positive)
      const tilt = Math.max(-28, Math.min(28, (dx / 5) * 1.4));
      // Vertical throw arc height
      const arc = -Math.round(18 + Math.min(16, speed * 6));
      // Tumble duration: faster for high speed flicks!
      const dur = Math.max(0.22, Math.min(0.36, 0.32 / speed));

      setThrowPhysics({ tilt, arc, dur });
    } else {
      // Crisp standard tap
      setThrowPhysics({ tilt: 12, arc: -18, dur: 0.28 });
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {}
    }

    onClick?.();
  };

  const dots = DOT_POSITIONS[displayVal] || [];
  const isTeal = color === "teal";
  const dotColor = isTeal
    ? "bg-[#fec01f] text-[#fec01f] shadow-[0_0_6px_rgba(254,192,31,0.9)]"
    : "bg-[#fb7185] text-[#fb7185] shadow-[0_0_6px_rgba(251,113,133,0.9)]";

  const borderColor = isTeal
    ? "border-[#fec01f] bg-gradient-to-br from-[#186a6a] via-[#0e3038] to-[#071317]"
    : "border-rose-400 bg-gradient-to-br from-[#a81c44] via-[#3d091e] to-[#140209]";

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartRef.current = null;
      }}
      style={{
        // @ts-ignore
        "--throw-tilt": `${throwPhysics.tilt}deg`,
        "--throw-arc": `${throwPhysics.arc}px`,
        "--throw-dur": `${throwPhysics.dur}s`,
      }}
      className={`
        relative w-13 h-13 sm:w-16 sm:h-16 rounded-2xl border-2 ${borderColor}
        shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-3px_-3px_5px_rgba(0,0,0,0.65),0_12px_28px_rgba(0,0,0,0.7),0_0_15px_rgba(254,192,31,0.25)]
        flex items-center justify-center p-2.5 sm:p-3 select-none shrink-0 touch-none
        before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-t-2xl before:pointer-events-none
        transition-transform duration-150
        ${
          isRolling
            ? "animate-dice-tumble scale-110 shadow-[0_0_35px_rgba(254,192,31,0.8)]"
            : justLanded
            ? "animate-dice-settle shadow-[0_0_22px_rgba(254,192,31,0.5)]"
            : clickable
            ? "cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95"
            : ""
        }
      `}
      title={clickable ? "Swipe or tap to throw!" : undefined}
    >
      {/* Drilled Recessed Pip Grid */}
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 sm:gap-1 items-center justify-items-center">
        {dots.map((pos, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${dotColor} ${pos} shadow-[inset_1px_1.5px_2px_rgba(0,0,0,0.85)]`}
          />
        ))}
      </div>

      {clickable && !isRolling && (
        <span className="absolute -bottom-2 text-[7px] sm:text-[8px] font-mono font-bold bg-[#fec01f] text-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm border border-black/20">
          Swipe/Tap
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
    <div className="festival-card p-2 sm:p-3.5 border-2 border-white/15 bg-[#0a0a28]/95 shadow-[0_12px_35px_rgba(0,0,0,0.6)] max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-2.5 sm:gap-5">
        
        {/* Left: 3D Physical Dice (Player & Ava) */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Player Die */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#fec01f] uppercase tracking-wider mb-0.5 sm:mb-1 flex items-center gap-0.5">
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

          {/* Ava's Die */}
          {(computerRoll !== null || computerRolling) && (
            <div className="flex flex-col items-center">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                Ava
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

        {/* Right: Big Thumb Roll Button & Prompt */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {isPlayerTurn ? (
            <button
              onClick={onRoll}
              disabled={rolling || disabled}
              className={`
                w-full py-2.5 sm:py-3.5 px-3 sm:px-4 rounded-xl font-heading font-extrabold text-xs sm:text-base
                transition-all duration-150 shadow-lg flex items-center justify-center gap-1.5 sm:gap-3
                ${
                  rolling || disabled
                    ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                    : "interactive-btn interactive-btn--primary shadow-[0_0_25px_rgba(254,192,31,0.45)] cursor-pointer hover:scale-[1.02] active:scale-95"
                }
              `}
            >
              {rolling ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs sm:text-sm tracking-wider uppercase">Rolling…</span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg">🎲</span>
                  <span className="tracking-wider uppercase">ROLL DIE</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-2.5 sm:py-3.5 px-2.5 sm:px-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="truncate text-[11px] sm:text-xs">Ava rolling &amp; moving…</span>
            </div>
          )}

          {/* Status Subtext */}
          <div className="mt-1 text-[10px] sm:text-xs font-mono text-white/60 text-center sm:text-right truncate">
            {playerPosition >= 19 ? (
              <span className="text-[#fec01f] font-semibold">
                🎯 Exactly {neededToFinish} needed for Square 25!
              </span>
            ) : (
              <span>Square {playerPosition} · Swipe die or tap roll</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
