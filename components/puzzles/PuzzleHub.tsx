"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Flame, Trophy, Clock, Sparkles, Brain, CheckCircle2, ArrowRight } from "lucide-react";
import { PuzzleId } from "./puzzleTypes";
import { PUZZLES_META } from "./puzzleData";

interface PuzzleHubProps {
  onSelectPuzzle: (id: PuzzleId) => void;
}

export default function PuzzleHub({ onSelectPuzzle }: PuzzleHubProps) {
  const [completedCount, setCompletedCount] = useState(0);

  // Load local completion count
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fintechverse_puzzles_stats");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedCount(parsed.totalWins || 0);
      }
    } catch {
      // Ignored
    }
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 sm:p-10 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#fec01f]/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="section-badge section-badge-primary">
              LINKEDIN PUZZLES SUITE
            </span>
            <span className="section-badge section-badge-teal">
              SRI LANKA FINTECH FESTIVAL 2026
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Daily Coffee-Break <span className="text-[#fec01f]">Brain Games</span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Experience LinkedIn&apos;s most viral daily logic games reimagined for the FinTechverse.
            Test your spatial deduction, solve word ladders, connect single-trail mazes, and sharpen your financial intellect.
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono uppercase tracking-wider text-white/60">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Brain size={14} className="text-[#fec01f]" />
              <span>6 Official Games</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Clock size={14} className="text-teal-400" />
              <span>2-5 Min Each</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Trophy size={14} className="text-amber-400" />
              <span>Sharable LinkedIn Scores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 6 LinkedIn Puzzles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Choose Your Puzzle
            </h2>
            <p className="text-xs text-white/50 font-mono">
              6 handcrafted categories · Verified logical solutions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PUZZLES_META.map((puzzle) => (
            <div
              key={puzzle.id}
              className="festival-card p-6 flex flex-col justify-between group hover:border-[#fec01f]/50 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onSelectPuzzle(puzzle.id)}
            >
              {/* Card top badge & icon */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/15 bg-white/5 group-hover:scale-110 transition-transform shadow-inner"
                    style={{
                      boxShadow: `0 0 20px ${puzzle.color}20`,
                    }}
                  >
                    {puzzle.icon}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-white/70">
                    {puzzle.badge}
                  </span>
                </div>

                {/* Titles */}
                <h3 className="font-heading text-xl font-bold text-white group-hover:text-[#fec01f] transition-colors mb-1">
                  {puzzle.title}
                </h3>
                <p className="font-mono text-xs text-[#fec01f]/90 mb-3 font-semibold">
                  {puzzle.subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-white/65 leading-relaxed mb-6">
                  {puzzle.description}
                </p>
              </div>

              {/* Card footer details & CTA */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono text-white/50">
                  <span>⏱ {puzzle.estimatedTime}</span>
                  <span>•</span>
                  <span>{puzzle.difficulty}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPuzzle(puzzle.id);
                  }}
                  className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-2 px-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Play</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why LinkedIn Puzzles Section */}
      <div className="festival-panel p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#fec01f]" />
          <h3 className="font-heading font-bold text-lg text-white">
            Why We Built LinkedIn Puzzles for Lanka FinTechverse
          </h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
          LinkedIn revolutionized professional downtime by introducing quick, tactile logic puzzles designed for coffee breaks.
          For the Sri Lanka FinTech Festival 2026, we incorporated all 6 signature LinkedIn games into our arena—infused with digital payments,
          banking trivia, and algorithmic challenges. Play daily, share your scores with colleagues, and warm up your strategic instincts!
        </p>
      </div>
    </div>
  );
}
