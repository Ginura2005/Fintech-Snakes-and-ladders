"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import Cube3D, { ThrowPhysics } from "./Cube3D";

interface DicePanelProps {
  isPlayerTurn: boolean;
  rolling: boolean;
  computerRolling?: boolean;
  lastRoll: number | null;
  computerRoll: number | null;
  onRoll: (physics?: ThrowPhysics) => void;
  disabled: boolean;
  playerPosition?: number;
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

  const handleCubeThrow = (physics: ThrowPhysics) => {
    if (!isPlayerTurn || rolling || disabled) return;
    onRoll(physics);
  };

  const handleButtonClick = () => {
    if (!isPlayerTurn || rolling || disabled) return;
    onRoll({ speed: 1.0, tilt: 10, arc: -25, dur: 0.3 });
  };

  return (
    <div className="festival-card p-2 sm:p-3.5 border-2 border-white/15 bg-[#0a0a28]/95 shadow-[0_12px_35px_rgba(0,0,0,0.6)] max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: 3D Physical Cube Dice (Player & Ava) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 pb-1">
          {/* Player 3D Cube Die */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#fec01f] uppercase tracking-wider mb-1 flex items-center gap-0.5">
              <Sparkles size={10} className="text-[#fec01f]" />
              You
            </span>
            <div className="relative">
              <Cube3D
                value={lastRoll}
                isRolling={rolling}
                size={54}
                color="teal"
                clickable={isPlayerTurn && !rolling && !disabled}
                onThrow={handleCubeThrow}
                onClick={handleButtonClick}
              />
              {isPlayerTurn && !rolling && !disabled && (
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[7px] sm:text-[8px] font-mono font-bold bg-[#fec01f] text-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm border border-black/20 whitespace-nowrap">
                  Swipe / Tap
                </span>
              )}
            </div>
          </div>

          {/* Ava's 3D Cube Die */}
          {(computerRoll !== null || computerRolling) && (
            <div className="flex flex-col items-center">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                Ava
              </span>
              <Cube3D
                value={computerRoll}
                isRolling={computerRolling}
                size={54}
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
              onClick={handleButtonClick}
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
                  <span className="font-mono text-xs sm:text-sm tracking-wider uppercase">Throwing…</span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg">🎲</span>
                  <span className="tracking-wider uppercase">ROLL 3D DIE</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-2.5 sm:py-3.5 px-2.5 sm:px-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="truncate text-[11px] sm:text-xs">Ava throwing 3D die…</span>
            </div>
          )}

          {/* Status Subtext */}
          <div className="mt-1 text-[10px] sm:text-xs font-mono text-white/60 text-center sm:text-right truncate">
            {playerPosition >= 19 ? (
              <span className="text-[#fec01f] font-semibold">
                🎯 Exactly {neededToFinish} needed for Square 25!
              </span>
            ) : (
              <span>Square {playerPosition} · Swipe cube or tap roll</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
