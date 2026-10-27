"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Trophy, ArrowLeft } from "lucide-react";

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
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const load = async () => {
      // Get current user's display name
      const { data: { user } } = await supabase.auth.getUser();
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
  }, []);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 p-1">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-teal-600" />
            <h1 className="font-bold text-gray-800">Leaderboard</h1>
          </div>
          <span className="ml-auto text-sm text-gray-500">{total} players</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">LANKA FINTECHVERSE</h2>
          <p className="text-gray-600 text-sm">
            Sri Lanka FinTech Festival 2026 · 2–3 November
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Only players who opted in appear here. Leaderboard participation is voluntary.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold">No entries yet</p>
            <p className="text-sm mt-1">Be the first to opt in and claim the top spot!</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl brand-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity">
              Play Now
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-8">
                {/* 2nd */}
                <div className="text-center flex-1 max-w-[120px]">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-2xl font-black text-gray-500">
                    2
                  </div>
                  <p className="text-sm font-bold text-gray-700 truncate">{entries[1]?.displayName}</p>
                  <p className="text-teal-700 font-black">{entries[1]?.finalScore.toLocaleString()}</p>
                  <div className="h-16 bg-gray-100 rounded-t-xl mt-2" />
                </div>
                {/* 1st */}
                <div className="text-center flex-1 max-w-[140px]">
                  <div className="text-3xl mb-1">👑</div>
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2 text-3xl">
                    🏆
                  </div>
                  <p className="text-sm font-bold text-gray-800 truncate">{entries[0]?.displayName}</p>
                  <p className="text-teal-700 font-black text-lg">{entries[0]?.finalScore.toLocaleString()}</p>
                  <div className="h-24 bg-yellow-50 border border-yellow-200 rounded-t-xl mt-2" />
                </div>
                {/* 3rd */}
                <div className="text-center flex-1 max-w-[120px]">
                  <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-2 text-2xl font-black text-orange-500">
                    3
                  </div>
                  <p className="text-sm font-bold text-gray-700 truncate">{entries[2]?.displayName}</p>
                  <p className="text-teal-700 font-black">{entries[2]?.finalScore.toLocaleString()}</p>
                  <div className="h-10 bg-orange-50 rounded-t-xl mt-2" />
                </div>
              </div>
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">Player</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider hidden sm:table-cell">Quiz</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider hidden md:table-cell">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {entries.map((entry) => {
                      const isCurrentUser = currentUserName && entry.displayName === currentUserName;
                      return (
                        <tr
                          key={entry.rank}
                          className={`transition-colors hover:bg-gray-50 ${isCurrentUser ? "bg-teal-50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              entry.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                              entry.rank === 2 ? "bg-gray-100 text-gray-600" :
                              entry.rank === 3 ? "bg-orange-100 text-orange-700" :
                              "text-gray-500"
                            }`}>
                              {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank - 1] : entry.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {entry.displayName}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">You</span>
                              )}
                              {entry.playerWon && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full">🏆 Won</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-black text-teal-700">{entry.finalScore.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                            {entry.quizCorrect} ✓
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                            {formatDuration(entry.durationSeconds)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Load more */}
            {entries.length < total && (
              <div className="text-center mt-4">
                <button
                  onClick={loadMore}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}

        {/* Tie-break explanation */}
        <div className="mt-8 p-4 glass-card text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600 mb-2">Ranking tie-breakers (in order):</p>
          <p>1. Highest final score</p>
          <p>2. Reached square 25 (win)</p>
          <p>3. Most correct quiz answers</p>
          <p>4. Most hearts remaining</p>
          <p>5. Shortest gameplay duration</p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl brand-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity">
            Play Now
          </Link>
        </div>
      </div>
    </main>
  );
}
