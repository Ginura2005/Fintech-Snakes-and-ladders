"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Play,
  ChevronRight,
  ShieldCheck,
  Heart,
  Zap,
  ExternalLink,
  HelpCircle,
  Award,
  Puzzle,
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
import TournamentCountdown from "@/components/tournament/TournamentCountdown";
import FestivalButton from "@/components/ui/FestivalButton";
import SectionBadge from "@/components/ui/SectionBadge";
import CirclesPattern from "@/components/ui/CirclesPattern";
import SignInRequiredModal from "@/components/auth/SignInRequiredModal";
import { getSafeNextPath } from "@/lib/auth/safe-next-path";
import { getOutcomeBadgeLabel } from "@/lib/tournament/deadline";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  finalScore: number;
  playerWon: boolean;
  quizCorrect: number;
  heartsRemaining: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [pendingNext, setPendingNext] = useState("/game");

  const supabase = createClient();

  const clearAuthQueryParams = useCallback(() => {
    const url = new URL(window.location.href);
    const keys = ["next", "signin", "error", "error_description"];
    let changed = false;
    keys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });
    if (changed) {
      const clean = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, "", clean || "/");
    }
  }, []);

  const openSignInModal = useCallback(
    (nextPath = "/game") => {
      setPendingNext(getSafeNextPath(nextPath, "/game"));
      setSignInOpen(true);
      clearAuthQueryParams();
    },
    [clearAuthQueryParams]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      window.location.replace(`/auth/callback${window.location.search}`);
      return;
    }

    const nextFromQuery = params.get("next");
    const legacySignInRequired =
      params.get("signin") === "required" || params.has("signin");

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser && nextFromQuery) {
        const safe = getSafeNextPath(nextFromQuery, "/game");
        clearAuthQueryParams();
        router.replace(safe);
        return;
      }

      if (!currentUser && (nextFromQuery || legacySignInRequired)) {
        openSignInModal(nextFromQuery || "/game");
      }
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
      clearAuthQueryParams();
    }

    return () => subscription.unsubscribe();
  }, [supabase.auth, clearAuthQueryParams, openSignInModal, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <SignInRequiredModal
        open={signInOpen}
        nextUrl={pendingNext}
        onClose={() => setSignInOpen(false)}
      />

      <FestivalHeader
        user={user}
        onSignIn={() => openSignInModal("/game")}
        onSignOut={handleSignOut}
        activePath="/"
      />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION (Balanced paddings, clean buttons, no emojis)
            ======================================================== */}
        <section className="relative isolate overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="/hero/new-colombo-hero.jpg"
              alt=""
              fill
              className="object-cover object-center opacity-40"
              priority
              sizes="100vw"
            />
            {/* Soft navy veil — daytime sky needs a bit more cover for copy contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#06061f]/55 via-[#06061f]/78 to-[#06061f]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06061f]/35 via-transparent to-[#06061f]/35" />
          </div>

          {/* Brand rings on both edges, dissolve toward center/text */}
          <CirclesPattern tone="on-dark" placement="hero" />

          <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop text-center pt-2 sm:pt-4 flex flex-col items-center">
            {/* Mobile: countdown above brand copy; desktop keeps it under CTAs */}
            <div className="order-1 sm:order-4 w-full mb-1 sm:mb-0">
              <TournamentCountdown className="!my-0 sm:!my-8" />
            </div>

            <h1 className="order-2 sm:order-1 font-heading text-[clamp(1.65rem,7.5vw,4.5rem)] sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-4 sm:mb-5 break-words px-1">
              LANKA{" "}
              <span className="text-primary">FINTECHVERSE</span>
            </h1>

            <p className="order-3 sm:order-2 text-sm sm:text-lg text-white/75 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              The official Snakes &amp; Ladders experience of Sri Lanka FinTech Festival 2026.
              Race across 25 squares, answer FinTech quizzes, and climb the live leaderboard.
            </p>

            {error && (
              <div
                role="alert"
                className="order-4 sm:order-3 max-w-md mx-auto mb-5 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs font-mono text-red-300 text-left"
              >
                {error}
              </div>
            )}

            <div className="order-5 sm:order-3 flex flex-col xs:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 max-w-xl mx-auto min-h-[48px] w-full">
              {loading ? (
                <>
                  <div className="h-12 w-full sm:w-44 rounded-xl bg-white/10 animate-pulse" aria-hidden />
                  <div className="h-12 w-full sm:w-36 rounded-xl bg-white/10 animate-pulse" aria-hidden />
                  <div className="h-12 w-full sm:w-32 rounded-xl bg-white/10 animate-pulse" aria-hidden />
                  <span className="sr-only">Loading actions…</span>
                </>
              ) : (
                <>
                  {user ? (
                    <FestivalButton href="/game" className="w-full sm:w-auto text-sm">
                      <span>Enter Arena</span>
                      <ChevronRight size={16} aria-hidden />
                    </FestivalButton>
                  ) : (
                    <FestivalButton
                      onClick={() => openSignInModal("/game")}
                      className="w-full sm:w-auto text-sm"
                    >
                      <svg width="16" height="16" className="shrink-0" viewBox="0 0 24 24" aria-hidden>
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
                      <span>Sign In to Play</span>
                    </FestivalButton>
                  )}

                  <FestivalButton
                    href="/game?mode=practice"
                    variant="outline"
                    className="w-full sm:w-auto text-sm"
                  >
                    <Play size={16} className="fill-current shrink-0" aria-hidden />
                    <span>Practice Mode</span>
                  </FestivalButton>

                  <FestivalButton
                    href="/leaderboard"
                    variant="secondary"
                    className="w-full sm:w-auto text-sm"
                  >
                    <span>Leaderboard</span>
                  </FestivalButton>
                </>
              )}
            </div>

            <div className="order-6 sm:order-5 mt-2">
              <a
                href="https://fintechfestival.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-primary transition-colors py-2 min-h-[44px]"
              >
                <span>Main Festival Portal</span>
                <ExternalLink size={12} aria-hidden />
              </a>
            </div>

            <div className="order-7 sm:order-6 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-8 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-white/60 w-full">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary shrink-0" aria-hidden />
                1 Official Run
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Grid3X3 size={14} className="text-brand-teal-bright shrink-0" aria-hidden />
                25 Tiles
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-brand-rose shrink-0" aria-hidden />
                Hazard Snakes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy size={14} className="text-primary shrink-0" aria-hidden />
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
              <SectionBadge className="mb-2.5">How it works</SectionBadge>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                How the Game Works
              </h2>
              <p className="text-white/60 text-sm mt-2">
                Board racing combined with Sri Lankan FinTech knowledge — one official run per account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: <Play size={20} className="text-primary" />,
                  badge: "01",
                  title: "One Official Run",
                  desc: "Each verified account receives one permanent official tournament match. Your decisions are securely locked in real time.",
                },
                {
                  icon: <Zap size={20} className="text-brand-teal-bright" />,
                  badge: "02",
                  title: "Race to Square 25",
                  desc: "Advance through authoritative dice rolls against the autonomous AI. Climb ladders to jump ahead; bypass danger squares.",
                },
                {
                  icon: <Heart size={20} className="text-brand-rose" />,
                  badge: "03",
                  title: "3 Hearts & Shields",
                  desc: "Major-risk financial snakes cost 1 heart. Safeguard your attempt by securing cyber shields on treasure vault squares.",
                },
                {
                  icon: <HelpCircle size={20} className="text-primary" />,
                  badge: "04",
                  title: "FinTech Quizzes",
                  desc: "Landing on quiz squares delivers curated financial technology questions. Answer accurately for +50 bonus tournament points.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="festival-card p-5 sm:p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/45 px-2 py-0.5 rounded border border-white/15">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-white mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
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
              <SectionBadge variant="teal" className="mb-2.5">
                Scoring
              </SectionBadge>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Official Points Table
              </h2>
            </div>

            <div className="festival-panel p-5 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  ["Each square moved forward", "+10 pts", "text-brand-teal-bright"],
                  ["Reaching square 25 (Finish)", "+300 pts", "text-primary"],
                  ["Defeating the Computer", "+200 pts", "text-primary"],
                  ["Correct FinTech quiz answer", "+50 pts", "text-brand-teal-bright"],
                  ["Treasure vault collected", "+50 pts", "text-brand-orange"],
                  ["Climbing a ladder shortcut", "+25 pts", "text-brand-teal-bright"],
                  ["Each heart preserved at end", "+100 pts", "text-brand-teal-bright"],
                  ["Minor snake penalty", "-10 pts", "text-brand-rose"],
                  ["Major-risk snake penalty", "-25 pts & 1 Heart", "text-brand-rose"],
                ].map(([label, score, colorClass], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/10"
                  >
                    <span className="text-xs sm:text-sm text-white/80 text-left">{label}</span>
                    <span className={`font-mono text-xs sm:text-sm font-bold shrink-0 ${colorClass}`}>
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
                <SectionBadge variant="primary" className="mb-2">
                  Daily puzzles
                </SectionBadge>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  FinTech Logic Puzzles
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mt-1.5 max-w-xl">
                  Quick challenges: Queens, Tango, Pinpoint, Crossclimb, Zip, and Sudoku.
                </p>
              </div>

              <FestivalButton
                href="/puzzles"
                variant="outline"
                className="text-xs uppercase tracking-wider shrink-0 min-h-10 py-2.5"
              >
                <Puzzle size={15} aria-hidden />
                Puzzles Hub
                <ChevronRight size={15} aria-hidden />
              </FestivalButton>
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
                  className="festival-card p-4 flex flex-col items-center text-center group transition-transform active:scale-[0.98] min-h-[44px]"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center mb-2.5">
                    {p.icon}
                  </div>
                  <span className="font-heading font-bold text-sm text-white group-hover:text-primary transition-colors">
                    {p.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold mt-0.5">
                    {p.badge}
                  </span>
                  <span className="text-[11px] text-white/55 mt-1">
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
                  <SectionBadge variant="primary" className="mb-2">
                    Standings
                  </SectionBadge>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    Top Festival Champions
                  </h2>
                </div>
                <FestivalButton
                  href="/leaderboard"
                  variant="secondary"
                  className="text-xs uppercase tracking-wider min-h-9 py-2"
                >
                  Full Leaderboard
                  <ChevronRight size={14} aria-hidden />
                </FestivalButton>
              </div>

              <div className="festival-card overflow-hidden">
                <div className="overflow-x-auto -mx-0">
                  <table className="w-full text-left text-sm min-w-[320px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-white/55">
                        <th className="py-3 px-3 sm:py-3.5 sm:px-5">Rank</th>
                        <th className="py-3 px-3 sm:py-3.5 sm:px-5">Player Handle</th>
                        <th className="py-3 px-3 sm:py-3.5 sm:px-5 text-right">Score</th>
                        <th className="py-3 px-3 sm:py-3.5 sm:px-5 text-right hidden sm:table-cell">Quiz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 font-mono">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className="hover:bg-white/[0.04] transition-colors"
                        >
                          <td className="py-3 px-3 sm:py-3.5 sm:px-5">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                entry.rank === 1
                                  ? "bg-primary text-black"
                                  : entry.rank === 2
                                  ? "bg-slate-300 text-black"
                                  : entry.rank === 3
                                  ? "bg-brand-orange text-white"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:py-3.5 sm:px-5 font-sans font-medium text-white">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate">{entry.displayName}</span>
                              {entry.playerWon && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-teal-500/40 bg-teal-950/50 text-teal-300 inline-flex items-center gap-1 shrink-0">
                                  <Award size={11} aria-hidden />
                                  <span>{getOutcomeBadgeLabel()}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:py-3.5 sm:px-5 text-right font-bold text-primary text-base whitespace-nowrap">
                            {entry.finalScore.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 sm:py-3.5 sm:px-5 text-right text-white/60 text-xs hidden sm:table-cell whitespace-nowrap">
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
