"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Trophy, ArrowLeft, Sparkles, Clock, CheckCircle } from "lucide-react";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  finalScore: number;
  playerWon: boolean;
  quizCorrect: number;
  heartsRemaining: number;
  durationSeconds: number | null;
}

export default function LeaderboardPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const load = async () => {
      // Get current user's display name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserName(data.profile?.display_name ?? null);
        }
      }

      // Load leaderboard
      const res = await fetch(`/api/leaderboard?limit=${PAGE_SIZE}&offset=0`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setTotal(data.total || 0);
      }
      setLoading(false);
    };
    load();
  }, [supabase.auth]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const res = await fetch(`/api/leaderboard?limit=${PAGE_SIZE}&offset=${nextPage * PAGE_SIZE}`);
    if (res.ok) {
      const data = await res.json();
      setEntries((prev) => [...prev, ...data.entries]);
      setPage(nextPage);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader user={user} activePath="/leaderboard" />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Intro Banner */}
        <div className="text-center mb-10">
          <span className="section-badge section-badge-primary mb-3">
            <Trophy size={13} className="text-[#fec01f]" />
            OFFICIAL FESTIVAL RANKINGS
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
            Festival Hall of Fame
          </h1>
          <p className="font-mono text-xs sm:text-sm text-white/60 mt-2">
            Sri Lanka FinTech Festival 2026 · {total} Players Registered
          </p>
          <p className="text-white/40 text-xs mt-1">
            Displaying opted-in players. Scores are updated automatically upon match completion.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-3 border-[#fec01f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="festival-panel p-12 text-center text-white/60 max-w-md mx-auto">
            <Trophy size={48} className="mx-auto mb-4 text-[#fec01f]/30" />
            <h3 className="font-heading font-bold text-lg text-white">No Official Records Yet</h3>
            <p className="text-xs font-mono text-white/60 mt-2 mb-6">
              Be the first to step into the arena and claim rank #1!
            </p>
            <Link
              href="/game"
              className="interactive-btn interactive-btn--primary text-sm font-bold"
            >
              Play Game Now
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-12 items-end pt-8">
                {/* 2nd Place */}
                <div className="festival-card p-3 sm:p-5 text-center border-slate-400/40 bg-[#090924]/90 flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(203,213,225,0.3)]">
                    <span className="text-xl sm:text-2xl font-bold text-slate-200">🥈</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                    Rank 2
                  </span>
                  <p className="font-heading font-bold text-xs sm:text-sm text-white truncate max-w-full mt-1">
                    {entries[1]?.displayName}
                  </p>
                  <p className="font-mono font-bold text-sm sm:text-base text-slate-200 mt-1">
                    {entries[1]?.finalScore.toLocaleString()}
                  </p>
                </div>

                {/* 1st Place (Champion) */}
                <div className="festival-card p-4 sm:p-6 text-center border-[#fec01f] bg-gradient-to-b from-[#fec01f]/20 via-[#0a0a2c] to-[#06061f] shadow-[0_0_40px_rgba(254,192,31,0.25)] flex flex-col items-center scale-105 z-10 -translate-y-2">
                  <span className="text-2xl mb-1 animate-bounce">👑</span>
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#fec01f] text-black border-2 border-white flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(254,192,31,0.6)]">
                    <Trophy size={28} className="fill-black" />
                  </div>
                  <span className="section-badge section-badge-primary text-[9px] sm:text-[10px] py-0.5 px-2">
                    CHAMPION
                  </span>
                  <p className="font-heading font-extrabold text-sm sm:text-base text-white truncate max-w-full mt-2">
                    {entries[0]?.displayName}
                  </p>
                  <p className="font-mono font-black text-lg sm:text-xl text-[#fec01f] mt-1">
                    {entries[0]?.finalScore.toLocaleString()}
                  </p>
                </div>

                {/* 3rd Place */}
                <div className="festival-card p-3 sm:p-5 text-center border-amber-600/40 bg-[#090924]/90 flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <span className="text-xl sm:text-2xl font-bold text-amber-400">🥉</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                    Rank 3
                  </span>
                  <p className="font-heading font-bold text-xs sm:text-sm text-white truncate max-w-full mt-1">
                    {entries[2]?.displayName}
                  </p>
                  <p className="font-mono font-bold text-sm sm:text-base text-amber-300 mt-1">
                    {entries[2]?.finalScore.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Standings Table */}
            <div className="festival-card overflow-hidden border-white/15 bg-[#090924]/85">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono uppercase tracking-wider text-white/50">
                      <th className="py-4 px-5">Rank</th>
                      <th className="py-4 px-5">Player Handle</th>
                      <th className="py-4 px-5 text-right">Final Score</th>
                      <th className="py-4 px-5 text-right hidden sm:table-cell">Quiz Score</th>
                      <th className="py-4 px-5 text-right hidden md:table-cell">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {entries.map((entry) => {
                      const isCurrentUser = currentUserName && entry.displayName === currentUserName;
                      return (
                        <tr
                          key={entry.rank}
                          className={`transition-colors hover:bg-white/[0.04] ${
                            isCurrentUser ? "bg-[#fec01f]/10" : ""
                          }`}
                        >
                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                entry.rank === 1
                                  ? "bg-[#fec01f] text-black shadow-[0_0_12px_rgba(254,192,31,0.6)]"
                                  : entry.rank === 2
                                  ? "bg-slate-300 text-black"
                                  : entry.rank === 3
                                  ? "bg-amber-600 text-white"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-sans font-medium text-white">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{entry.displayName}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fec01f]/20 border border-[#fec01f]/40 text-[#fec01f]">
                                  YOU
                                </span>
                              )}
                              {entry.playerWon && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-900/60 border border-teal-500/40 text-teal-300">
                                  🏆 WON
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right font-bold text-[#fec01f] text-base">
                            {entry.finalScore.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-right text-white/70 hidden sm:table-cell">
                            {entry.quizCorrect} Correct
                          </td>
                          <td className="py-4 px-5 text-right text-white/40 hidden md:table-cell">
                            {formatDuration(entry.durationSeconds)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Load More */}
            {entries.length < total && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  className="interactive-btn interactive-btn--outline text-xs uppercase tracking-wider py-3 px-6"
                >
                  Load More Ranks
                </button>
              </div>
            )}
          </>
        )}

        {/* Tie-Break Rules Card */}
        <div className="mt-10 p-5 festival-card border-white/10 bg-[#0a0a28]/80 text-xs font-mono text-white/60 space-y-2">
          <p className="font-bold text-white/80 uppercase tracking-wider text-[11px] mb-2 border-b border-white/5 pb-1">
            Official Tie-Breaker Precedence
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-white/60">
            <div>1. Highest Total Points</div>
            <div>2. Reached Finish Square (Win)</div>
            <div>3. Most Correct Quizzes</div>
            <div>4. Most Hearts Preserved</div>
            <div>5. Shortest Match Duration</div>
          </div>
        </div>

        {/* Play CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/game"
            className="interactive-btn interactive-btn--primary text-sm font-bold py-3.5 px-8 shadow-[0_0_20px_rgba(254,192,31,0.3)]"
          >
            Play The Festival Game
          </Link>
        </div>
      </main>

      <FestivalFooter />
    </div>
  );
}
