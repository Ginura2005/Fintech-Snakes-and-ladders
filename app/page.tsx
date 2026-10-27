"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Play,
  ChevronRight,
  Shield,
  Heart,
  Zap,
  ArrowUpRight,
  HelpCircle,
  Award,
  Sparkles,
} from "lucide-react";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import MarqueeTicker from "@/components/layout/MarqueeTicker";

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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    fetch("/api/leaderboard?limit=5")
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.entries || []))
      .catch(() => {});

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
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      {/* Festival Header */}
      <FestivalHeader
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        signingIn={signingIn}
        activePath="/"
      />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION (Matching fintechfestival.lk aesthetic)
            ======================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-white/10">
          {/* Background visuals: Colombo skyline & circles */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
            <Image
              src="/hero/new-colombo-hero.webp"
              alt="Colombo Horizon"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#06061f] via-[#06061f]/85 to-[#06061f]" />
          </div>

          {/* Golden radial light spill */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#fec01f]/15 via-[#125252]/20 to-transparent blur-3xl opacity-70" />

          {/* Circular ripple overlay */}
          <div className="pointer-events-none absolute right-[-10%] top-[-10%] w-[600px] h-[600px] opacity-15">
            <Image
              src="/elements/circles.webp"
              alt="Festival rings"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Festival Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="section-badge section-badge-primary">
                <Sparkles size={14} className="text-[#fec01f] animate-pulse" />
                SRI LANKA FINTECH FESTIVAL 2026 · OFFICIAL GAME
              </span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              LANKA{" "}
              <span className="text-[#fec01f] drop-shadow-[0_0_40px_rgba(254,192,31,0.45)]">
                FINTECHVERSE
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-lg sm:text-xl text-white/75 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              Step into the cyber-fintech arena. Race against the computer across 25 dynamic squares,
              navigate high-risk financial snakes, conquer FinTech quiz questions, and climb the official festival leaderboard.
            </p>

            {/* Error Message */}
            {error && (
              <div className="max-w-md mx-auto mb-8 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/50 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* CTA Buttons */}
            {!loading && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link
                    href="/game"
                    className="interactive-btn interactive-btn--primary text-base sm:text-lg font-bold py-4 px-8 w-full sm:w-auto shadow-[0_0_30px_rgba(254,192,31,0.35)]"
                  >
                    <Play size={20} className="fill-current" />
                    <span>Enter Game Arena</span>
                    <ChevronRight size={20} />
                  </Link>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="interactive-btn interactive-btn--primary text-base sm:text-lg font-bold py-4 px-8 w-full sm:w-auto shadow-[0_0_30px_rgba(254,192,31,0.35)] disabled:opacity-60"
                  >
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {signingIn ? "Connecting with Google…" : "Sign In to Play"}
                  </button>
                )}

                <Link
                  href="/leaderboard"
                  className="interactive-btn interactive-btn--outline text-base font-semibold py-4 px-7 w-full sm:w-auto"
                >
                  <Trophy size={18} className="text-[#fec01f]" />
                  <span>View Leaderboard</span>
                </Link>

                <a
                  href="https://fintechfestival.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-[#fec01f] transition-colors py-2 px-3"
                >
                  <span>Main Website</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            )}

            {/* Festival campaign tagline */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono uppercase tracking-widest text-white/50">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fec01f]" />
                1 Official Run Per Account
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#125252]" />
                25 Cyber Squares
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8d1739]" />
                High-Risk Snakes
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fec01f]" />
                Live Festival Ranks
              </span>
            </div>
          </div>
        </section>

        {/* Marquee Ticker */}
        <MarqueeTicker />

        {/* ========================================================
            GAME MECHANICS SECTION
            ======================================================== */}
        <section className="py-16 sm:py-24 border-b border-white/10 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="section-badge section-badge-on-dark mb-3">
                ARENA RULES &amp; FEATURES
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mt-2 text-white">
                How to Play the FinTechverse
              </h2>
              <p className="text-white/70 text-sm sm:text-base mt-3">
                Master the rules of financial strategy, roll the dice, and navigate the board to victory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Play size={22} className="text-[#fec01f]" />,
                  badge: "Rule 01",
                  title: "One Official Run",
                  desc: "Each Google account has one permanent official run. Your moves and decisions are persisted in real time.",
                  border: "hover:border-[#fec01f]/60",
                },
                {
                  icon: <Zap size={22} className="text-[#2dd4bf]" />,
                  badge: "Rule 02",
                  title: "Race to Square 25",
                  desc: "Roll the dice and race against the autonomous computer. Climb ladders for shortcuts; watch out for venomous snakes.",
                  border: "hover:border-teal-500/60",
                },
                {
                  icon: <Heart size={22} className="text-[#fb7185]" />,
                  badge: "Rule 03",
                  title: "3 Hearts & Shields",
                  desc: "Major-risk financial snakes cost 1 heart. Lose all 3 and you're eliminated. Collect shields on treasure squares to safeguard your run.",
                  border: "hover:border-rose-500/60",
                },
                {
                  icon: <HelpCircle size={22} className="text-[#fec01f]" />,
                  badge: "Rule 04",
                  title: "FinTech Quizzes",
                  desc: "Landing on quiz squares triggers curated Sri Lankan & global FinTech questions. Answer correctly for +50 bonus points.",
                  border: "hover:border-[#fec01f]/60",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`festival-card p-6 flex flex-col justify-between ${item.border} group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 px-2 py-0.5 rounded border border-white/10">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2 group-hover:text-[#fec01f] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/65 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SCORING BREAKDOWN
            ======================================================== */}
        <section className="py-16 sm:py-20 border-b border-white/10 bg-white/[0.01]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="section-badge section-badge-teal mb-3">
                POINTS ECONOMY
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white">
                Festival Scoring System
              </h2>
            </div>

            <div className="festival-panel p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Every square moved forward", "+10 pts", "text-[#2dd4bf]"],
                  ["Reaching square 25 (Finish)", "+300 pts", "text-[#fec01f]"],
                  ["Defeating the Computer", "+200 pts", "text-[#fec01f]"],
                  ["Correct FinTech quiz answer", "+50 pts", "text-[#2dd4bf]"],
                  ["Treasure square collected", "+50 pts", "text-[#2dd4bf]"],
                  ["Climbing a ladder shortcut", "+25 pts", "text-[#2dd4bf]"],
                  ["Each heart remaining at end", "+100 pts", "text-[#2dd4bf]"],
                  ["Ordinary snake penalty", "-10 pts", "text-[#fb7185]"],
                  ["Major-risk snake penalty", "-25 pts & ❤️", "text-[#fb7185]"],
                ].map(([label, score, colorClass], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5"
                  >
                    <span className="text-sm text-white/80">{label}</span>
                    <span className={`font-mono text-sm font-bold ${colorClass}`}>
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            LEADERBOARD PREVIEW (Podium format)
            ======================================================== */}
        {leaderboard.length > 0 && (
          <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                <div>
                  <span className="section-badge section-badge-primary mb-2">
                    COMPETITION STANDINGS
                  </span>
                  <h2 className="font-heading text-3xl font-bold text-white">
                    Top Festival Champions
                  </h2>
                </div>
                <Link
                  href="/leaderboard"
                  className="interactive-btn interactive-btn--outline text-xs uppercase tracking-wider py-2.5 px-4"
                >
                  <span>Full Leaderboard</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="festival-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono uppercase tracking-wider text-white/50">
                        <th className="py-4 px-5">Rank</th>
                        <th className="py-4 px-5">Player</th>
                        <th className="py-4 px-5 text-right">Score</th>
                        <th className="py-4 px-5 text-right hidden sm:table-cell">Quiz Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-xs font-bold ${
                                entry.rank === 1
                                  ? "bg-[#fec01f] text-black shadow-[0_0_15px_rgba(254,192,31,0.5)]"
                                  : entry.rank === 2
                                  ? "bg-slate-300 text-black"
                                  : entry.rank === 3
                                  ? "bg-amber-600 text-white"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-medium text-white">
                            <div className="flex items-center gap-2">
                              <span>{entry.displayName}</span>
                              {entry.playerWon && (
                                <span className="text-xs px-2 py-0.5 rounded bg-teal-900/60 border border-teal-500/40 text-teal-300">
                                  Won
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right font-mono font-bold text-[#fec01f] text-base">
                            {entry.finalScore.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-white/60 hidden sm:table-cell">
                            {entry.quizCorrect} Correct
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Festival Footer */}
      <FestivalFooter />
    </div>
  );
}
