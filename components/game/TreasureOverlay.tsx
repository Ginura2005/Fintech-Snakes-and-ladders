"use client";

import { Shield, Sparkles, Award, Gem } from "lucide-react";

interface TreasureOverlayProps {
  points: number;
  shieldAwarded: boolean;
  onClose: () => void;
}

export default function TreasureOverlay({ points, shieldAwarded, onClose }: TreasureOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#06061f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-slide-up">
      <div className="festival-panel max-w-sm w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-8 text-center bg-[#0a0a28]/95 border-2 border-orange-500/50 shadow-[0_0_50px_rgba(245,114,34,0.3)] pb-safe">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-orange-400/40 flex items-center justify-center shadow-inner animate-float-gentle text-orange-400">
          <Gem size={32} className="text-[#fec01f] drop-shadow-[0_0_12px_rgba(254,192,31,0.6)] sm:w-9 sm:h-9" />
        </div>

        <span className="section-badge section-badge-primary text-[10px] mb-2 sm:mb-3">
          TREASURE VAULT
        </span>

        <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white mb-1.5 sm:mb-2">
          Treasure Acquired!
        </h2>
        <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">
          You navigated safely onto a festival treasure vault.
        </p>

        <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-mono font-bold text-[#fec01f]">
            <span>+{points} Points Awarded</span>
          </div>
          {shieldAwarded && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-mono font-semibold text-teal-300">
              <Shield size={15} className="fill-teal-400" />
              <span>Cyber Shield Added to Inventory!</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full min-h-[46px] py-3 rounded-xl interactive-btn interactive-btn--primary font-bold text-sm shadow-[0_0_20px_rgba(254,192,31,0.3)] touch-manipulation"
        >
          Claim &amp; Continue →
        </button>
      </div>
    </div>
  );
}
