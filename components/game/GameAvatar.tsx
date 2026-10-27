"use client";

import React from "react";

export type AvatarMood = "idle" | "thinking" | "happy" | "worried" | "celebrating";

interface GameAvatarProps {
  type: "player" | "computer";
  mood?: AvatarMood;
  size?: "pawn" | "hud" | "lg";
  className?: string;
}

export default function GameAvatar({
  type,
  mood = "idle",
  size = "hud",
  className = "",
}: GameAvatarProps) {
  const isPlayer = type === "player";

  const sizeClasses = {
    pawn: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
    hud: "w-9 h-9 sm:w-11 sm:h-11",
    lg: "w-14 h-14 sm:w-16 sm:h-16",
  }[size];

  if (isPlayer) {
    // ── Human Player Avatar ("Trailblazer") ──
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white shadow-[0_2px_10px_rgba(254,192,31,0.5)] bg-gradient-to-br from-[#ffe072] via-[#fec01f] to-[#e5a00d] ${sizeClasses} ${className}`}
        title="You (Player)"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Background Aura */}
          <circle cx="50" cy="50" r="48" fill="#fec01f" />
          
          {/* Hair back */}
          <path d="M 24 45 C 24 25, 76 25, 76 45 C 76 56, 73 66, 73 66 L 27 66 C 27 66, 24 56, 24 45 Z" fill="#241b18" />

          {/* Shoulders / Tech Jacket */}
          <path d="M 16 92 C 16 74, 34 70, 50 70 C 66 70, 84 74, 84 92 Z" fill="#125252" />
          <path d="M 38 70 L 50 84 L 62 70 Z" fill="#2dd4bf" />

          {/* Neck */}
          <rect x="42" y="60" width="16" height="14" rx="4" fill="#f5c298" />

          {/* Face Head */}
          <ellipse cx="50" cy="48" rx="22" ry="24" fill="#fed8b3" />

          {/* Ears */}
          <circle cx="28" cy="48" r="5" fill="#f5c298" />
          <circle cx="72" cy="48" r="5" fill="#f5c298" />

          {/* Modern Hair Front */}
          <path d="M 28 38 C 34 22, 66 22, 72 38 C 66 32, 58 32, 50 35 C 42 32, 34 32, 28 38 Z" fill="#2d221e" />
          <path d="M 26 40 C 29 33, 40 28, 48 30 C 40 34, 36 38, 30 46 Z" fill="#1e1614" />

          {/* Eyebrows */}
          <path d="M 34 40 Q 40 37 44 40" stroke="#241b18" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 56 40 Q 60 37 66 40" stroke="#241b18" strokeWidth="2.5" strokeLinecap="round" />

          {/* Eyes based on Mood */}
          {mood === "happy" || mood === "celebrating" ? (
            <>
              {/* Happy Smiling Eyes */}
              <path d="M 34 47 Q 40 42 45 47" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
              <path d="M 55 47 Q 60 42 66 47" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : mood === "worried" ? (
            <>
              {/* Worried Wide Eyes */}
              <circle cx="39" cy="47" r="4.5" fill="#1c1917" />
              <circle cx="41" cy="45" r="1.5" fill="#fff" />
              <circle cx="61" cy="47" r="4.5" fill="#1c1917" />
              <circle cx="63" cy="45" r="1.5" fill="#fff" />
            </>
          ) : (
            <>
              {/* Normal Confident Eyes */}
              <circle cx="40" cy="47" r="3.5" fill="#1c1917" />
              <circle cx="41.5" cy="45.5" r="1.2" fill="#fff" />
              <circle cx="60" cy="47" r="3.5" fill="#1c1917" />
              <circle cx="61.5" cy="45.5" r="1.2" fill="#fff" />
            </>
          )}

          {/* Nose */}
          <path d="M 50 49 L 48 54 L 52 54" stroke="#e09f75" strokeWidth="1.8" strokeLinecap="round" />

          {/* Mouth */}
          {mood === "celebrating" || mood === "happy" ? (
            <path d="M 40 57 Q 50 67 60 57 Z" fill="#991b1b" stroke="#991b1b" strokeWidth="1" />
          ) : mood === "worried" ? (
            <path d="M 42 61 Q 50 56 58 61" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d="M 42 58 Q 50 64 58 58" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* FinTech Headset Microphone */}
          <path d="M 72 48 C 76 56, 70 65, 62 67" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="67" r="2.5" fill="#34d399" />
        </svg>
      </div>
    );
  }

  // ── Automated Rival Avatar ("Ava - FinTech Strategist") ──
  // Expressive, human-like AI competitor with glasses and dynamic mood reactions!
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white shadow-[0_2px_10px_rgba(244,63,94,0.5)] bg-gradient-to-br from-[#fb7185] via-[#8d1739] to-[#4c0519] ${sizeClasses} ${className}`}
      title="Ava (FinTech AI Rival)"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Background Ambient */}
        <circle cx="50" cy="50" r="48" fill="#8d1739" />

        {/* Hair Back */}
        <path d="M 22 46 C 22 20, 78 20, 78 46 C 78 62, 74 72, 74 72 L 26 72 C 26 72, 22 62, 22 46 Z" fill="#171221" />

        {/* High-Tech Blazer Jacket */}
        <path d="M 16 92 C 16 75, 34 71, 50 71 C 66 71, 84 75, 84 92 Z" fill="#240713" />
        <path d="M 37 71 L 50 86 L 63 71 Z" fill="#f43f5e" />

        {/* Neck */}
        <rect x="42" y="60" width="16" height="14" rx="4" fill="#eed2bc" />

        {/* Face */}
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#fde3cf" />

        {/* Ears */}
        <circle cx="28" cy="48" r="5" fill="#eed2bc" />
        <circle cx="72" cy="48" r="5" fill="#eed2bc" />

        {/* Stylish Hair Front (Side bang) */}
        <path d="M 26 38 C 30 22, 68 20, 74 38 C 68 28, 54 28, 44 32 C 34 36, 28 42, 26 48 Z" fill="#241a2f" />
        <path d="M 72 38 C 76 45, 74 54, 72 58 C 70 52, 70 44, 72 38 Z" fill="#171221" />

        {/* Eyebrows */}
        {mood === "thinking" ? (
          <>
            <path d="M 34 38 Q 40 33 45 38" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 41 Q 61 38 66 43" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : mood === "worried" ? (
          <>
            <path d="M 34 37 Q 40 41 45 38" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 38 Q 60 41 66 37" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 34 39 Q 40 36 45 39" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 39 Q 60 36 66 39" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Smart AR Spectacles (Teal frames) */}
        <rect x="31" y="42" width="16" height="11" rx="3" stroke="#2dd4bf" strokeWidth="2" fill="rgba(45,212,191,0.15)" />
        <rect x="53" y="42" width="16" height="11" rx="3" stroke="#2dd4bf" strokeWidth="2" fill="rgba(45,212,191,0.15)" />
        <line x1="47" y1="46" x2="53" y2="46" stroke="#2dd4bf" strokeWidth="2" />
        {/* Frame temples */}
        <line x1="28" y1="45" x2="31" y2="45" stroke="#2dd4bf" strokeWidth="2" />
        <line x1="69" y1="45" x2="72" y2="45" stroke="#2dd4bf" strokeWidth="2" />

        {/* Eyes Behind Glasses */}
        {mood === "celebrating" || mood === "happy" ? (
          <>
            <path d="M 34 48 Q 39 44 44 48" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 56 48 Q 61 44 66 48" stroke="#171221" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : mood === "thinking" ? (
          <>
            {/* Eyes looking upward */}
            <circle cx="41" cy="46" r="3.5" fill="#171221" />
            <circle cx="42" cy="45" r="1.2" fill="#fff" />
            <circle cx="63" cy="46" r="3.5" fill="#171221" />
            <circle cx="64" cy="45" r="1.2" fill="#fff" />
          </>
        ) : mood === "worried" ? (
          <>
            {/* Shocked/worried wide eyes */}
            <circle cx="39" cy="48" r="4" fill="#171221" />
            <circle cx="40.5" cy="46.5" r="1.5" fill="#fff" />
            <circle cx="61" cy="48" r="4" fill="#171221" />
            <circle cx="62.5" cy="46.5" r="1.5" fill="#fff" />
            {/* Sweat drop on cheek */}
            <ellipse cx="30" cy="56" rx="2" ry="3" fill="#38bdf8" />
          </>
        ) : (
          <>
            {/* Friendly focused eyes */}
            <circle cx="39" cy="48" r="3.5" fill="#171221" />
            <circle cx="40.5" cy="46.5" r="1.2" fill="#fff" />
            <circle cx="61" cy="48" r="3.5" fill="#171221" />
            <circle cx="62.5" cy="46.5" r="1.2" fill="#fff" />
          </>
        )}

        {/* Nose */}
        <path d="M 50 51 L 48 55 L 52 55" stroke="#deb191" strokeWidth="1.8" strokeLinecap="round" />

        {/* Mouth */}
        {mood === "celebrating" || mood === "happy" ? (
          <path d="M 41 59 Q 50 68 59 59 Z" fill="#e11d48" stroke="#e11d48" strokeWidth="1" />
        ) : mood === "worried" ? (
          <path d="M 43 62 Q 50 57 57 62" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
        ) : mood === "thinking" ? (
          <ellipse cx="50" cy="61" rx="2.5" ry="3" fill="#e11d48" />
        ) : (
          <path d="M 42 60 Q 50 65 58 60" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
