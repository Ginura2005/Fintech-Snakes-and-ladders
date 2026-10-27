"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Trophy, Play, ChevronRight, Star, Shield, Heart, Zap } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  finalScore: number;
  playerWon: boolean;
  quizCorrect: number;
  heartsRemaining: number;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Load leaderboard preview
    fetch("/api/leaderboard?limit=5")
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.entries || []))
      .catch(() => {});

    // Check for error params
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_failed") {
      setError("Sign-in failed. Please try again.");
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/game`,
      },
    });
    if (error) {
      setError(error.message);
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="font-bold text-sm text-gray-800 hidden sm:block">
              Sri Lanka FinTech Festival 2026
            </span>
          </div>
          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/leaderboard"
                    className="text-sm text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
                  >
                    <Trophy size={14} />
                    <span className="hidden sm:inline">Leaderboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                  <Link
                    href="/game"
                    className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Play
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                  className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {signingIn ? "Signing in…" : "Sign In"}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        {/* Festival badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-medium text-yellow-800 mb-6">
          <Star size={14} className="fill-yellow-500 text-yellow-500" />
          Sri Lanka FinTech Festival 2026 · 2–3 November
        </div>

        {/* Game title */}
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-4 leading-tight">
          LANKA{" "}
          <span
            style={{ color: "#125252" }}
            className="relative inline-block"
          >
            FINTECHVERSE
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          The official FinTech Snakes &amp; Ladders game. Race against the computer,
          answer FinTech quizzes, and climb the leaderboard. One attempt per player.
        </p>

        {error && (
          <div className="max-w-md mx-auto mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {user ? (
              <Link
                href="/game"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl brand-gradient text-white text-lg font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Play size={20} className="fill-white" />
                Play Now
                <ChevronRight size={20} />
              </Link>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-teal-700 text-teal-700 text-lg font-bold hover:bg-teal-50 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {signingIn ? "Signing in…" : "Sign in with Google to Play"}
              </button>
            )}
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 text-base font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Trophy size={18} />
              View Leaderboard
            </Link>
          </div>
        )}

        {/* Campaign tagline */}
        <p className="mt-10 text-sm font-semibold text-gray-500 tracking-wider uppercase">
          Play the Game · Climb the Leaderboard · Challenge Your Friends
        </p>
      </section>

      {/* How to Play */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">How to Play</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Play size={24} className="text-teal-600" />,
              title: "One Official Attempt",
              desc: "Each Google account gets one official game. Your progress is saved automatically.",
            },
            {
              icon: <Zap size={24} className="text-yellow-500" />,
              title: "Race to Square 25",
              desc: "Roll the dice and race the computer. Ladders boost you forward; snakes send you back.",
            },
            {
              icon: <Heart size={24} className="text-red-500" />,
              title: "3 Hearts",
              desc: "Major-risk snakes cost a heart. Lose all three and you're eliminated. Shields protect you.",
            },
            {
              icon: <Star size={24} className="text-orange-500" />,
              title: "FinTech Quizzes",
              desc: "Land on quiz squares to answer FinTech questions and earn bonus points.",
            },
          ].map((item, i) => (
            <div key={i} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Scoring</h2>
        <div className="glass-card p-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Each square forward", "+10 pts"],
              ["Correct quiz answer", "+50 pts"],
              ["Treasure collected", "+50 pts"],
              ["Climbing a ladder", "+25 pts"],
              ["Each heart remaining", "+100 pts"],
              ["Reaching square 25", "+300 pts"],
              ["Defeating the computer", "+200 pts"],
              ["Ordinary snake", "−10 pts"],
              ["Major-risk snake", "−25 pts"],
            ].map(([event, score]) => (
              <div key={event} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 col-span-1">
                <span className="text-gray-600">{event}</span>
                <span className={`font-bold ${score.startsWith("+") ? "text-teal-700" : "text-red-600"}`}>
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {leaderboard.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Top Players</h2>
            <Link href="/leaderboard" className="text-sm text-teal-700 hover:text-teal-900 font-medium">
              View all →
            </Link>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Rank</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Player</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-medium">Score</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-medium hidden sm:table-cell">Quiz</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        entry.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                        entry.rank === 2 ? "bg-gray-100 text-gray-600" :
                        entry.rank === 3 ? "bg-orange-100 text-orange-700" :
                        "bg-gray-50 text-gray-500"
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {entry.displayName}
                      {entry.playerWon && <span className="ml-2 text-xs text-teal-600">🏆</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-teal-700">{entry.finalScore.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">{entry.quizCorrect} ✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-sm">SL</span>
        </div>
        <p className="text-gray-600 font-semibold">Sri Lanka FinTech Festival 2026</p>
        <p className="text-gray-400 text-sm mt-1">2–3 November 2026</p>
        <p className="text-gray-400 text-xs mt-4">
          LANKA FINTECHVERSE is a promotional game. All results are for entertainment purposes.
          Leaderboard participation is optional and requires explicit opt-in.
        </p>
      </footer>
    </main>
  );
}
