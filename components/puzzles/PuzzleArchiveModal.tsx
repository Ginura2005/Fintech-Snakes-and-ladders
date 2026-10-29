"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  Trophy,
  Flame,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { PuzzleStatsData, getDailyProgress } from "@/lib/puzzles/puzzle-storage";

interface PuzzleArchiveModalProps {
  stats: PuzzleStatsData;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

export default function PuzzleArchiveModal({
  stats,
  selectedDate,
  onSelectDate,
  onClose,
}: PuzzleArchiveModalProps) {
  const [filterMonth, setFilterMonth] = useState<number>(0); // 0 = current 30 days, -1 = previous 30 days

  const todayStr = new Date().toISOString().split("T")[0];

  // Generate list of dates for the past 30 days
  const pastDays: string[] = [];
  const offset = filterMonth * 30;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (i + Math.abs(offset)));
    pastDays.push(d.toISOString().split("T")[0]);
  }

  const formatDateHeader = (dStr: string) => {
    const [y, m, d] = dStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return {
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      monthDay: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="festival-panel max-w-2xl w-full max-h-[90vh] flex flex-col p-4 sm:p-6 space-y-4 border border-[#00f0ff]/40 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-white text-lg">
                  Daily Archive &amp; Time Machine
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
                  Seed History
                </span>
              </div>
              <p className="text-xs text-white/60">
                Browse past daily seeds, replay previous editions, and recover missed streaks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1.5 rounded-md hover:bg-white/10"
            aria-label="Close archive"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected date status & Reset to Today button */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white/50">Active Seed Date:</span>
            <span className="font-bold text-[#fec01f] px-2 py-0.5 rounded bg-[#fec01f]/10 border border-[#fec01f]/30">
              {selectedDate === todayStr ? `Today (${selectedDate})` : selectedDate}
            </span>
          </div>

          {selectedDate !== todayStr && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 transition-colors uppercase font-bold text-[11px]"
            >
              <RotateCcw size={12} />
              <span>Jump to Today</span>
            </button>
          )}
        </div>

        {/* 30-Day Calendar Grid */}
        <div className="overflow-y-auto space-y-2 pr-1 flex-1 max-h-[50vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {pastDays.map((dStr) => {
              const { weekday, monthDay } = formatDateHeader(dStr);
              const progress = getDailyProgress(dStr, stats);
              const isToday = dStr === todayStr;
              const isSelected = dStr === selectedDate;

              return (
                <button
                  key={dStr}
                  onClick={() => onSelectDate(dStr)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#00f0ff]/15 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.25)] ring-1 ring-[#00f0ff]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                        {weekday} {isToday && "· TODAY"}
                      </span>
                      <span className="font-heading font-bold text-white text-sm">
                        {monthDay}
                      </span>
                    </div>

                    {progress.isGrandSlam ? (
                      <span className="text-[#fec01f]" title="Daily Grand Slam (6/6)">
                        <Trophy size={16} />
                      </span>
                    ) : progress.isTrifecta ? (
                      <span className="text-teal-300" title="Daily Trifecta (3/6)">
                        <Sparkles size={16} />
                      </span>
                    ) : progress.solvedCount > 0 ? (
                      <span className="text-emerald-400">
                        <CheckCircle2 size={15} />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/60">
                      {progress.solvedCount} / 6 Solved
                    </span>
                    {progress.isGrandSlam && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#fec01f]">
                        Grand Slam
                      </span>
                    )}
                    {progress.isTrifecta && !progress.isGrandSlam && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-teal-300">
                        Trifecta
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-teal-300">
              <Sparkles size={12} /> Trifecta: 3+ Solved (+15 pts)
            </span>
            <span className="flex items-center gap-1 text-[#fec01f]">
              <Trophy size={12} /> Grand Slam: 6/6 (+35 pts)
            </span>
          </div>
          <button
            onClick={onClose}
            className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-1.5 px-4"
          >
            Apply &amp; Play
          </button>
        </div>
      </div>
    </div>
  );
}
