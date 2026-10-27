"use client";

import { Shield, Sparkles, Award } from "lucide-react";

interface TreasureOverlayProps {
  points: number;
  shieldAwarded: boolean;
  onClose: () => void;
}

export default function TreasureOverlay({ points, shieldAwarded, onClose }: TreasureOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#06061f]/85 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
      <div className="festival-panel max-w-sm w-full p-8 text-center bg-[#0a0a28]/95 border-2 border-orange-500/50 shadow-[0_0_50px_rgba(245,114,34,0.3)]">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-orange-400/40 flex items-center justify-center text-4xl shadow-inner animate-float-gentle">
          💰
        </div>

        <span className="section-badge section-badge-primary text-[10px] mb-3">
          TREASURE VAULT
        </span>

        <h2 className="font-heading text-2xl font-extrabold text-white mb-2">
          Treasure Acquired!
        </h2>
        <p className="text-white/70 text-sm mb-6">
          You navigated safely onto a festival treasure vault.
        </p>

        <div className="space-y-3 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-center gap-2 text-lg font-mono font-bold text-[#fec01f]">
            <span>+{points} Points Awarded</span>
          </div>
          {shieldAwarded && (
            <div className="flex items-center justify-center gap-2 text-sm font-mono font-semibold text-teal-300">
              <Shield size={16} className="fill-teal-400" />
              <span>Cyber Shield Added to Inventory!</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl interactive-btn interactive-btn--primary font-bold text-sm shadow-[0_0_20px_rgba(254,192,31,0.3)]"
        >
          Claim &amp; Continue →
        </button>
      </div>
    </div>
  );
}
