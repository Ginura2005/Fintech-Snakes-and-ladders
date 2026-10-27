"use client";

import { useState } from "react";

interface DicePanelProps {
  isPlayerTurn: boolean;
  rolling: boolean;
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

function DieFace({ value, isRolling, color = "teal" }: { value: number | null; isRolling: boolean; color?: "teal" | "burgundy" }) {
  const dots = value && DOT_POSITIONS[value] ? DOT_POSITIONS[value] : [];
  const dotColor = color === "teal" ? "bg-teal-800" : "bg-[#8D1739]";
  const borderColor = color === "teal" ? "border-teal-700" : "border-[#8D1739]";

  return (
    <div
      className={`
        w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 ${borderColor}
        shadow-lg flex items-center justify-center p-2.5 transition-all duration-200
        ${isRolling ? "animate-spin" : "hover:scale-105"}
      `}
    >
      {value ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5">
          {dots.map((pos, idx) => (
            <div key={idx} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotColor} ${pos}`} />
          ))}
        </div>
      ) : (
        <span className="text-2xl text-slate-300">🎲</span>
      )}
    </div>
  );
}

export default function DicePanel({
  isPlayerTurn,
  rolling,
  lastRoll,
  computerRoll,
  onRoll,
  disabled,
  playerPosition = 1,
}: DicePanelProps) {
  const neededToFinish = 25 - playerPosition;

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Dice visualizers */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-1.5">
              Your Roll
            </span>
            <DieFace value={lastRoll} isRolling={rolling} color="teal" />
          </div>

          {computerRoll !== null && (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-[#8D1739] uppercase tracking-wider mb-1.5">
                Computer
              </span>
              <DieFace value={computerRoll} isRolling={false} color="burgundy" />
            </div>
          )}
        </div>

        {/* Action button & turn instructions */}
        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
          {isPlayerTurn ? (
            <button
              onClick={onRoll}
              disabled={rolling || disabled}
              className={`
                w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-white text-base
                transition-all duration-200 shadow-md flex items-center justify-center gap-3
                ${
                  rolling || disabled
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "brand-gradient hover:opacity-95 hover:shadow-lg active:scale-95 animate-pulse-ring cursor-pointer"
                }
              `}
            >
              {rolling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Rolling Authoritative Die…</span>
                </>
              ) : (
                <>
                  <span>🎲</span>
                  <span>ROLL THE DIE</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <span>Computer is rolling…</span>
            </div>
          )}

          {/* Context tip */}
          <div className="mt-2 text-xs text-slate-500 text-center sm:text-right">
            {playerPosition >= 19 ? (
              <span className="text-amber-700 font-semibold">
                🎯 Exactly {neededToFinish} needed to reach finish! (overshooting stays in place)
              </span>
            ) : (
              <span>Roll 1–6 to advance. Watch out for snakes!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
