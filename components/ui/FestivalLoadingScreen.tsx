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
}: FestivalLoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 min-h-screen min-h-dvh bg-[#06061f] text-white flex flex-col items-center justify-center p-4 select-none z-50 overflow-hidden"
      role="status"
      aria-label={label}
    >
      {/* Background ambient radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-[#fec01f]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-teal-500/10 blur-[140px] pointer-events-none" />

      {/* TOP OUTSIDE BADGE (Matches dice arena layout) */}
      <div className="mb-3 sm:mb-4 z-10 flex flex-col items-center gap-1">
        <span className="px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-heading font-black tracking-widest uppercase bg-[#fec01f]/15 border border-[#fec01f]/50 text-[#fec01f] shadow-[0_0_20px_rgba(254,192,31,0.25)]">
          OFFICIAL FESTIVAL ARENA
        </span>
      </div>

      {/* THE PROMINENT CIRCULAR LOADING ARENA DISK */}
      <div className="relative w-[min(21rem,86vw)] h-[min(21rem,86vw)] sm:w-96 sm:h-96 rounded-full border-2 sm:border-4 border-[#fec01f] bg-gradient-to-b from-[#141a4a]/95 via-[#0b0e30]/98 to-[#040618] shadow-[0_0_80px_rgba(254,192,31,0.4),inset_0_0_55px_rgba(18,22,60,0.9)] flex flex-col items-center justify-center p-6 text-center shrink-0 z-10 overflow-hidden" style={{ borderRadius: "50%" }}>
        
        {/* Animated outer spinning orbital ring */}
        <div
          className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#fec01f] border-r-teal-400 border-b-[#fec01f]/40 animate-spin pointer-events-none"
          style={{ borderRadius: "50%", animationDuration: "2.4s" }}
        />

        {/* Concentric circular depth tracks */}
        <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" style={{ borderRadius: "50%" }} />
        <div className="absolute inset-6 rounded-full border border-[#fec01f]/20 pointer-events-none" style={{ borderRadius: "50%" }} />
        <div
          className="absolute inset-9 rounded-full border border-dashed border-teal-400/20 animate-spin pointer-events-none"
          style={{ borderRadius: "50%", animationDuration: "12s", animationDirection: "reverse" }}
        />

        {/* Festival Circular Mark in center */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2 z-10">
          <Image
            src="/short-logo-removebg-preview.png"
            alt="Sri Lanka FinTech Festival"
            fill
            className="object-contain drop-shadow-[0_0_16px_rgba(254,192,31,0.7)] animate-float-gentle"
            priority
          />
        </div>

        {/* Title */}
        <h2 className="font-heading font-extrabold text-sm sm:text-base tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fec01f] to-white z-10 drop-shadow">
          Lanka FinTechverse
        </h2>

        {/* Animated Status Pill */}
        <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md z-10 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fec01f] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fec01f]" />
          </span>
          <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wide">
            {label}
          </span>
        </div>

        {/* Sublabel inside circle */}
        <p className="mt-2 text-[9px] sm:text-[10px] font-mono text-white/50 tracking-widest uppercase z-10">
          {sublabel}
        </p>
      </div>

      {/* BOTTOM OUTSIDE SUBTEXT */}
      <div className="mt-3 sm:mt-4 z-10 text-center">
        <span className="text-[10px] sm:text-xs font-mono text-white/40 tracking-widest uppercase">
          Colombo, Sri Lanka · 2–3 November 2026
        </span>
      </div>
    </div>
  );
}
