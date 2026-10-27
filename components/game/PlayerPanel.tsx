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
  const colorClass = tokenColor === "teal" ? "bg-teal-700" : "bg-[#8D1739]";
  const ringClass = isCurrentTurn
    ? tokenColor === "teal"
      ? "ring-2 ring-teal-400"
      : "ring-2 ring-red-400"
    : "";

  return (
    <div className={`glass-card p-4 transition-all ${isCurrentTurn ? "shadow-md" : ""} ${ringClass}`}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {label[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{label}</p>
          {isCurrentTurn && (
            <p className="text-xs text-teal-600 font-medium">Active turn</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-black text-lg text-teal-700">{score.toLocaleString()}</p>
          <p className="text-xs text-gray-400">pts</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {/* Hearts */}
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }, (_, i) => (
            <Heart
              key={i}
              size={14}
              className={i < hearts ? "text-red-500 fill-red-500" : "text-gray-200 fill-gray-200"}
            />
          ))}
        </div>

        {/* Shields */}
        {shields > 0 && (
          <div className="flex items-center gap-1 text-teal-600">
            <Shield size={13} />
            <span className="text-xs font-semibold">{shields}</span>
          </div>
        )}

        {/* Position */}
        <div className="flex items-center gap-1 text-gray-500 ml-auto">
          <MapPin size={12} />
          <span className="text-xs">Sq {position}</span>
        </div>

        {/* Quiz */}
        {quizCorrect > 0 && (
          <div className="flex items-center gap-1 text-yellow-600">
            <Star size={12} className="fill-yellow-500" />
            <span className="text-xs">{quizCorrect}</span>
          </div>
        )}
      </div>
    </div>
  );
}
