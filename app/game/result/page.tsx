"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  X,
  Send,
  Smartphone,
} from "lucide-react";
import VictoryConfetti from "@/components/game/VictoryConfetti";
import TournamentCountdown from "@/components/tournament/TournamentCountdown";
import { generateResultCardBlob } from "@/lib/utils/card-generator";
import ShareCardCustomizerModal from "@/components/game/ShareCardCustomizerModal";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FestivalLoadingScreen from "@/components/ui/FestivalLoadingScreen";
import { getArenaPuzzleBonus } from "@/lib/puzzles/puzzle-storage";
import { getGoogleAvatarUrl } from "@/lib/auth/google-avatar";

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
  avatar_url?: string | null;
}

export default function ResultPage() {
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
  const [retrying, setRetrying] = useState(false);

  const handleRetryMatch = async (keepLeaderboard: boolean = false) => {
    setRetrying(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("practice_run");
      }
      await fetch("/api/game/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepLeaderboard }),
      });
      router.push("/game");
    } catch {
      router.push("/game");
    } finally {
      setRetrying(false);
    }
  };

  // Social Sharing Enhancements
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [copiedCardImage, setCopiedCardImage] = useState(false);
  const [copyingCardImage, setCopyingCardImage] = useState(false);
  const [copiedLinkedInText, setCopiedLinkedInText] = useState(false);
  const [sharingChannel, setSharingChannel] = useState<string | null>(null);
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [customizerFormat, setCustomizerFormat] = useState<"post" | "story">("post");

  const openCardCustomizer = async (format: "post" | "story" = "post") => {
    await getOrGenerateShareUrl();
    setCustomizerFormat(format);
    setCustomizerModalOpen(true);
  };

  useEffect(() => {
    setPuzzleBonus(getArenaPuzzleBonus());
    const load = async () => {
      const modeParam = new URLSearchParams(window.location.search).get("mode");
      if (modeParam === "practice" || sessionStorage.getItem("practice_run")) {
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
  }, [router, supabase.auth]);

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

  const getLinkedInCaptionText = (targetUrl: string) => {
    const scoreText = run?.player_score ? run.player_score.toLocaleString() : "0";
    const rankText = rank && leaderboardOptIn ? ` · Ranked #${rank} on Official Leaderboard` : "";
    return `🚀 Proud to have tested my financial technology knowledge in the official LANKA FINTECHVERSE Arena at the Sri Lanka FinTech Festival 2026!

🏆 Official Score: ${scoreText} pts${rankText}
🎯 FinTech Quizzes Solved: ${run?.player_quiz_correct || 0}
❤️ Hearts Preserved: ${run?.player_hearts || 0}/3

Can you beat my score? Step into the arena here:
${targetUrl}

Tagging @Sri Lanka FinTech Festival (https://www.linkedin.com/company/143968679/)

#FinTech #SriLankaFinTechFestival #SLFinTechFest2026 #DigitalBanking #Innovation #LankaPay #DPI`;
  };

  const handleShareWhatsApp = async () => {
    setSharingChannel("whatsapp");
    try {
      const target = await getOrGenerateShareUrl();
      const scoreText = run?.player_score ? run.player_score.toLocaleString() : "0";
      const rankText = rank && leaderboardOptIn ? ` (Rank #${rank})` : "";
      const text = `I scored ${scoreText} points${rankText} in LANKA FINTECHVERSE at the Sri Lanka FinTech Festival 2026! Can you beat my score?\n\nStep into the arena here: ${target}\n\n#SLFinTechFest2026 #FinTechSriLanka`;

      // Mobile Web Share API Level 2 (Direct PNG Image + Caption)
      if (typeof navigator !== "undefined" && "canShare" in navigator) {
        try {
          const blob = await generateResultCardBlob({
            format: "post",
            displayName: profile?.display_name || "Festival Player",
            avatarUrl: profile?.avatar_url || getGoogleAvatarUrl(user),
            finalScore: run?.player_score || 0,
            rank: leaderboardOptIn ? rank : null,
            outcome: run?.status as any,
            heartsRemaining: run?.player_hearts || 0,
            quizCorrect: run?.player_quiz_correct || 0,
            treasuresCollected: (run?.player_treasures_collected || []).length,
            challengeUrl: target,
            festivalDates: "2–3 November 2026",
          });
          const file = new File([blob], `fintechverse-${run?.player_score}pts.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "LANKA FINTECHVERSE Scorecard",
              text,
            });
            return;
          }
        } catch (shareErr) {
          if ((shareErr as Error).name === "AbortError") return;
        }
      }

      // Desktop / Web URL fallback (WhatsApp crawls open-graph og:image preview)
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    } finally {
      setSharingChannel(null);
    }
  };

  const handleShareInstagramStory = async () => {
    setSharingChannel("instagram");
    try {
      const target = await getOrGenerateShareUrl();
      await navigator.clipboard.writeText(target);
      setCopied(true);

      const blob = await generateResultCardBlob({
        format: "story",
        displayName: profile?.display_name || "Festival Player",
        avatarUrl: profile?.avatar_url || getGoogleAvatarUrl(user),
        finalScore: run?.player_score || 0,
        rank: leaderboardOptIn ? rank : null,
        outcome: run?.status as any,
        heartsRemaining: run?.player_hearts || 0,
        quizCorrect: run?.player_quiz_correct || 0,
        treasuresCollected: (run?.player_treasures_collected || []).length,
        challengeUrl: target,
        festivalDates: "2–3 November 2026",
      });

      const file = new File([blob], `fintechverse-story-${run?.player_score}pts.png`, { type: "image/png" });

      if (typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Lanka FinTechverse Story Card",
          });
          setInstagramModalOpen(true);
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }

      // Fallback: Download 9:16 card and open instruction modal
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fintechverse-story-${run?.player_score}pts.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setInstagramModalOpen(true);
    } catch (err) {
      console.error("Instagram story sharing failed:", err);
    } finally {
      setSharingChannel(null);
    }
  };

  const handleShareLinkedInModal = async () => {
    await getOrGenerateShareUrl();
    setLinkedInModalOpen(true);
  };

  const handleShareFacebook = async () => {
    const target = await getOrGenerateShareUrl();
    const text = `I scored ${run?.player_score?.toLocaleString()} points in LANKA FINTECHVERSE at the Sri Lanka FinTech Festival 2026! Can you beat my score?`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target)}&quote=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleShareTwitter = async () => {
    const target = await getOrGenerateShareUrl();
    const scoreText = run?.player_score ? run.player_score.toLocaleString() : "0";
    const text = `I just scored ${scoreText} pts in LANKA FINTECHVERSE! Race against autonomous AI at the Sri Lanka FinTech Festival 2026. Can you beat me?`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(target)}&hashtags=SLFinTechFest2026,FinTechSriLanka,LankaPay`,
      "_blank"
    );
  };

  const handleShareTelegram = async () => {
    const target = await getOrGenerateShareUrl();
    const scoreText = run?.player_score ? run.player_score.toLocaleString() : "0";
    const text = `I scored ${scoreText} points in LANKA FINTECHVERSE at the Sri Lanka FinTech Festival 2026! Can you beat my score?\n${target}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(target)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyCardImage = async () => {
    if (!run) return;
    setCopyingCardImage(true);
    try {
      let targetUrl = shareUrl;
      if (!targetUrl) {
        targetUrl = await getOrGenerateShareUrl();
      }

      const blob = await generateResultCardBlob({
        format: "post",
        displayName: profile?.display_name || "Festival Player",
        avatarUrl: profile?.avatar_url || getGoogleAvatarUrl(user),
        finalScore: run.player_score,
        rank: leaderboardOptIn ? rank : null,
        outcome: run.status as any,
        heartsRemaining: run.player_hearts,
        quizCorrect: run.player_quiz_correct,
        treasuresCollected: (run.player_treasures_collected || []).length,
        challengeUrl: targetUrl || window.location.origin,
        festivalDates: "2–3 November 2026",
      });

      if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopiedCardImage(true);
        setTimeout(() => setCopiedCardImage(false), 3000);
      } else {
        await handleDownloadCard("post");
      }
    } catch {
      await handleDownloadCard("post");
    } finally {
      setCopyingCardImage(false);
    }
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
        avatarUrl: profile?.avatar_url || getGoogleAvatarUrl(user),
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
      <FestivalLoadingScreen
        label="Computing Arena Results…"
        sublabel="Retrieving Verified Match Data"
      />
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

        {/* ── Run Decision: Retry or Post to Leaderboard ── */}
        {!isWin ? (
          <div className="festival-card p-6 border-2 border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-[#0a0a28] to-rose-950/40 text-center space-y-4 shadow-[0_0_40px_rgba(244,63,94,0.15)]">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <RotateCcw size={22} className={retrying ? "animate-spin" : ""} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                Match Lost — Retry Until You Win!
              </h3>
              <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto mt-1 leading-relaxed">
                In Lanka FinTechverse, losing runs are never locked or posted to the official leaderboard. You can retry freely until you beat Ava and achieve victory!
              </p>
            </div>
            <div>
              <button
                onClick={() => handleRetryMatch(false)}
                disabled={retrying}
                className="interactive-btn interactive-btn--primary py-3.5 px-8 font-heading font-black text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_30px_rgba(254,192,31,0.55)] cursor-pointer"
              >
                <RotateCcw size={16} className={retrying ? "animate-spin" : ""} />
                <span>{retrying ? "Resetting Arena…" : "Retry Match Now"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="festival-card p-6 border-2 border-[#fec01f]/60 bg-gradient-to-br from-[#12163a] via-[#0a0a28] to-[#06061f] space-y-4 shadow-[0_0_40px_rgba(254,192,31,0.2)]">
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#fec01f] font-bold bg-[#fec01f]/15 px-2.5 py-1 rounded-full border border-[#fec01f]/30">
                  VICTORY RUN CHOICES
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white mt-2">
                  Choose To Post or Play Again
                </h3>
                <p className="text-xs text-white/70 mt-1 max-w-xl leading-relaxed">
                  Decide whether this is the run you want to post on the official tournament leaderboard. If you want to aim higher, you can discard and play again without locking this score!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Option 1: Post to Leaderboard */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  leaderboardOptIn
                    ? "border-teal-400/60 bg-teal-950/30"
                    : "border-white/15 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-[#fec01f]" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">
                    {leaderboardOptIn ? "Run Posted to Leaderboard" : "Option A: Post Score"}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                  {leaderboardOptIn
                    ? rank
                      ? `Your score of ${run.player_score.toLocaleString()} pts is live at Rank #${rank}!`
                      : `Your score of ${run.player_score.toLocaleString()} pts is published on the live leaderboard.`
                    : "Officially submit this victory and appear in the festival rankings."}
                </p>

                <button
                  onClick={() => handleOptInChange(!leaderboardOptIn)}
                  disabled={updatingOptIn}
                  className={`w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    leaderboardOptIn
                      ? "bg-teal-500/20 text-teal-300 border border-teal-400/50 hover:bg-teal-500/30"
                      : "interactive-btn interactive-btn--primary shadow-md"
                  }`}
                >
                  <Trophy size={14} />
                  <span>
                    {updatingOptIn
                      ? "Updating…"
                      : leaderboardOptIn
                      ? "Score Posted (Click to Unpost)"
                      : "Post Score to Leaderboard"}
                  </span>
                </button>
              </div>

              {/* Option 2: Play Again for Leaderboard */}
              <div className="p-4 rounded-2xl border border-white/15 bg-white/[0.03] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw size={16} className="text-teal-400" />
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">
                      Option B: Play Again
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                    Not satisfied with your score? Discard this run and play again to aim for a higher tournament rank!
                  </p>
                </div>

                <button
                  onClick={() => handleRetryMatch(leaderboardOptIn)}
                  disabled={retrying}
                  className="w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} className={retrying ? "animate-spin" : ""} />
                  <span>{retrying ? "Resetting Arena…" : "Play Again for Leaderboard"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Official Tournament Rules: LinkedIn Verification ── */}
        <div className="festival-card p-6 border-2 border-sky-400/50 bg-gradient-to-br from-[#07152b] via-[#0a0a28] to-[#04101e] shadow-[0_0_40px_rgba(56,189,248,0.2)]">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.95H5.06v8.55z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Official Tournament Prize Rule
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/40 uppercase tracking-wider">
                  Mandatory Verification
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                To be eligible for festival tournament prizes, merchandise, and official leader recognition, you must share your scorecard on LinkedIn and tag the official Sri Lanka FinTech Festival page.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 text-xs font-mono text-white/80">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#fec01f]">Step 1:</span>
              <span>Download your verified 1080×1350 scorecard card below.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#fec01f]">Step 2:</span>
              <span>
                Tag the official LinkedIn company page:
                <a
                  href="https://www.linkedin.com/company/143968679/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-[#fec01f] underline hover:text-white inline-flex items-center gap-0.5 font-bold"
                >
                  <span>@Sri Lanka FinTech Festival (143968679)</span>
                  <ExternalLink size={12} />
                </a>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#fec01f]">Step 3:</span>
              <span>Include your score, challenge link, and hashtags (#SLFinTechFest2026 #FinTechSriLanka).</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShareLinkedInModal}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,119,181,0.4)] cursor-pointer"
            >
              <Download size={14} />
              <span>Download Card & Post on LinkedIn</span>
            </button>
            <a
              href="https://www.linkedin.com/company/143968679/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <span>Visit Official LinkedIn Page</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Tournament Deadline & Grand Prize Countdown */}
        <TournamentCountdown compact />

        {/* Result Card Image Generator */}
        <div className="festival-card p-5 sm:p-6 bg-[#0a0a28]/85 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <ImageIcon size={18} className="text-[#fec01f]" />
              Download &amp; Copy Branded Share Cards
            </h3>
            <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-full">
              High-Res PNG
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 mb-4 leading-relaxed">
            Generate commemorative arena cards formatted for social media with your custom QR code challenge.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => openCardCustomizer("post")}
              className="interactive-btn interactive-btn--primary text-xs uppercase tracking-wider py-3 px-3 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download size={14} />
              <span>Preview &amp; Get Feed Card (4:5)</span>
            </button>
            <button
              onClick={() => openCardCustomizer("story")}
              className="interactive-btn interactive-btn--burgundy text-xs uppercase tracking-wider py-3 px-3 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Smartphone size={14} />
              <span>Preview &amp; Get Story (9:16)</span>
            </button>
            <button
              onClick={() => openCardCustomizer("post")}
              className="py-3 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#fec01f] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Customize your name and photo before copying or downloading"
            >
              <Copy size={14} />
              <span>Customize &amp; Copy (Ctrl+V)</span>
            </button>
          </div>
        </div>

        {/* Challenge Friends & 1-Click Multi-Channel Social Sharing */}
        <div className="festival-card p-5 sm:p-6 bg-[#0a0a28]/85 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Share2 size={18} className="text-[#fec01f]" />
              Share &amp; Challenge Your Network
            </h3>
            <span className="text-[10px] font-mono text-[#fec01f] bg-[#fec01f]/10 border border-[#fec01f]/30 px-2 py-0.5 rounded-full">
              #SLFinTechFest2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 mb-4 leading-relaxed">
            Invite your colleagues from banking, fintech, and tech sectors to beat your score in the official FinTechverse arena.
          </p>

          {/* Social Channels 6-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-4">
            {/* WhatsApp: Direct image file & caption on mobile, web link preview on desktop */}
            <button
              onClick={handleShareWhatsApp}
              disabled={generatingLink || sharingChannel === "whatsapp"}
              className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <MessageSquare size={15} className="shrink-0" />
              <span className="truncate">{sharingChannel === "whatsapp" ? "Opening…" : "WhatsApp"}</span>
            </button>

            {/* Instagram: 9:16 Story sharing with auto-copied link sticker */}
            <button
              onClick={handleShareInstagramStory}
              disabled={generatingLink || sharingChannel === "instagram"}
              className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-amber-900/30 hover:opacity-90 border border-pink-500/50 text-pink-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="truncate">{sharingChannel === "instagram" ? "Opening…" : "IG Story"}</span>
            </button>

            {/* LinkedIn: Pro Post dialog with caption & card */}
            <button
              onClick={handleShareLinkedInModal}
              disabled={generatingLink}
              className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/50 text-sky-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.95H5.06v8.55z" />
              </svg>
              <span className="truncate">LinkedIn</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              disabled={generatingLink}
              className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-blue-700/20 hover:bg-blue-700/30 border border-blue-500/50 text-blue-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="truncate">Facebook</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleShareTwitter}
              disabled={generatingLink}
              className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-500/50 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="truncate">Post on X</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleShareTelegram}
              disabled={generatingLink}
              className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl bg-cyan-700/20 hover:bg-cyan-700/30 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <Send size={14} className="shrink-0" />
              <span className="truncate">Telegram</span>
            </button>
          </div>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={generatingLink}
              className="w-full min-h-[46px] py-3 rounded-xl interactive-btn interactive-btn--primary font-bold text-sm shadow-[0_0_20px_rgba(254,192,31,0.3)] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 touch-manipulation"
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
                  className="px-4 py-2.5 rounded-xl interactive-btn interactive-btn--primary text-xs font-bold uppercase tracking-wider cursor-pointer touch-manipulation min-h-[44px]"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {"share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full min-h-[44px] py-2.5 rounded-xl border border-white/20 bg-white/5 text-xs font-mono uppercase tracking-wider text-white hover:border-[#fec01f] transition-colors flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  <Share2 size={14} />
                  <span>Share Via Device Menu…</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Modal: LinkedIn Pro Post Assistant ── */}
        {linkedInModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#06061f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="festival-panel max-w-lg w-full max-h-[88dvh] overflow-y-auto p-5 sm:p-7 bg-[#0a0a28]/95 border-2 border-sky-500/50 shadow-[0_0_60px_rgba(0,0,0,0.8)] pb-safe relative">
              <button
                onClick={() => setLinkedInModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.95H5.06v8.55z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">Post to LinkedIn</h3>
                  <p className="text-xs text-white/60 font-mono">Algorithm-optimized card + post text</p>
                </div>
              </div>

              <p className="text-xs text-white/70 mb-3">
                LinkedIn gives 3x–5x more reach to native image posts. We formatted a professional caption and 1080×1350 card for you:
              </p>

              {/* Pre-formatted caption box */}
              <div className="relative mb-4 p-3 rounded-xl bg-black/40 border border-white/15 text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {getLinkedInCaptionText(shareUrl || "https://verse.fintechfestival.lk")}
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={async () => {
                    const text = getLinkedInCaptionText(shareUrl || "https://verse.fintechfestival.lk");
                    await navigator.clipboard.writeText(text);
                    setCopiedLinkedInText(true);
                    await handleDownloadCard("post");
                    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
                    setTimeout(() => setCopiedLinkedInText(false), 3000);
                  }}
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl interactive-btn interactive-btn--primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Download size={15} />
                  <span>
                    {copiedLinkedInText
                      ? "Caption Copied & Card Downloaded! Opening LinkedIn…"
                      : "Copy Caption, Download Card & Open LinkedIn"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        shareUrl || "https://verse.fintechfestival.lk"
                      )}`,
                      "_blank"
                    );
                  }}
                  className="w-full min-h-[42px] py-2 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  <span>Or Share as Quick Link Preview Dialog</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Instagram Story Guidance ── */}
        {instagramModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#06061f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="festival-panel max-w-sm w-full p-5 sm:p-7 bg-[#0a0a28]/95 border-2 border-pink-500/50 shadow-[0_0_60px_rgba(0,0,0,0.8)] pb-safe relative text-center">
              <button
                onClick={() => setInstagramModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-pink-600/30 to-purple-600/30 border border-pink-400/50 flex items-center justify-center mx-auto mb-3 text-pink-300">
                <Smartphone size={28} />
              </div>

              <h3 className="font-heading font-bold text-lg text-white mb-1">Story Card Ready!</h3>
              <p className="text-xs text-teal-300 font-mono font-bold mb-4">
                Challenge Link Copied to Clipboard
              </p>

              <div className="text-left space-y-2 text-xs font-mono text-white/80 mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#fec01f] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Open Instagram Stories and choose your downloaded 9:16 card.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#fec01f] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Tap the Sticker icon and select <strong>Link</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#fec01f] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Paste your copied challenge URL and publish your story!</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setInstagramModalOpen(false);
                  window.open("https://instagram.com", "_blank");
                }}
                className="w-full min-h-[46px] py-3 rounded-xl interactive-btn interactive-btn--primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                <span>Open Instagram</span>
              </button>
            </div>
          </div>
        )}

        {/* Share Card Customizer & Live Preview Modal */}
        {run && (
          <ShareCardCustomizerModal
            isOpen={customizerModalOpen}
            onClose={() => setCustomizerModalOpen(false)}
            initialFormat={customizerFormat}
            finalScore={run.player_score}
            rank={leaderboardOptIn ? rank : null}
            outcome={run.status as any}
            heartsRemaining={run.player_hearts}
            quizCorrect={run.player_quiz_correct}
            treasuresCollected={(run.player_treasures_collected || []).length}
            challengeUrl={shareUrl || (typeof window !== "undefined" ? window.location.origin : "")}
            festivalDates="2–3 November 2026"
            defaultDisplayName={profile?.display_name || "Festival Player"}
            defaultAvatarUrl={profile?.avatar_url || null}
            googleAvatarUrl={getGoogleAvatarUrl(user) || (profile?.avatar_url?.includes("googleusercontent.com") ? profile.avatar_url : null)}
            onProfileUpdated={(name, avUrl) => {
              setProfile((prev) => (prev ? { ...prev, display_name: name, avatar_url: avUrl } : null));
            }}
          />
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {!isWin ? (
            <button
              onClick={() => handleRetryMatch(false)}
              disabled={retrying}
              className="flex-1 py-3.5 rounded-xl interactive-btn interactive-btn--primary font-heading font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RotateCcw size={15} className={retrying ? "animate-spin" : ""} />
              <span>{retrying ? "Resetting Arena…" : "Retry Match Now"}</span>
            </button>
          ) : (
            <button
              onClick={() => handleRetryMatch(leaderboardOptIn)}
              disabled={retrying}
              className="flex-1 py-3.5 rounded-xl interactive-btn bg-teal-950/80 hover:bg-teal-900 border border-teal-400/50 text-teal-200 font-mono text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} className={retrying ? "animate-spin" : ""} />
              <span>{retrying ? "Resetting Arena…" : "Play Again for Leaderboard"}</span>
            </button>
          )}

          <Link
            href="/leaderboard"
            className="flex-1 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-colors"
          >
            <Trophy size={14} className="text-[#fec01f]" />
            <span>Festival Standings</span>
          </Link>

          <Link
            href="/"
            className="flex-1 py-3.5 rounded-xl border border-white/15 bg-white/5 text-white/80 font-mono text-xs uppercase tracking-wider text-center hover:text-white hover:border-[#fec01f] transition-colors"
          >
            Festival Home
          </Link>
        </div>
      </main>

      <FestivalFooter />
    </div>
  );
}
