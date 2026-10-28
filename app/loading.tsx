import React from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-radial from-[#fec01f]/10 via-[#125252]/15 to-transparent blur-3xl -top-20" />
      <div className="pointer-events-none absolute w-[380px] h-[380px] rounded-full bg-radial from-[#8d1739]/15 to-transparent blur-3xl -bottom-20" />

      <div className="relative flex flex-col items-center max-w-sm text-center space-y-6">
        {/* Festival Long Logo */}
        <div className="relative w-48 h-12 animate-float-gentle">
          <Image
            src="/long-logo-removebg-preview.png"
            alt="Sri Lanka FinTech Festival"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Spinner */}
        <LoadingSpinner size="lg" label="Entering Lanka FinTechverse..." />

        {/* Subtitle */}
        <p className="text-xs font-mono text-white/50 tracking-wider">
          Connecting to Arena Network · Synchronizing Game Engine
        </p>
      </div>
    </div>
  );
}
