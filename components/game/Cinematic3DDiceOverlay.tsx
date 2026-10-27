"use client";

import React from "react";
import Cube3D, { ThrowPhysics } from "./Cube3D";
import { Sparkles } from "lucide-react";

interface Cinematic3DDiceOverlayProps {
  show: boolean;
  actor: "player" | "computer";
  rollValue: number | null;
  isRolling: boolean;
  physics?: ThrowPhysics;
  isOvershoot?: boolean;
}

export default function Cinematic3DDiceOverlay({
  show,
  actor,
  rollValue,
  isRolling,
  physics = { speed: 1, tilt: 12, arc: -30, dur: 0.3 },
  isOvershoot = false,
}: Cinematic3DDiceOverlayProps) {
  if (!show) return null;

  const isPlayer = actor === "player";

  // Derive throw flavor label from physics
  let throwStyleLabel = "Standard Throw";
  if (physics.speed > 1.3) {
    throwStyleLabel = "⚡ Power Throw";
  } else if (physics.speed < 0.85) {
    throwStyleLabel = "🌿 Gentle Roll";
  } else if (Math.abs(physics.tilt) > 18) {
    throwStyleLabel = physics.tilt > 0 ? "↗️ Right Bank Roll" : "↖️ Left Bank Roll";
  }

  return (
    <div
      style={{
        // @ts-ignore
        "--throw-tilt": `${physics.tilt}deg`,
        "--throw-arc": `${physics.arc}px`,
        "--throw-dur": `${physics.dur}s`,
      }}
      className="fixed inset-0 z-50 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center p-4 transition-all duration-200 pointer-events-none select-none"
    >
      {/* Tabletop Arena Felt Ring */}
      <div
        className={`
          relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border-2 flex flex-col items-center justify-center p-6 text-center
          transition-all duration-300
          ${
            isPlayer
              ? "border-[#fec01f]/75 bg-gradient-to-b from-[#125252]/50 via-[#07191d]/90 to-black/95 shadow-[0_0_65px_rgba(254,192,31,0.35),inset_0_0_50px_rgba(18,82,82,0.6)]"
              : "border-rose-500/75 bg-gradient-to-b from-[#8d1739]/50 via-[#270715]/90 to-black/95 shadow-[0_0_65px_rgba(244,63,94,0.35),inset_0_0_50px_rgba(141,23,57,0.6)]"
          }
        `}
      >
        {/* Arena Inner Concentric Track */}
        <div className="absolute inset-3.5 rounded-full border border-white/10 pointer-events-none" />

        {/* Top Header & Throw Style */}
        <div className="absolute top-5 sm:top-7 flex flex-col items-center gap-1 font-mono uppercase">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-widest">
            {isPlayer ? (
              <span className="text-[#fec01f] flex items-center gap-1.5">
                <Sparkles size={13} className="animate-spin text-[#fec01f]" />
                Your 3D Dice Throw
              </span>
            ) : (
              <span className="text-rose-300 flex items-center gap-1.5">
                <span>🤖</span> Ava is Throwing
              </span>
            )}
          </div>
          {isPlayer && (
            <span className="text-[9px] sm:text-[10px] text-white/50 tracking-wider">
              {throwStyleLabel}
            </span>
          )}
        </div>

        {/* Real 3D Physical Cube Die Tumbling in Arena */}
        <div className="my-auto relative flex items-center justify-center pt-3">
          <Cube3D
            value={rollValue}
            isRolling={isRolling}
            size={96}
            color={isPlayer ? "teal" : "burgundy"}
            tiltAngle={physics.tilt}
          />
        </div>

        {/* Bottom Landing Announcement Banner */}
        <div className="absolute bottom-5 sm:bottom-7 w-full px-4 flex justify-center">
          {rollValue !== null ? (
            <div
              className={`
                px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-heading font-black text-xs sm:text-sm tracking-wider uppercase
                shadow-2xl animate-dice-settle border flex flex-col items-center gap-0.5
                ${
                  isOvershoot
                    ? "bg-amber-600 text-white border-amber-300 shadow-[0_0_30px_rgba(217,119,6,0.8)]"
                    : isPlayer
                    ? "bg-[#fec01f] text-black border-amber-200 shadow-[0_0_30px_rgba(254,192,31,0.85)]"
                    : "bg-rose-600 text-white border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.85)]"
                }
              `}
            >
              <span>🎲 ROLLED A {rollValue}!</span>
              {isOvershoot && (
                <span className="text-[9px] font-mono tracking-normal normal-case font-bold">
                  🎯 Needs exact roll for 25
                </span>
              )}
            </div>
          ) : (
            <div className="text-[11px] sm:text-xs font-mono text-white/70 tracking-wider uppercase animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fec01f] animate-ping" />
              Tumbling across felt arena…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
