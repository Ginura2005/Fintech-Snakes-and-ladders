"use client";

import { useState } from "react";
import { Info, Heart, Shield, Zap, HelpCircle, Trophy, Dices, ArrowRight } from "lucide-react";
import Image from "next/image";

interface OnboardingModalProps {
  googleName: string;
  onComplete: (displayName: string, leaderboardOptIn: boolean) => void;
}

export default function OnboardingModal({ googleName, onComplete }: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState(
    googleName.replace(/[^a-zA-Z0-9 _\-]/g, "").trim().slice(0, 30) || ""
  );
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
    if (error) {
      setNameError(error);
      return;
    }
    setStep(2);
  };

  const handleStart = () => {
    const error = validateName(displayName);
    if (error) {
      setNameError(error);
      return;
    }
    onComplete(displayName.trim(), leaderboardOptIn);
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#06061f] flex items-center justify-center p-3 sm:p-4 relative overflow-y-auto pt-safe pb-safe">
      {/* Background glow and rings */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#fec01f]/15 to-transparent blur-3xl opacity-60" />
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] w-[500px] h-[500px] opacity-10">
        <Image src="/elements/circles.webp" alt="" fill className="object-contain" />
      </div>

      <div className="festival-panel max-w-md w-full overflow-hidden bg-[#0a0a28]/95 border-2 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 max-h-[90dvh] overflow-y-auto">
        {/* Header with Festival Logo */}
        <div className="p-5 sm:p-6 text-center border-b border-white/10 bg-white/[0.02]">
          <div className="relative h-9 w-40 sm:h-10 sm:w-48 mx-auto mb-2.5 sm:mb-3">
            <Image
              src="/long-logo-removebg-preview.png"
              alt="Sri Lanka FinTech Festival"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="section-badge section-badge-primary text-[9px] sm:text-[10px] mb-1.5 sm:mb-2">
            OFFICIAL FESTIVAL ARENA
          </span>
          <h1 className="font-heading text-lg sm:text-xl font-bold text-white mt-1">LANKA FINTECHVERSE</h1>
          <p className="font-mono text-xs text-white/60">Snakes &amp; Ladders Arena</p>
        </div>

        <div className="p-5 sm:p-8">
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white mb-2">Welcome, Innovator!</h2>
              <p className="text-white/70 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
                Choose your public player handle for the festival leaderboard and match records.
              </p>

              {/* Name input (minimum 16px font-size to prevent iOS Safari auto-zoom) */}
              <div className="mb-5 sm:mb-6">
                <label className="block font-mono text-[11px] sm:text-xs uppercase tracking-wider text-white/70 mb-2">
                  Player Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setNameError("");
                  }}
                  maxLength={30}
                  placeholder="e.g. Satoshi_LK"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-base sm:text-sm font-mono focus:outline-none focus:border-[#fec01f] focus:ring-1 focus:ring-[#fec01f] transition-all touch-manipulation"
                />
                {nameError && (
                  <p className="text-rose-400 text-xs font-mono mt-1.5">{nameError}</p>
                )}
                <p className="text-white/40 text-[11px] sm:text-xs font-mono mt-2">
                  2–30 chars · letters, numbers, spaces, hyphens
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full min-h-[48px] py-3.5 rounded-xl interactive-btn interactive-btn--primary font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(254,192,31,0.3)] touch-manipulation flex items-center justify-center"
              >
                Proceed to Briefing →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up space-y-4 sm:space-y-5">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white">Arena Briefing</h2>

              {/* Rules highlight */}
              <div className="space-y-2 text-xs font-mono text-white/80">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                  <Dices size={16} className="text-[#fec01f] shrink-0" />
                  <span><strong>1 Official Run:</strong> Your official score is locked upon match conclusion.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                  <Heart size={16} className="text-rose-400 shrink-0" />
                  <span><strong>3 Hearts:</strong> Major-risk snakes deduct 1 heart. Reach 0 and you are eliminated.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                  <HelpCircle size={16} className="text-[#fec01f] shrink-0" />
                  <span><strong>Quizzes &amp; Treasures:</strong> Answer correctly for bonus score &amp; collect shields.</span>
                </div>
              </div>

              {/* Leaderboard opt-in checkbox */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#fec01f]/10 border border-[#fec01f]/30">
                <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leaderboardOptIn}
                    onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#fec01f] accent-[#fec01f] focus:ring-[#fec01f]"
                  />
                  <div>
                    <span className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
                      <Trophy size={13} className="text-[#fec01f]" />
                      Publish my score to the Festival Leaderboard
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-white/60 mt-1 leading-normal">
                      Opt in to let other attendees see your score &amp; ranking. You can change this anytime.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-2.5 sm:gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="min-h-[46px] py-3 px-4 rounded-xl border border-white/15 bg-white/5 text-white/70 text-xs font-mono uppercase tracking-wider hover:text-white hover:border-white/30 transition-colors touch-manipulation"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 min-h-[46px] py-3.5 rounded-xl interactive-btn interactive-btn--primary font-bold text-sm shadow-[0_0_20px_rgba(254,192,31,0.3)] flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  <span>Enter the Arena</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <p className="text-[10px] sm:text-[11px] text-center text-white/50 leading-relaxed font-mono pt-1">
                By entering, you agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-white/70 hover:text-[#fec01f] transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-white/70 hover:text-[#fec01f] transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
