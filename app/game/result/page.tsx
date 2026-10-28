"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Share2,
  Download,
  Copy,
  Check,
  Heart,
  Star,
  Shield,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Bot,
  Gem,
  Clock,
  MessageSquare,
  Link as LinkIcon,
  RotateCcw,
  Info,
  Puzzle,
} from "lucide-react";
import VictoryConfetti from "@/components/game/VictoryConfetti";
import TournamentCountdown from "@/components/tournament/TournamentCountdown";
import { generateResultCardBlob } from "@/lib/utils/card-generator";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getArenaPuzzleBonus } from "@/lib/puzzles/puzzle-storage";

interface GameRun {
  status: string;
  player_score: number;
  player_hearts: number;
  player_shields: number;
  player_quiz_correct: number;
  player_position: number;
  player_treasures_collected: number[];
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

interface Profile {
  display_name: string;
  leaderboard_opt_in: boolean;
}

function ResultContent() {
  const router = useRouter();
  const supabase = createClient();
  const cardRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [run, setRun] = useState<GameRun | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [downloadingPost, setDownloadingPost] = useState(false);
  const [downloadingStory, setDownloadingStory] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [updatingOptIn, setUpdatingOptIn] = useState(false);
  const [puzzleBonus, setPuzzleBonus] = useState(0);

  const searchParams = useSearchParams();

  useEffect(() => {
    setPuzzleBonus(getArenaPuzzleBonus());
    const load = async () => {
      const modeParam = searchParams.get("mode");
      if (modeParam === "practice" || (typeof window !== "undefined" && sessionStorage.getItem("practice_run"))) {
        const raw = sessionStorage.getItem("practice_run");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setRun({
              status: parsed.status,
              player_score: parsed.playerScore ?? parsed.player_score ?? 0,
              player_hearts: parsed.playerHearts ?? parsed.player_hearts ?? 0,
              player_shields: parsed.playerShields ?? parsed.player_shields ?? 0,
              player_quiz_correct: parsed.playerQuizCorrect ?? parsed.player_quiz_correct ?? 0,
              player_position: parsed.playerPosition ?? parsed.player_position ?? 25,
              player_treasures_collected: parsed.playerTreasuresCollected ?? parsed.player_treasures_collected ?? [],
              started_at: parsed.startedAt ?? parsed.started_at ?? new Date().toISOString(),
              completed_at: parsed.completedAt ?? parsed.completed_at ?? new Date().toISOString(),
              duration_seconds: parsed.durationSeconds ?? parsed.duration_seconds ?? 45,
            });
            setProfile({
              display_name: "Practice Pilot",
              leaderboard_opt_in: false,
            });
            setLoading(false);
            return;
          } catch (e) {
            console.error("Failed to parse practice run", e);
          }
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push("/");
        return;
      }

      const res = await fetch("/api/game/state");
      if (res.ok) {
        const data = await res.json();
        if (!data.run) {
          router.push("/");
          return;
        }
        setRun(data.run);
        setProfile(data.profile);
        setLeaderboardOptIn(data.profile?.leaderboard_opt_in ?? false);

        // Fetch rank if opted in
        if (data.profile?.leaderboard_opt_in) {
          const cardRes = await fetch("/api/share/card");
          if (cardRes.ok) {
            const cardData = await cardRes.json();
            setRank(cardData.rank);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [router, searchParams, supabase.auth]);

  const getOrGenerateShareUrl = async (): Promise<string> => {
    if (shareUrl) return shareUrl;
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/share/link", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.url);
        return data.url;
      }
    } finally {
      setGeneratingLink(false);
    }
    return typeof window !== "undefined" ? window.location.origin : "https://fintechfestival.lk";
  };

  const handleGenerateLink = async () => {
    await getOrGenerateShareUrl();
  };

  const handleShareWhatsApp = async () => {
    const target = await getOrGenerateShareUrl();
    const scoreText = run?.player_score ? run.player_score.toLocaleString() : "0";
    const text = `I scored ${scoreText} points in LANKA FINTECHVERSE at the Sri Lanka FinTech Festival 2026! Can you beat my score?\n\nChallenge me here: ${target}\n\n#SLFinTechFest2026`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareLinkedIn = async () => {
    const target = await getOrGenerateShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(target)}`, "_blank");
  };

  const handleShareTwitter = async () => {
    const target = await getOrGenerateShareUrl();
    const scoreText = run?.player_score ? run.player_score.toLocaleString() : "0";
    const text = `I just scored ${scoreText} pts in LANKA FINTECHVERSE! Race against autonomous AI at the Sri Lanka FinTech Festival 2026. Can you beat me?`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(target)}&hashtags=SLFinTechFest2026,FinTechSriLanka`,
      "_blank"
    );
  };

  const handleDownloadCard = async (format: "post" | "story") => {
    if (!run) return;
    if (format === "post") setDownloadingPost(true);
    else setDownloadingStory(true);

    try {
      let targetUrl = shareUrl;
      if (!targetUrl) {
        targetUrl = await getOrGenerateShareUrl();
      }

      const blob = await generateResultCardBlob({
        format,
        displayName: profile?.display_name || "Festival Player",
        finalScore: run.player_score,
        rank: leaderboardOptIn ? rank : null,
        outcome: run.status as any,
        heartsRemaining: run.player_hearts,
        quizCorrect: run.player_quiz_correct,
        treasuresCollected: (run.player_treasures_collected || []).length,
        challengeUrl: targetUrl || window.location.origin,
        festivalDates: "2–3 November 2026",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintechverse-${format}-${run.player_score}pts.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Card generation failed:", err);
    } finally {
      if (format === "post") setDownloadingPost(false);
      else setDownloadingStory(false);
    }
  };

  const handleCopyLink = async () => {
    const target = await getOrGenerateShareUrl();
    await navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const target = await getOrGenerateShareUrl();
    const text = `I scored ${run?.player_score?.toLocaleString()} points in LANKA FINTECHVERSE! Can you beat me?\n\nSri Lanka FinTech Festival 2026`;
    try {
      await navigator.share({ title: "LANKA FINTECHVERSE", text, url: target });
    } catch {
      handleCopyLink();
    }
  };

  const handleOptInChange = async (optIn: boolean) => {
    setUpdatingOptIn(true);
    setLeaderboardOptIn(optIn);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaderboardOptIn: optIn }),
    });
    if (res.ok) {
      if (optIn) {
        const cardRes = await fetch("/api/share/card");
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          setRank(cardData.rank);
        }
      } else {
        setRank(null);
      }
    }
    setUpdatingOptIn(false);
  };

  if (loading || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06061f]">
        <LoadingSpinner size="lg" label="Computing Arena Results..." />
      </div>
    );
  }

  const isWin = run.status === "player_won";
  const isEliminated = run.status === "player_eliminated";
  const durationMinutes = run.duration_seconds ? Math.floor(run.duration_seconds / 60) : null;

  return (
    <div className="min-h-screen min-h-dvh bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      {isWin && <VictoryConfetti />}
      <FestivalHeader user={user} activePath="/game/result" />

      <main className="flex-1 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-5 sm:space-y-6 pb-safe">
        {/* Main Result Showcase Card */}
        <div
          ref={cardRef}
          className={`festival-panel p-8 sm:p-10 text-center relative overflow-hidden border-2 ${
            isWin
              ? "border-[#fec01f] bg-gradient-to-b from-[#fec01f]/15 via-[#0c0c32] to-[#06061f] shadow-[0_0_50px_rgba(254,192,31,0.25)]"
              : isEliminated
              ? "border-rose-500/50 bg-gradient-to-b from-rose-950/30 via-[#0c0c32] to-[#06061f]"
              : "border-white/20 bg-gradient-to-b from-white/5 via-[#0c0c32] to-[#06061f]"
          }`}
        >
          {/* Festival Logo */}
          <div className="relative h-10 w-44 mx-auto mb-4">
            <Image
              src="/long-logo-removebg-preview.png"
              alt="Sri Lanka FinTech Festival"
              fill
              className="object-contain"
            />
          </div>

          <span
            className={`section-badge mb-4 text-xs ${
              isWin ? "section-badge-primary" : isEliminated ? "section-badge-burgundy" : "section-badge-on-dark"
            }`}
          >
            {isWin ? "MATCH VICTORY" : isEliminated ? "MATCH CONCLUDED" : "MATCH COMPLETED"}
          </span>

          {/* Outcome Emblem */}
          <div className="my-4 animate-float-gentle flex items-center justify-center">
            {isWin ? (
              <Trophy size={60} className="text-[#fec01f] drop-shadow-[0_0_24px_rgba(254,192,31,0.65)]" />
            ) : isEliminated ? (
              <ShieldAlert size={60} className="text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
            ) : (
              <Bot size={60} className="text-slate-400 drop-shadow-[0_0_20px_rgba(148,163,184,0.4)]" />
            )}
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-2">
            {isWin ? "Victory in the Arena!" : isEliminated ? "Eliminated by High-Risk Snakes" : "Computer Reached Finish First"}
          </h1>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-8">
            {isWin
              ? "Phenomenal run! You reached square 25 and triumphed over the autonomous AI opponent."
              : isEliminated
              ? "All hearts depleted on risk squares. In FinTech, risk management is paramount!"
              : "A fierce contest. The computer seized square 25 first. Excellent performance!"}
          </p>

          {/* Score Box */}
          <div className="inline-block px-8 py-5 rounded-2xl bg-white/[0.04] border-2 border-[#fec01f]/40 mb-8 shadow-inner">
            <p className="font-mono text-xs uppercase tracking-widest text-[#fec01f] mb-1 font-bold">
              Official Arena Score
            </p>
            <p className="font-mono text-5xl sm:text-6xl font-black text-white">
              {run.player_score.toLocaleString()}
            </p>
            {rank && leaderboardOptIn && (
              <p className="font-mono text-xs text-[#fec01f] mt-2 flex items-center justify-center gap-1">
                <Trophy size={13} />
                <span>Rank #{rank} on Live Festival Leaderboard</span>
              </p>
            )}
            {puzzleBonus > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#00f0ff] font-mono text-[11px] font-semibold">
                <Puzzle size={12} className="text-[#00f0ff] shrink-0" />
                <span>Includes +{puzzleBonus} Arena Logic Challenge Bonus</span>
              </div>
            )}
          </div>

          {/* Match Stats Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-center gap-1 mb-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <Heart
                    key={i}
                    size={14}
                    className={
                      i < run.player_hearts
                        ? "text-rose-500 fill-rose-500"
                        : "text-white/20 fill-white/10"
                    }
                  />
                ))}
              </div>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                {run.player_hearts} Hearts Left
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <Star size={16} className="fill-[#fec01f] text-[#fec01f] mx-auto mb-1" />
              <p className="font-mono text-xs font-bold text-white">{run.player_quiz_correct}</p>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                Quiz Correct
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <Gem size={16} className="text-orange-400 mx-auto mb-1" />
              <p className="font-mono text-xs font-bold text-white">
                {(run.player_treasures_collected || []).length}
              </p>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                Treasures
              </p>
            </div>
          </div>

          {durationMinutes !== null && (
            <p className="font-mono text-xs text-white/40 mt-5 flex items-center justify-center gap-1.5">
              <Clock size={12} />
              <span>Duration: {durationMinutes}m {run.duration_seconds! % 60}s</span>
            </p>
          )}
        </div>

        {/* 1-Run Notice */}
        <div className="festival-card p-4 flex items-start gap-3 border-amber-500/40 bg-amber-950/20">
          <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <p className="font-bold text-amber-300 uppercase tracking-wider">
              Official Attempt Record Locked
            </p>
            <p className="text-white/70 mt-0.5 leading-relaxed">
              This was your official festival competition run. Your score is permanently archived for the Sri Lanka FinTech Festival 2026.
            </p>
          </div>
        </div>

        {/* Tournament Deadline & Grand Prize Countdown */}
        <TournamentCountdown compact />

        {/* Leaderboard Opt-in Card */}
        <div className="festival-card p-6 bg-[#0a0a28]/85 border-white/10">
          <h3 className="font-heading font-bold text-base text-white mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-[#fec01f]" />
            Public Leaderboard Status
          </h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={leaderboardOptIn}
              onChange={(e) => handleOptInChange(e.target.checked)}
              disabled={updatingOptIn}
              className="mt-0.5 w-4 h-4 rounded text-[#fec01f] accent-[#fec01f] focus:ring-[#fec01f]"
            />
            <div>
              <p className="text-sm font-medium text-white">
                Display my player handle and score on the festival leaderboard
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Your email is never shown. You can toggle this on or off at any time.
              </p>
            </div>
          </label>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <Link
              href="/leaderboard"
              className="text-xs font-mono text-[#fec01f] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View Live Rankings</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Result Card Image Generator */}
        <div className="festival-card p-6 bg-[#0a0a28]/85 border-white/10">
          <h3 className="font-heading font-bold text-base text-white mb-2 flex items-center gap-2">
            <ImageIcon size={18} className="text-[#fec01f]" />
            Download Branded Share Card
          </h3>
          <p className="text-sm text-white/70 mb-5">
            Download high-resolution commemorative cards formatted for Instagram, LinkedIn, and WhatsApp stories with your custom QR challenge code.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleDownloadCard("post")}
              disabled={downloadingPost || downloadingStory}
              className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-3.5 px-4 disabled:opacity-50"
            >
              <Download size={15} />
              <span>{downloadingPost ? "Generating Post Card…" : "Post Card (1080×1350)"}</span>
            </button>
            <button
              onClick={() => handleDownloadCard("story")}
              disabled={downloadingPost || downloadingStory}
              className="interactive-btn interactive-btn--burgundy text-xs uppercase tracking-wider py-3.5 px-4 disabled:opacity-50"
            >
              <Download size={15} />
              <span>{downloadingStory ? "Generating Story Card…" : "Story Card (1080×1920)"}</span>
            </button>
          </div>
        </div>

        {/* Challenge Friends & 1-Click Social Sharing */}
        <div className="festival-card p-6 bg-[#0a0a28]/85 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Share2 size={18} className="text-[#fec01f]" />
              Challenge Attendees &amp; Colleagues
            </h3>
            <span className="text-[10px] font-mono text-[#fec01f] bg-[#fec01f]/10 border border-[#fec01f]/30 px-2 py-0.5 rounded-full">
              #SLFinTechFest2026
            </span>
          </div>
          <p className="text-sm text-white/70 mb-5 leading-relaxed">
            Invite your colleagues from banking, fintech, and tech sectors to beat your score in the official FinTechverse arena.
          </p>

          {/* Instant 1-Click Viral Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
            <button
              onClick={handleShareWhatsApp}
              disabled={generatingLink}
              className="py-3 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MessageSquare size={15} />
              <span>Share to WhatsApp</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              disabled={generatingLink}
              className="py-3 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/50 text-sky-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.95H5.06v8.55z" />
              </svg>
              <span>Post to LinkedIn</span>
            </button>
            <button
              onClick={handleShareTwitter}
              disabled={generatingLink}
              className="py-3 px-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-500/50 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </button>
          </div>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={generatingLink}
              className="w-full py-3 rounded-xl interactive-btn interactive-btn--primary font-bold text-sm shadow-[0_0_20px_rgba(254,192,31,0.3)] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              <LinkIcon size={15} />
              <span>{generatingLink ? "Generating Link…" : "Create Custom Challenge Link"}</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white/90 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl interactive-btn interactive-btn--primary text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {"share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-2.5 rounded-xl border border-white/20 bg-white/5 text-xs font-mono uppercase tracking-wider text-white hover:border-[#fec01f] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Share Via Device Menu…</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Back navigation */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            href="/game?mode=practice"
            className="flex-1 py-3 rounded-xl interactive-btn bg-teal-950/80 hover:bg-teal-900 border border-teal-400/50 text-teal-200 font-mono text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Play Again (Practice)</span>
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl border border-white/15 bg-white/5 text-white/80 font-mono text-xs uppercase tracking-wider text-center hover:text-white hover:border-[#fec01f] transition-colors"
          >
            Festival Home
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 py-3 rounded-xl interactive-btn interactive-btn--primary font-mono text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
          >
            <Trophy size={14} />
            <span>Full Leaderboard</span>
          </Link>
        </div>
      </main>

      <FestivalFooter />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#06061f]">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-[#fec01f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-sm text-white/70">Loading Match Result…</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
