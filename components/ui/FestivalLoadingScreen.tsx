"use client";

import React from "react";
import Image from "next/image";

interface FestivalLoadingScreenProps {
  label?: string;
  sublabel?: string;
  compact?: boolean;
}

export default function FestivalLoadingScreen({
  label = "Entering FinTech Arena…",
  sublabel = "Sri Lanka FinTech Festival 2026",
  compact = false,
}: FestivalLoadingScreenProps) {
  return (
    <div
      className={`min-h-screen min-h-dvh bg-[#06061f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none ${
        compact ? "py-12" : ""
      }`}
      role="status"
      aria-label={label}
    >
      {/* Background circular ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full bg-[#fec01f]/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[600px] h-[480px] sm:h-[600px] rounded-full bg-teal-500/8 blur-[120px] pointer-events-none" />

      {/* Main Round Container */}
      <div className="relative flex flex-col items-center text-center z-10 max-w-sm w-full">
        {/* Round Animated Hero Medallion */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          {/* Outer glowing orbital gradient ring */}
          <div
            className="absolute -inset-2.5 rounded-full border-2 border-transparent border-t-[#fec01f] border-r-teal-400 border-b-[#fec01f]/30 border-l-transparent animate-spin pointer-events-none"
            style={{ animationDuration: "2.4s" }}
          />

          {/* Secondary counter-rotating dashed orbit */}
          <div
            className="absolute -inset-1 rounded-full border border-dashed border-white/20 animate-spin pointer-events-none"
            style={{ animationDuration: "9s", animationDirection: "reverse" }}
          />

          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-[#fec01f]/10 blur-md pointer-events-none" />

          {/* Circular Token Surface */}
          <div className="relative w-full h-full rounded-full border-2 border-[#fec01f]/80 bg-gradient-to-b from-[#182052] via-[#0d1033] to-[#06081e] shadow-[0_0_45px_rgba(254,192,31,0.35),inset_0_0_25px_rgba(254,192,31,0.2)] flex items-center justify-center p-5 overflow-hidden">
            {/* Concentric subtle circular track inside token */}
            <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-[#fec01f]/20 pointer-events-none" />

            {/* Official Festival Circular Emblem */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <Image
                src="/short-logo-removebg-preview.png"
                alt="Sri Lanka FinTech Festival"
                fill
                className="object-contain drop-shadow-[0_0_16px_rgba(254,192,31,0.65)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Title & Brand */}
        <h2 className="font-heading font-extrabold text-base sm:text-lg tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fec01f] to-white drop-shadow-sm">
          Lanka FinTechverse
        </h2>

        {/* Animated Status Pill */}
        <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fec01f] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fec01f]" />
          </span>
          <span className="text-xs font-mono font-medium text-white/80 tracking-wide">
            {label}
          </span>
        </div>

        {/* Subtitle / Festival Note */}
        <p className="mt-4 text-[10px] sm:text-[11px] font-mono text-white/45 tracking-widest uppercase">
          {sublabel}
        </p>
      </div>
    </div>
  );
}
