"use client";

import { useState } from "react";
import { Info, Heart, Shield, Zap, Star } from "lucide-react";

interface OnboardingModalProps {
  googleName: string;
  onComplete: (displayName: string, leaderboardOptIn: boolean) => void;
}

export default function OnboardingModal({ googleName, onComplete }: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState(googleName.replace(/[^a-zA-Z0-9 _\-]/g, "").trim().slice(0, 30) || "");
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [step, setStep] = useState(1);
  const [nameError, setNameError] = useState("");

  const validateName = (name: string) => {
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 30) return "Name must be 30 characters or less";
    if (!/^[a-zA-Z0-9][a-zA-Z0-9 _\-]*$/.test(name.trim())) {
      return "Only letters, numbers, spaces, hyphens, and underscores allowed";
    }
    return "";
  };

  const handleNext = () => {
    const error = validateName(displayName);
    if (error) { setNameError(error); return; }
    setStep(2);
  };

  const handleStart = () => {
    const error = validateName(displayName);
    if (error) { setNameError(error); return; }
    onComplete(displayName.trim(), leaderboardOptIn);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="brand-gradient p-6 text-white text-center">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
            Sri Lanka FinTech Festival 2026
          </p>
          <h1 className="text-2xl font-black">LANKA FINTECHVERSE</h1>
          <p className="text-sm opacity-80 mt-1">Snakes &amp; Ladders</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome!</h2>
              <p className="text-gray-600 text-sm mb-5">
                Set up your public display name to get started.
              </p>

              {/* Name input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setNameError(""); }}
                  maxLength={30}
                  placeholder="e.g. Nuwan_LK"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium transition-colors focus:outline-none ${
                    nameError ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-teal-500"
                  }`}
                />
                {nameError ? (
                  <p className="text-red-500 text-xs mt-1">{nameError}</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">{displayName.length}/30 · Letters, numbers, spaces, hyphens, underscores</p>
                )}
              </div>

              {/* One-run notice */}
              <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>One official attempt per account.</strong> Your game progress is automatically saved.
                  If you close the browser, you can resume from where you left off.
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-90 transition-opacity"
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Quick Rules</h2>
              <p className="text-gray-600 text-sm mb-4">Here's what you're playing for:</p>

              <div className="space-y-3 mb-5">
                {[
                  { icon: <Zap size={16} className="text-yellow-500" />, text: "Roll dice and race to square 25 before the computer." },
                  { icon: <Heart size={16} className="text-red-500" />, text: "You start with 3 hearts. Major-risk snakes cost a heart." },
                  { icon: <Shield size={16} className="text-blue-500" />, text: "Collect treasure for shields — they protect against heart loss." },
                  { icon: <Star size={16} className="text-orange-500" />, text: "Answer FinTech quiz questions for bonus points." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Leaderboard opt-in */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl mb-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leaderboardOptIn}
                    onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-teal-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-teal-800">Join the public leaderboard</p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      Your display name and score will appear publicly. You can opt out anytime.
                      Your email is never shared.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-90 transition-opacity"
                >
                  🎲 Start Playing!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
