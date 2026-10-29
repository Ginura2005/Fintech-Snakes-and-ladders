"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Trophy, ArrowLeft, Clock, CheckCircle, Search, UserCheck, MapPin, Calendar, Award, Crown } from "lucide-react";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import TournamentCountdown from "@/components/tournament/TournamentCountdown";
import Skeleton from "@/components/ui/Skeleton";

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
  const [userRank, setUserRank] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const myRowRef = useRef<HTMLTableRowElement | null>(null);
  const PAGE_SIZE = 30;

  useEffect(() => {
    const load = async () => {
      // Get current user's profile
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
        const loadedEntries: LeaderboardEntry[] = data.entries || [];
        setEntries(loadedEntries);
        setTotal(data.total || 0);
      }
      setLoading(false);
    };
    load();
  }, [supabase.auth]);

  // Find user rank if present in entries
  useEffect(() => {
    if (currentUserName && entries.length > 0) {
      const match = entries.find((e) => e.displayName === currentUserName);
      if (match) {
        setUserRank(match.rank);
      }
    }
  }, [currentUserName, entries]);

  const scrollToMyRank = () => {
    if (myRowRef.current) {
      myRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

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

  const filteredEntries = entries.filter((entry) =>
    entry.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader user={user} activePath="/leaderboard" />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Presenter & Collaboration Header */}
        <div className="text-center mb-10 pt-2">
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Festival Hall of Fame
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-xs text-white/60 mt-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#fec01f]" />
              2–3 November 2026
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-teal-400" />
              Shangri-La Colombo, Sri Lanka
            </span>
            <span>·</span>
            <span className="text-[#fec01f] font-bold">
              {total} Tournament Competitors
            </span>
          </div>

          <p className="text-white/40 text-xs mt-2 max-w-xl mx-auto leading-relaxed">
            Official rankings for the Lanka FinTechverse Arena. Displays opted-in festival attendees.
            Tie-breakers follow official tournament rules.
          </p>

          {/* Quick jump to My Rank button */}
          {userRank && (
            <div className="mt-4">
              <button
                onClick={scrollToMyRank}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#fec01f]/20 via-[#f57222]/20 to-teal-900/30 border border-[#fec01f]/50 text-[#fec01f] font-mono text-xs font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(254,192,31,0.25)] cursor-pointer"
              >
                <UserCheck size={14} />
                <span>You are currently Rank #{userRank} — Click to Jump</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Tournament Deadline & Grand Prize Countdown */}
        <TournamentCountdown />

        {loading ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Podium Skeleton */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto items-end pt-8">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl border-[#fec01f]/30" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
            {/* Table Skeleton */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                  <Skeleton className="w-20 h-5" />
                </div>
              ))}
            </div>
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
            {/* Top 3 Podium Cards */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-3 gap-1.5 xs:gap-2.5 sm:gap-6 max-w-2xl mx-auto mb-8 sm:mb-10 items-end pt-6 sm:pt-8">
                {/* 2nd Place */}
                <div className="festival-card p-2 xs:p-3 sm:p-5 text-center border-slate-400/40 bg-[#090924]/90 flex flex-col items-center">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center mb-2 sm:mb-3 shadow-[0_0_15px_rgba(203,213,225,0.3)]">
                    <span className="text-sm xs:text-base sm:text-xl font-bold font-mono text-slate-200">#2</span>
                  </div>
                  <span className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                    Rank 2
                  </span>
                  <p className="font-heading font-bold text-[11px] xs:text-xs sm:text-sm text-white truncate max-w-full mt-0.5 sm:mt-1">
                    {entries[1]?.displayName}
                  </p>
                  <p className="font-mono font-bold text-xs xs:text-sm sm:text-base text-slate-200 mt-0.5 sm:mt-1">
                    {entries[1]?.finalScore.toLocaleString()} <span className="text-[9px] font-normal text-white/50">pts</span>
                  </p>
                </div>

                {/* 1st Place (Champion) */}
                <div className="festival-card p-2.5 xs:p-3.5 sm:p-6 text-center border-[#fec01f] bg-gradient-to-b from-[#fec01f]/20 via-[#0a0a2c] to-[#06061f] shadow-[0_0_40px_rgba(254,192,31,0.25)] flex flex-col items-center scale-105 z-10 -translate-y-2">
                  <Crown size={18} className="text-[#fec01f] mb-0.5 sm:mb-1 sm:w-5 sm:h-5" />
                  <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full bg-[#fec01f] text-black border-2 border-white flex items-center justify-center mb-2 sm:mb-3 shadow-[0_0_25px_rgba(254,192,31,0.6)]">
                    <Trophy size={20} className="fill-black sm:w-6 sm:h-6" />
                  </div>
                  <span className="section-badge section-badge-primary text-[8px] xs:text-[9px] sm:text-[10px] py-0.5 px-1.5 sm:px-2">
                    CHAMPION
                  </span>
                  <p className="font-heading font-extrabold text-xs xs:text-sm sm:text-base text-white truncate max-w-full mt-1 sm:mt-2">
                    {entries[0]?.displayName}
                  </p>
                  <p className="font-mono font-black text-sm xs:text-base sm:text-xl text-[#fec01f] mt-0.5 sm:mt-1">
                    {entries[0]?.finalScore.toLocaleString()} <span className="text-[10px] font-normal text-white/70">pts</span>
                  </p>
                </div>

                {/* 3rd Place */}
                <div className="festival-card p-2 xs:p-3 sm:p-5 text-center border-amber-600/40 bg-[#090924]/90 flex flex-col items-center">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center mb-2 sm:mb-3 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <span className="text-sm xs:text-base sm:text-xl font-bold font-mono text-amber-300">#3</span>
                  </div>
                  <span className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                    Rank 3
                  </span>
                  <p className="font-heading font-bold text-[11px] xs:text-xs sm:text-sm text-white truncate max-w-full mt-0.5 sm:mt-1">
                    {entries[2]?.displayName}
                  </p>
                  <p className="font-mono font-bold text-xs xs:text-sm sm:text-base text-amber-300 mt-0.5 sm:mt-1">
                    {entries[2]?.finalScore.toLocaleString()} <span className="text-[9px] font-normal text-white/50">pts</span>
                  </p>
                </div>
              </div>
            )}

            {/* Search Filter Bar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter by player handle…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-base sm:text-xs text-white placeholder-white/40 font-mono focus:border-[#fec01f] focus:outline-none transition-colors touch-manipulation"
                />
              </div>
              <span className="text-xs font-mono text-white/50 hidden sm:inline">
                Showing {filteredEntries.length} of {total}
              </span>
            </div>

            {/* Standings Table */}
            <div className="festival-card overflow-hidden border-white/15 bg-[#090924]/85 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
              <div className="overflow-x-auto touch-scroll">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono uppercase tracking-wider text-white/50">
                      <th className="py-3 px-3 sm:py-4 sm:px-5">Rank</th>
                      <th className="py-3 px-3 sm:py-4 sm:px-5">Player Handle</th>
                      <th className="py-3 px-3 sm:py-4 sm:px-5 text-right">Final Score</th>
                      <th className="py-3 px-3 sm:py-4 sm:px-5 text-right hidden sm:table-cell">Quiz Score</th>
                      <th className="py-3 px-3 sm:py-4 sm:px-5 text-right hidden md:table-cell">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {filteredEntries.map((entry) => {
                      const isCurrentUser = currentUserName && entry.displayName === currentUserName;
                      return (
                        <tr
                          key={entry.rank}
                          ref={isCurrentUser ? myRowRef : undefined}
                          className={`transition-colors hover:bg-white/[0.04] ${
                            isCurrentUser
                              ? "bg-[#fec01f]/15 ring-1 ring-[#fec01f]/40 font-semibold"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-3 sm:py-4 sm:px-5">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold font-mono ${
                                entry.rank === 1
                                  ? "bg-[#fec01f] text-black shadow-[0_0_12px_rgba(254,192,31,0.6)]"
                                  : entry.rank === 2
                                  ? "bg-slate-300 text-black shadow-[0_0_10px_rgba(203,213,225,0.4)]"
                                  : entry.rank === 3
                                  ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-5 font-sans font-medium text-white">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm">{entry.displayName}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#fec01f]/25 border border-[#fec01f]/50 text-[#fec01f] font-bold">
                                  YOU
                                </span>
                              )}
                              {entry.playerWon && (
                                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-teal-900/60 border border-teal-500/40 text-teal-300 inline-flex items-center gap-1">
                                  <Award size={10} />
                                  <span>WON</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-5 text-right font-bold text-[#fec01f] text-sm sm:text-base">
                            {entry.finalScore.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-5 text-right text-white/70 text-xs sm:text-sm hidden sm:table-cell">
                            {entry.quizCorrect} Correct
                          </td>
                          <td className="py-3 px-3 sm:py-4 sm:px-5 text-right text-white/40 text-xs hidden md:table-cell">
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
                  className="interactive-btn interactive-btn--outline text-xs uppercase tracking-wider py-3 px-6 cursor-pointer"
                >
                  Load More Ranks
                </button>
              </div>
            )}
          </>
        )}

        {/* Tie-Break Rules Card (Official Festival Standard) */}
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
            className="interactive-btn interactive-btn--primary text-sm font-bold py-3.5 px-8 shadow-[0_0_20px_rgba(254,192,31,0.3)] inline-flex items-center gap-2"
          >
            <span>Play The Festival Game</span>
            <span>→</span>
          </Link>
        </div>
      </main>

      <FestivalFooter />
    </div>
  );
}
