"use client";

import React, { useState } from "react";
import { Heart, Shield, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { sounds } from "@/lib/audio/sound-effects";
import GameAvatar, { AvatarMood } from "./GameAvatar";

interface CompactScoreHeaderProps {
  playerName: string;
  playerScore: number;
  playerHearts: number;
  playerShields: number;
  playerPosition: number;
  playerQuizCorrect: number;
  playerMood?: AvatarMood;

  computerScore: number;
  computerHearts: number;
  computerShields: number;
  computerPosition: number;
  computerMood?: AvatarMood;
  computerReaction?: string | null;

  currentTurn: "player" | "computer";
  turnSequence: number;
  isPracticeMode?: boolean;
  onResetPractice?: () => void;
}

export default function CompactScoreHeader({
  playerName,
  playerScore,
  playerHearts,
  playerShields,
  playerPosition,
  playerQuizCorrect,
  playerMood = "idle",
  computerScore,
  computerHearts,
  computerShields,
  computerPosition,
  computerMood = "idle",
  computerReaction = null,
  currentTurn,
  turnSequence,
  isPracticeMode = false,
  onResetPractice,
}: CompactScoreHeaderProps) {
  const [muted, setMuted] = useState(sounds.getMuted());
  const isPlayerTurn = currentTurn === "player";

  const handleToggleMute = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-3">
      {/* Consolidated Top Match Bar */}
      <div className="festival-card p-2 sm:p-2.5 bg-[#0a0a28]/95 border-white/15 backdrop-blur-xl shadow-lg relative">
        
        {/* Ava's Human-like Speech Reaction Bubble */}
        {computerReaction && (
          <div className="absolute -bottom-3 right-4 z-30 animate-bounce">
            <div className="bg-gradient-to-r from-rose-900 to-[#1e0712] border border-rose-400 text-white text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full shadow-[0_4px_15px_rgba(244,63,94,0.5)] flex items-center gap-1.5">
              <span>💬 Ava:</span>
              <span className="text-rose-200">"{computerReaction}"</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          
          {/* Left: Human Player Card */}
          <div
            className={`
              flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl transition-all duration-300
              ${
                isPlayerTurn
                  ? "bg-[#125252]/40 border border-[#fec01f]/60 shadow-[0_0_12px_rgba(254,192,31,0.25)] ring-1 ring-[#fec01f]"
                  : "bg-white/[0.03] border border-white/5 opacity-85"
              }
            `}
          >
            {/* Expressive Player Avatar */}
            <div className="relative shrink-0">
              <GameAvatar type="player" mood={playerMood} size="hud" />
              {isPlayerTurn && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#fec01f] border-2 border-[#0a0a28] animate-ping" />
              )}
            </div>

            {/* Stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-white text-xs sm:text-sm truncate leading-none">
                  {playerName}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-[#fec01f] font-bold shrink-0">
                  Sq {playerPosition.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Score & Health */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <span className="font-mono font-bold text-xs sm:text-sm text-[#fec01f] leading-none">
                  {playerScore.toLocaleString()} <span className="text-[9px] font-normal text-white/50">pts</span>
                </span>

                {/* Hearts */}
                <div className="flex items-center gap-0.5" title={`${playerHearts} hearts remaining`}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Heart
                      key={i}
                      size={11}
                      className={
                        i < playerHearts
                          ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                          : "text-white/20 fill-white/10"
                      }
                    />
                  ))}
                </div>

                {/* Shield badge */}
                {playerShields > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-teal-300 bg-teal-950/70 border border-teal-500/40 px-1 rounded"
                    title={`${playerShields} shield active`}
                  >
                    <Shield size={9} className="fill-teal-400" />
                    {playerShields}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Turn Status & Audio Controls */}
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="font-mono text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest leading-none mb-1">
              Turn {turnSequence}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={muted ? "Unmute audio" : "Mute audio"}
                aria-label={muted ? "Unmute audio" : "Mute audio"}
              >
                {muted ? (
                  <VolumeX size={13} className="text-white/40" />
                ) : (
                  <Volume2 size={13} className="text-[#fec01f]" />
                )}
              </button>

              {isPracticeMode && onResetPractice && (
                <button
                  onClick={onResetPractice}
                  className="p-1 sm:p-1.5 rounded-lg bg-teal-950/50 border border-teal-500/30 hover:bg-teal-900/50 text-teal-300 transition-colors cursor-pointer"
                  title="Reset practice match"
                  aria-label="Reset practice match"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>

            <span
              className={`text-[8px] sm:text-[9px] font-mono uppercase tracking-wider font-bold mt-1 px-1.5 py-0.2 rounded ${
                isPlayerTurn
                  ? "bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/30"
                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}
            >
              {isPlayerTurn ? "Your Move" : "Ava Thinking"}
            </span>
          </div>

          {/* Right: Ava (Human-like AI Rival) Card */}
          <div
            className={`
              flex items-center justify-end gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl transition-all duration-300 text-right
              ${
                !isPlayerTurn
                  ? "bg-rose-950/40 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500"
                  : "bg-white/[0.03] border border-white/5 opacity-85"
              }
            `}
          >
            {/* Stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-mono text-[9px] sm:text-[10px] text-rose-400 font-bold shrink-0">
                  Sq {computerPosition.toString().padStart(2, "0")}
                </span>
                <span className="font-heading font-bold text-white text-xs sm:text-sm truncate leading-none">
                  Ava <span className="text-[9px] font-normal text-rose-300/80 font-mono">(AI)</span>
                </span>
              </div>

              {/* Score & Health */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-1">
                {/* Shield badge */}
                {computerShields > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-teal-300 bg-teal-950/70 border border-teal-500/40 px-1 rounded"
                    title={`${computerShields} shield active`}
                  >
                    <Shield size={9} className="fill-teal-400" />
                    {computerShields}
                  </span>
                )}

                {/* Hearts */}
                <div className="flex items-center gap-0.5" title={`${computerHearts} hearts remaining`}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Heart
                      key={i}
                      size={11}
                      className={
                        i < computerHearts
                          ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                          : "text-white/20 fill-white/10"
                      }
                    />
                  ))}
                </div>

                <span className="font-mono font-bold text-xs sm:text-sm text-rose-300 leading-none">
                  {computerScore.toLocaleString()} <span className="text-[9px] font-normal text-white/50">pts</span>
                </span>
              </div>
            </div>

            {/* Expressive Ava Avatar */}
            <div className="relative shrink-0">
              <GameAvatar type="computer" mood={computerMood} size="hud" />
              {!isPlayerTurn && (
                <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#0a0a28] animate-ping" />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
