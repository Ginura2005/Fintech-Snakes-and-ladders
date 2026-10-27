"use client";

import { Heart, Shield, Star, MapPin } from "lucide-react";

interface PlayerPanelProps {
  label: string;
  hearts: number;
  shields: number;
  score: number;
  position: number;
  quizCorrect: number;
  isCurrentTurn: boolean;
  tokenColor: "teal" | "burgundy";
}

export default function PlayerPanel({
  label,
  hearts,
  shields,
  score,
  position,
  quizCorrect,
  isCurrentTurn,
  tokenColor,
}: PlayerPanelProps) {
  const isPlayer = tokenColor === "teal";
  const avatarBg = isPlayer
    ? "bg-gradient-to-br from-[#ffe072] to-[#fec01f] text-black"
    : "bg-gradient-to-br from-[#fb7185] to-[#8d1739] text-white";

  const ringClass = isCurrentTurn
    ? isPlayer
      ? "ring-2 ring-[#fec01f] shadow-[0_0_20px_rgba(254,192,31,0.25)] border-[#fec01f]/60"
      : "ring-2 ring-rose-500 shadow-[0_0_20px_rgba(251,113,133,0.25)] border-rose-500/60"
    : "border-white/10";

  return (
    <div
      className={`festival-card p-4 transition-all duration-300 ${ringClass} bg-[#0a0a28]/85`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0 shadow-md`}
        >
          {label[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-white text-sm truncate">{label}</p>
          {isCurrentTurn ? (
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#fec01f] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fec01f] animate-ping" />
              Active Turn
            </p>
          ) : (
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Waiting</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-lg text-[#fec01f] leading-none">
            {score.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mt-0.5">pts</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs border-t border-white/5 pt-2.5">
        {/* Hearts */}
        <div className="flex gap-1 items-center" title={`${hearts} hearts remaining`}>
          {Array.from({ length: 3 }, (_, i) => (
            <Heart
              key={i}
              size={14}
              className={
                i < hearts
                  ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                  : "text-white/20 fill-white/10"
              }
            />
          ))}
        </div>

        {/* Shields */}
        {shields > 0 && (
          <div
            className="flex items-center gap-1 text-teal-300 font-mono text-xs px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-500/40"
            title={`${shields} shields active`}
          >
            <Shield size={12} className="fill-teal-400 text-teal-400" />
            <span className="font-bold">{shields}</span>
          </div>
        )}

        {/* Position */}
        <div className="flex items-center gap-1 font-mono text-white/70 ml-auto">
          <MapPin size={12} className="text-[#fec01f]" />
          <span>Sq {position.toString().padStart(2, "0")}</span>
        </div>

        {/* Quiz count */}
        {quizCorrect > 0 && (
          <div className="flex items-center gap-1 font-mono text-amber-300">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{quizCorrect}</span>
          </div>
        )}
      </div>
    </div>
  );
}
