"use client";

import React, { useState } from "react";
import { Heart, Shield, Volume2, VolumeX, RotateCcw, Shuffle, MessageSquare } from "lucide-react";
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
  onShuffleBoard?: () => void;
  boardSeed?: number | null;
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
  onShuffleBoard,
  boardSeed = null,
}: CompactScoreHeaderProps) {
  const [muted, setMuted] = useState(sounds.getMuted());
  const isPlayerTurn = currentTurn === "player";

  const handleToggleMute = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-2 px-0.5 sm:px-0">
      {/* Consolidated Top Match Bar (Scales to any screen size) */}
      <div className="festival-card p-1.5 sm:p-2.5 bg-[#0a0a28]/95 border-white/15 backdrop-blur-xl shadow-lg relative">
        
        {/* Ava's Human-like Speech Reaction Bubble */}
        {computerReaction && (
          <div className="absolute -bottom-3 right-2 sm:right-4 z-30 animate-speech-bubble pointer-events-none max-w-[85%]">
            <div className="bg-gradient-to-r from-rose-900 to-[#1e0712] border border-rose-400 text-white text-[9px] sm:text-xs font-mono font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-[0_4px_15px_rgba(244,63,94,0.5)] flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="shrink-0 flex items-center gap-1">
                <MessageSquare size={11} className="text-rose-300" />
                <span>Ava:</span>
              </span>
              <span className="text-rose-200 truncate">"{computerReaction}"</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-3">
          
          {/* Left: Human Player Card */}
          <div
            className={`
              flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-2 rounded-xl transition-all duration-300 min-w-0
              ${
                isPlayerTurn
                  ? "bg-[#125252]/40 border border-[#fec01f]/60 shadow-[0_0_12px_rgba(254,192,31,0.25)] ring-1 ring-[#fec01f]"
                  : "bg-white/[0.03] border border-white/5 opacity-85"
              }
            `}
          >
            {/* Expressive Player Avatar */}
            <div className="relative shrink-0">
              <GameAvatar type="player" mood={playerMood} size="hud" className="w-7 h-7 sm:w-10 sm:h-10" />
              {isPlayerTurn && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#fec01f] border-2 border-[#0a0a28] animate-ping" />
              )}
            </div>

            {/* Stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
                <span className="font-heading font-bold text-white text-[11px] sm:text-sm truncate max-w-[65px] xs:max-w-[90px] sm:max-w-none">
                  {playerName}
                </span>
                <span className="font-mono text-[8px] sm:text-[10px] text-[#fec01f] font-bold shrink-0">
                  Sq {playerPosition.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Score & Health */}
              <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                <span className="font-mono font-bold text-[10px] sm:text-sm text-[#fec01f] leading-none shrink-0">
                  {playerScore.toLocaleString()} <span className="text-[8px] sm:text-[9px] font-normal text-white/50">pts</span>
                </span>

                {/* Hearts */}
                <div className="flex items-center gap-0.5 shrink-0" title={`${playerHearts} hearts remaining`}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Heart
                      key={i}
                      size={10}
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
                    className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-mono font-bold text-teal-300 bg-teal-950/70 border border-teal-500/40 px-1 rounded shrink-0 leading-tight"
                    title={`${playerShields} shield active`}
                  >
                    <Shield size={8} className="fill-teal-400" />
                    {playerShields}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Turn Status & Audio Controls */}
          <div className="flex flex-col items-center justify-center text-center px-0.5 shrink-0">
            <span className="font-mono text-[8px] sm:text-[10px] text-white/50 uppercase tracking-widest leading-none mb-0.5">
              Turn {turnSequence}{boardSeed ? ` · #${boardSeed}` : ""}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleMute}
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={muted ? "Unmute audio" : "Mute audio"}
                aria-label={muted ? "Unmute audio" : "Mute audio"}
              >
                {muted ? (
                  <VolumeX size={12} className="text-white/40" />
                ) : (
                  <Volume2 size={12} className="text-[#fec01f]" />
                )}
              </button>

              {isPracticeMode && onResetPractice && (
                <button
                  onClick={onResetPractice}
                  className="p-1 sm:p-1.5 rounded-lg bg-teal-950/50 border border-teal-500/30 hover:bg-teal-900/50 text-teal-300 transition-colors cursor-pointer"
                  title="Reset practice match"
                  aria-label="Reset practice match"
                >
                  <RotateCcw size={12} />
                </button>
              )}

              {isPracticeMode && onShuffleBoard && (
                <button
                  onClick={onShuffleBoard}
                  className="p-1 sm:p-1.5 rounded-lg bg-[#fec01f]/15 border border-[#fec01f]/40 hover:bg-[#fec01f]/25 text-[#fec01f] transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-[0_0_8px_rgba(254,192,31,0.2)]"
                  title="Generate a random board layout (snakes, ladders, hazards & treasures)"
                  aria-label="Shuffle arena board"
                >
                  <Shuffle size={12} />
                  <span className="hidden sm:inline text-[9px] font-mono font-bold">Shuffle</span>
                </button>
              )}
            </div>

            <span
              className={`text-[7px] sm:text-[9px] font-mono uppercase tracking-wider font-bold mt-0.5 px-1 sm:px-1.5 py-0.2 rounded whitespace-nowrap ${
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
              flex items-center justify-end gap-1.5 sm:gap-2.5 p-1 sm:p-2 rounded-xl transition-all duration-300 text-right min-w-0
              ${
                !isPlayerTurn
                  ? "bg-rose-950/40 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500"
                  : "bg-white/[0.03] border border-white/5 opacity-85"
              }
            `}
          >
            {/* Stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-end gap-1 sm:gap-1.5 leading-none">
                <span className="font-mono text-[8px] sm:text-[10px] text-rose-400 font-bold shrink-0">
                  Sq {computerPosition.toString().padStart(2, "0")}
                </span>
                <span className="font-heading font-bold text-white text-[11px] sm:text-sm truncate max-w-[65px] xs:max-w-[90px] sm:max-w-none">
                  Ava <span className="text-[8px] sm:text-[9px] font-normal text-rose-300/80 font-mono">(AI)</span>
                </span>
              </div>

              {/* Score & Health */}
              <div className="flex items-center justify-end flex-wrap gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                {/* Shield badge */}
                {computerShields > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-mono font-bold text-teal-300 bg-teal-950/70 border border-teal-500/40 px-1 rounded shrink-0 leading-tight"
                    title={`${computerShields} shield active`}
                  >
                    <Shield size={8} className="fill-teal-400" />
                    {computerShields}
                  </span>
                )}

                {/* Hearts */}
                <div className="flex items-center gap-0.5 shrink-0" title={`${computerHearts} hearts remaining`}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Heart
                      key={i}
                      size={10}
                      className={
                        i < computerHearts
                          ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                          : "text-white/20 fill-white/10"
                      }
                    />
                  ))}
                </div>

                <span className="font-mono font-bold text-[10px] sm:text-sm text-rose-300 leading-none shrink-0">
                  {computerScore.toLocaleString()} <span className="text-[8px] sm:text-[9px] font-normal text-white/50">pts</span>
                </span>
              </div>
            </div>

            {/* Expressive Ava Avatar */}
            <div className="relative shrink-0">
              <GameAvatar type="computer" mood={computerMood} size="hud" className="w-7 h-7 sm:w-10 sm:h-10" />
              {!isPlayerTurn && (
                <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 border-2 border-[#0a0a28] animate-ping" />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
