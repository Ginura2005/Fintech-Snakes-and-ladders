"use client";

import { useState } from "react";
import { Heart, Trophy, Dices, HelpCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import FestivalButton from "@/components/ui/FestivalButton";
import SectionBadge from "@/components/ui/SectionBadge";

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
    <div className="min-h-screen min-h-dvh bg-background flex items-center justify-center p-3 sm:p-4 relative overflow-y-auto pt-safe pb-safe">
      <div className="festival-panel max-w-md w-full overflow-hidden relative z-10 max-h-[90dvh] overflow-y-auto">
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
          <SectionBadge variant="primary" className="text-[9px] sm:text-[10px] mb-1.5 sm:mb-2">
            Official festival game
          </SectionBadge>
          <h1 className="font-heading text-lg sm:text-xl font-bold text-white mt-1">LANKA FINTECHVERSE</h1>
          <p className="font-mono text-xs text-white/60">Snakes &amp; Ladders</p>
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

              <FestivalButton
                onClick={handleNext}
                className="w-full text-sm sm:text-base touch-manipulation"
              >
                Continue
              </FestivalButton>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up space-y-4 sm:space-y-5">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white">Quick rules</h2>

              <div className="space-y-2 text-xs font-mono text-white/80">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                  <Dices size={16} className="text-primary shrink-0" aria-hidden />
                  <span><strong>1 Official Run:</strong> Your official score is locked when the match ends.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                  <Heart size={16} className="text-brand-rose shrink-0" aria-hidden />
                  <span><strong>3 Hearts:</strong> Major-risk snakes deduct 1 heart. Reach 0 and you are eliminated.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-2.5 sm:gap-3">
                  <HelpCircle size={16} className="text-primary shrink-0" aria-hidden />
                  <span><strong>Quizzes &amp; Treasures:</strong> Answer correctly for bonus score and collect shields.</span>
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
                <FestivalButton
                  onClick={handleStart}
                  className="flex-1 text-sm touch-manipulation"
                >
                  Enter the Arena
                  <ArrowRight size={15} aria-hidden />
                </FestivalButton>
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
