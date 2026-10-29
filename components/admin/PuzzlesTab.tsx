"use client";

import { useState, useEffect } from "react";
import {
  Puzzle,
  Crown,
  Sun,
  Target,
  TrendingUp,
  Binary,
  Grid3X3,
  Clock,
  Award,
} from "lucide-react";

interface PuzzlesTabProps {
  adminKey?: string;
}

export default function PuzzlesTab({ adminKey = "" }: PuzzlesTabProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        const headers: Record<string, string> = adminKey ? { "x-admin-key": adminKey } : {};
        const res = await fetch("/api/admin/puzzles", {
          headers,
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzles();
  }, [adminKey]);

  const puzzleIcons: Record<string, any> = {
    queens: Crown,
    tango: Sun,
    pinpoint: Target,
    crossclimb: TrendingUp,
    zip: Binary,
    "mini-sudoku": Grid3X3,
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#125252]/40 via-[#06061f] to-[#8d1739]/30 border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#fec01f]/10 border border-[#fec01f]/30 flex items-center justify-center text-[#fec01f]">
            <Puzzle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Daily Cognitive Mini-Games Hub (`/puzzles`)
            </h3>
            <p className="text-xs text-white/60">
              6 LinkedIn-style daily logic challenges designed to build FinTech problem-solving stamina.
            </p>
          </div>
        </div>
      </div>

      {/* Scoring Matrix Card */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#fec01f] font-bold mb-4 flex items-center gap-2">
          <Award size={16} />
          <span>Scoring Matrix &amp; Arena Bonus Transfer Rules</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-white/50 block text-[11px] mb-1">Base Clear</span>
            <span className="text-sm font-bold text-white">15 – 25 pts</span>
            <p className="text-[10px] text-white/40 mt-1">Based on grid dimension &amp; difficulty</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-white/50 block text-[11px] mb-1">Speed Bonus</span>
            <span className="text-sm font-bold text-emerald-400">+5 pts</span>
            <p className="text-[10px] text-white/40 mt-1">Solved in under 120 seconds</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-white/50 block text-[11px] mb-1">Clean Bonus</span>
            <span className="text-sm font-bold text-cyan-400">+5 pts</span>
            <p className="text-[10px] text-white/40 mt-1">0 mistakes or reveals made</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-white/50 block text-[11px] mb-1">Streak Bonus</span>
            <span className="text-sm font-bold text-[#fec01f]">+5 pts</span>
            <p className="text-[10px] text-white/40 mt-1">Consecutive daily puzzle plays</p>
          </div>
        </div>
      </div>

      {/* 6 Mini-Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data?.puzzles?.map((p: any) => {
          const Icon = puzzleIcons[p.id] || Puzzle;

          return (
            <div
              key={p.id}
              className="bg-white/[0.02] border border-white/10 hover:border-[#fec01f]/40 rounded-2xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#fec01f]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <span className="text-[10px] font-mono text-[#fec01f] block">
                        {p.mechanicType}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  {p.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-white/5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-white/60">
                    <span>Theme Concept:</span>
                    <span className="text-white truncate max-w-[150px]">{p.theme}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Base Reward:</span>
                    <span className="text-[#fec01f] font-bold">{p.basePoints}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Avg Solvetime:</span>
                    <span className="text-white">{p.averageDuration}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex flex-wrap gap-1">
                {p.difficultyLevels?.map((lvl: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-white/60"
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
