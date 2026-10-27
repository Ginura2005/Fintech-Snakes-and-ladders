"use client";

import { Shield } from "lucide-react";

interface TreasureOverlayProps {
  points: number;
  shieldAwarded: boolean;
  onClose: () => void;
}

export default function TreasureOverlay({ points, shieldAwarded, onClose }: TreasureOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="text-6xl mb-4 animate-bounce-gentle">💰</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Treasure!</h2>
        <p className="text-gray-600 mb-4">You landed on a treasure square!</p>
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-lg font-bold text-teal-700">
            <span>+{points} points</span>
          </div>
          {shieldAwarded && (
            <div className="flex items-center justify-center gap-2 text-base font-semibold text-blue-700">
              <Shield size={18} />
              <span>Shield awarded!</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-90 transition-opacity"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
