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
  ShieldCheck,
  Heart,
  Zap,
  ExternalLink,
  HelpCircle,
  Award,
  Sparkles,
  Puzzle,
  Gamepad2,
  Grid3X3,
  AlertTriangle,
  Crown,
  Sun,
  Target,
  TrendingUp,
  Binary,
} from "lucide-react";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import MarqueeTicker from "@/components/layout/MarqueeTicker";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";

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
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      // If code query parameter landed on root page, forward to callback route to complete exchange
      window.location.replace(`/auth/callback${window.location.search}`);
      return;
    }

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

    if (params.get("error")) {
      const errParam = params.get("error");
      const errDesc = params.get("error_description");
      setError(
        errDesc ||
          (errParam === "auth_failed"
            ? "Sign-in failed. Please try again."
            : decodeURIComponent(errParam!))
      );
    }

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle(supabase, {
        nextUrl: "/game",
        onError: (err) => {
          setError(err.message);
          setSigningIn(false);
        },
      });
    } catch (err: any) {
      setError(err?.message || "Sign-in failed. Please try again.");
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
            HERO SECTION (Balanced paddings, clean buttons, no emojis)
            ======================================================== */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10">
          {/* Background visuals: Colombo skyline & circles */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
            <Image
              src="/hero/new-colombo-hero.webp"
              alt="Colombo Horizon"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06061f] via-[#06061f]/85 to-[#06061f]" />
          </div>

          {/* Golden radial light spill */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#fec01f]/15 via-[#125252]/20 to-transparent blur-3xl opacity-60" />

          {/* Circular ripple overlay */}
          <div className="pointer-events-none absolute right-[-10%] top-[-10%] w-[600px] h-[600px] opacity-15">
            <Image
              src="/elements/circles.webp"
              alt="Festival rings"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center pt-2 sm:pt-4">
            {/* Hero Main Heading */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-5">
              LANKA{" "}
              <span className="text-[#fec01f] drop-shadow-[0_0_35px_rgba(254,192,31,0.4)]">
                FINTECHVERSE
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
              Step into the official festival gaming arena. Race against the computer across 25 dynamic squares,
              navigate financial risks, solve FinTech quizzes, and compete for top leaderboard honors.
            </p>

            {/* Error Message */}
            {error && (
              <div className="max-w-md mx-auto mb-6 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs font-mono text-red-300">
                {error}
              </div>
            )}

            {/* Planned CTA Buttons — Standardized height (h-11 sm:h-12), consistent radius & padding */}
            {!loading && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
                {user ? (
                  <Link
                    href="/game"
                    className="h-11 sm:h-12 px-6 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(254,192,31,0.35)] w-full sm:w-auto active:scale-95 transition-all"
                  >
                    <Gamepad2 size={17} />
                    <span>Enter Arena</span>
                    <ChevronRight size={17} />
                  </Link>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="h-11 sm:h-12 px-6 rounded-xl bg-[#fec01f] hover:bg-[#e5ac1b] text-black font-semibold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_24px_rgba(254,192,31,0.35)] w-full sm:w-auto active:scale-95 transition-all disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>{signingIn ? "Connecting…" : "Sign In to Play"}</span>
                  </button>
                )}

                <Link
                  href="/game?mode=practice"
                  className="h-11 sm:h-12 px-5 rounded-xl border border-teal-500/40 bg-teal-950/30 hover:bg-teal-950/60 text-teal-300 font-semibold text-sm flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95 transition-all"
                >
                  <Play size={15} className="fill-current text-teal-300" />
                  <span>Practice Mode</span>
                </Link>

                <Link
                  href="/leaderboard"
                  className="h-11 sm:h-12 px-5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 font-semibold text-sm flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95 transition-all"
                >
                  <Trophy size={16} className="text-[#fec01f]" />
                  <span>Leaderboard</span>
                </Link>
              </div>
            )}

            {/* Subtle festival link */}
            <div className="mt-4">
              <a
                href="https://fintechfestival.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-[#fec01f] transition-colors py-1"
              >
                <span>Main Festival Portal</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Feature Status Row — Clean Lucide icons, no emojis */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono uppercase tracking-wider text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#fec01f]" />
                1 Official Run
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Grid3X3 size={14} className="text-teal-400" />
                25 Tiles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-400" />
                Hazard Snakes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy size={14} className="text-[#fec01f]" />
                Live Standings
              </span>
            </div>
          </div>
        </section>

        {/* Marquee Ticker */}
        <MarqueeTicker />

        {/* ========================================================
            GAME MECHANICS SECTION (Clean real icons)
            ======================================================== */}
        <section className="py-14 sm:py-20 border-b border-white/10 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-badge section-badge-on-dark mb-2.5">
                ARENA SYSTEM
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                How the Game Operates
              </h2>
              <p className="text-white/60 text-sm mt-2">
                A high-stakes strategy game combining board racing with Sri Lankan FinTech knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: <Play size={20} className="text-[#fec01f]" />,
                  badge: "01",
                  title: "One Official Run",
                  desc: "Each verified account receives one permanent official tournament match. Your decisions are securely locked in real time.",
                  border: "hover:border-[#fec01f]/60",
                },
                {
                  icon: <Zap size={20} className="text-[#2dd4bf]" />,
                  badge: "02",
                  title: "Race to Square 25",
                  desc: "Advance through authoritative dice rolls against the autonomous AI. Climb ladders to jump ahead; bypass danger squares.",
                  border: "hover:border-teal-500/60",
                },
                {
                  icon: <Heart size={20} className="text-[#fb7185]" />,
                  badge: "03",
                  title: "3 Hearts & Shields",
                  desc: "Major-risk financial snakes cost 1 heart. Safeguard your attempt by securing cyber shields on treasure vault squares.",
                  border: "hover:border-rose-500/60",
                },
                {
                  icon: <HelpCircle size={20} className="text-[#fec01f]" />,
                  badge: "04",
                  title: "FinTech Quizzes",
                  desc: "Landing on quiz squares delivers curated financial technology questions. Answer accurately for +50 bonus tournament points.",
                  border: "hover:border-[#fec01f]/60",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`festival-card p-5 sm:p-6 flex flex-col justify-between ${item.border} group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 py-0.5 rounded border border-white/10">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-white mb-2 group-hover:text-[#fec01f] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SCORING BREAKDOWN (Text-only, no emojis)
            ======================================================== */}
        <section className="py-14 sm:py-18 border-b border-white/10 bg-white/[0.01]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="section-badge section-badge-teal mb-2.5">
                POINTS ECONOMY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Official Points Table
              </h2>
            </div>

            <div className="festival-panel p-5 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Each square moved forward", "+10 pts", "text-[#2dd4bf]"],
                  ["Reaching square 25 (Finish)", "+300 pts", "text-[#fec01f]"],
                  ["Defeating the Computer", "+200 pts", "text-[#fec01f]"],
                  ["Correct FinTech quiz answer", "+50 pts", "text-[#2dd4bf]"],
                  ["Treasure vault collected", "+50 pts", "text-[#2dd4bf]"],
                  ["Climbing a ladder shortcut", "+25 pts", "text-[#2dd4bf]"],
                  ["Each heart preserved at end", "+100 pts", "text-[#2dd4bf]"],
                  ["Minor snake penalty", "-10 pts", "text-[#fb7185]"],
                  ["Major-risk snake penalty", "-25 pts & 1 Heart", "text-[#fb7185]"],
                ].map(([label, score, colorClass], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5"
                  >
                    <span className="text-xs sm:text-sm text-white/80">{label}</span>
                    <span className={`font-mono text-xs sm:text-sm font-bold ${colorClass}`}>
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PUZZLES ARENA SHOWCASE (Real Lucide icons, no emojis)
            ======================================================== */}
        <section className="py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-10">
              <div>
                <span className="section-badge section-badge-primary mb-2">
                  DAILY BRAIN ARENA
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  FinTech Logic Puzzles
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mt-1.5 max-w-xl">
                  Quick cognitive challenges inspired by LinkedIn daily brain games.
                  Solve Queens, Tango, Pinpoint, Crossclimb, Zip, and Sudoku.
                </p>
              </div>

              <Link
                href="/puzzles"
                className="h-10 px-4 rounded-xl border border-[#fec01f]/60 bg-[#fec01f]/15 hover:bg-[#fec01f]/25 text-[#fec01f] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center gap-2 shrink-0 transition-all"
              >
                <Puzzle size={15} />
                <span>Puzzles Hub</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {[
                {
                  id: "queens",
                  icon: <Crown size={22} className="text-[#fec01f]" />,
                  title: "Queens",
                  badge: "Logic",
                  sub: "Placement",
                },
                {
                  id: "tango",
                  icon: <Sun size={22} className="text-amber-400" />,
                  title: "Tango",
                  badge: "Binary",
                  sub: "Sun & Moon",
                },
                {
                  id: "pinpoint",
                  icon: <Target size={22} className="text-rose-400" />,
                  title: "Pinpoint",
                  badge: "Trivia",
                  sub: "5 Clues",
                },
                {
                  id: "crossclimb",
                  icon: <TrendingUp size={22} className="text-teal-400" />,
                  title: "Crossclimb",
                  badge: "Ladder",
                  sub: "Word Climb",
                },
                {
                  id: "zip",
                  icon: <Zap size={22} className="text-cyan-400" />,
                  title: "Zip",
                  badge: "Path",
                  sub: "Maze Route",
                },
                {
                  id: "mini-sudoku",
                  icon: <Binary size={22} className="text-indigo-400" />,
                  title: "Sudoku",
                  badge: "6x6",
                  sub: "Fast Logic",
                },
              ].map((p, idx) => (
                <Link
                  key={idx}
                  href={`/puzzles?game=${p.id}`}
                  className="festival-card p-4 flex flex-col items-center text-center group hover:border-[#fec01f]/60 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <span className="font-heading font-bold text-sm text-white group-hover:text-[#fec01f] transition-colors">
                    {p.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#fec01f] font-semibold mt-0.5">
                    {p.badge}
                  </span>
                  <span className="text-[11px] text-white/50 mt-1">
                    {p.sub}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            LEADERBOARD PREVIEW (Clean numeric badges, no emojis)
            ======================================================== */}
        {leaderboard.length > 0 && (
          <section className="py-14 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="section-badge section-badge-primary mb-2">
                    STANDINGS
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    Top Festival Champions
                  </h2>
                </div>
                <Link
                  href="/leaderboard"
                  className="h-9 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-wider text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trophy size={14} className="text-[#fec01f]" />
                  <span>Full Leaderboard</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="festival-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono uppercase tracking-wider text-white/50">
                        <th className="py-3.5 px-5">Rank</th>
                        <th className="py-3.5 px-5">Player Handle</th>
                        <th className="py-3.5 px-5 text-right">Score</th>
                        <th className="py-3.5 px-5 text-right hidden sm:table-cell">Quiz Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                entry.rank === 1
                                  ? "bg-[#fec01f] text-black shadow-[0_0_12px_rgba(254,192,31,0.5)]"
                                  : entry.rank === 2
                                  ? "bg-slate-300 text-black"
                                  : entry.rank === 3
                                  ? "bg-amber-600 text-white"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-sans font-medium text-white">
                            <div className="flex items-center gap-2">
                              <span>{entry.displayName}</span>
                              {entry.playerWon && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/60 border border-teal-500/40 text-teal-300 inline-flex items-center gap-1">
                                  <Award size={11} />
                                  <span>Won</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-right font-bold text-[#fec01f] text-base">
                            {entry.finalScore.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-5 text-right text-white/60 text-xs hidden sm:table-cell">
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
