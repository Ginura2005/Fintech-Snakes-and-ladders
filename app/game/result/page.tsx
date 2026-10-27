"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Trophy, Share2, Download, Copy, Check, Heart, Star, Shield, Image as ImageIcon } from "lucide-react";
import { generateResultCardBlob } from "@/lib/utils/card-generator";

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

interface LeaderboardRank {
  rank: number | null;
}

export default function ResultPage() {
  const router = useRouter();
  const supabase = createClient();
  const cardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const res = await fetch("/api/game/state");
      if (res.ok) {
        const data = await res.json();
        if (!data.run) { router.push("/"); return; }
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
  }, []);

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/share/link", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.url);
      }
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleDownloadCard = async (format: "post" | "story") => {
    if (!run) return;
    if (format === "post") setDownloadingPost(true);
    else setDownloadingStory(true);

    try {
      // Ensure share link is available
      let targetUrl = shareUrl;
      if (!targetUrl) {
        const linkRes = await fetch("/api/share/link", { method: "POST" });
        if (linkRes.ok) {
          const linkData = await linkRes.json();
          targetUrl = linkData.url;
          setShareUrl(targetUrl);
        } else {
          targetUrl = window.location.origin;
        }
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
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    const text = `I scored ${run?.player_score?.toLocaleString()} points in LANKA FINTECHVERSE! Can you beat me? 🎲\n\nSri Lanka FinTech Festival 2026 — 2–3 November`;
    try {
      await navigator.share({ title: "LANKA FINTECHVERSE", text, url: shareUrl });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isWin = run.status === "player_won";
  const isEliminated = run.status === "player_eliminated";
  const durationMinutes = run.duration_seconds ? Math.floor(run.duration_seconds / 60) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Result Card */}
        <div
          ref={cardRef}
          className="glass-card p-8 text-center"
          style={{ background: isWin ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : isEliminated ? "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)" : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
        >
          {/* Festival branding */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Sri Lanka FinTech Festival 2026</span>
          </div>

          {/* Outcome */}
          <div className="text-6xl mb-3">
            {isWin ? "🏆" : isEliminated ? "💔" : "🤖"}
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            {isWin ? "You Won!" : isEliminated ? "Eliminated!" : "Computer Won"}
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            {isWin
              ? "Congratulations! You reached square 25 and defeated the computer."
              : isEliminated
              ? "You lost all your hearts. Better luck next time!"
              : "The computer reached square 25 first. Great effort!"}
          </p>

          {/* Score */}
          <div className="inline-block px-8 py-4 rounded-2xl bg-white border-2 border-teal-200 mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Final Score</p>
            <p className="text-5xl font-black text-teal-700">{run.player_score.toLocaleString()}</p>
            {rank && (
              <p className="text-sm text-gray-600 mt-1">
                🏅 Rank #{rank} on the leaderboard
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/60">
              <div className="flex items-center justify-center gap-1 mb-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <Heart key={i} size={14} className={i < run.player_hearts ? "text-red-500 fill-red-500" : "text-gray-200 fill-gray-200"} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{run.player_hearts} hearts left</p>
            </div>
            <div className="p-3 rounded-xl bg-white/60">
              <Star size={18} className="fill-yellow-500 text-yellow-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{run.player_quiz_correct} quiz correct</p>
            </div>
            <div className="p-3 rounded-xl bg-white/60">
              <p className="text-lg font-bold text-gray-700">💰{(run.player_treasures_collected || []).length}</p>
              <p className="text-xs text-gray-500">treasures</p>
            </div>
          </div>

          {durationMinutes !== null && (
            <p className="text-xs text-gray-400 mt-4">
              ⏱ Game completed in {durationMinutes}m {run.duration_seconds! % 60}s
            </p>
          )}

          <p className="text-xs font-semibold text-gray-500 mt-4 tracking-wider uppercase">
            2–3 November 2026 · See you at the Festival!
          </p>
        </div>

        {/* One-run notice */}
        <div className="glass-card p-4 flex items-start gap-3 bg-amber-50 border border-amber-200">
          <span className="text-amber-500 text-xl flex-shrink-0">ℹ️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Official attempt used</p>
            <p className="text-amber-700 text-xs mt-0.5">
              This was your official game attempt. You cannot start a new official run.
              Your score and stats are permanently recorded.
            </p>
          </div>
        </div>

        {/* Leaderboard opt-in */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-teal-600" />
            Public Leaderboard
          </h3>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={leaderboardOptIn}
              onChange={(e) => handleOptInChange(e.target.checked)}
              disabled={updatingOptIn}
              className="mt-0.5 w-4 h-4 rounded accent-teal-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Show my name and score on the public leaderboard
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Only your display name and score are shown. Your email is never revealed. You can change this anytime.
              </p>
            </div>
          </label>
          {rank && leaderboardOptIn && (
            <div className="mt-3 p-3 bg-teal-50 rounded-xl text-sm text-teal-700 font-semibold text-center">
              🏅 You're ranked #{rank} on the leaderboard!
            </div>
          )}
          <Link
            href="/leaderboard"
            className="mt-3 flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            View full leaderboard →
          </Link>
        </div>

        {/* Result Card Downloads */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <ImageIcon size={18} className="text-teal-600" />
            Download Festival Result Cards
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Download high-resolution, branded PNG cards with a custom QR code to share on Instagram, LinkedIn, or WhatsApp.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleDownloadCard("post")}
              disabled={downloadingPost || downloadingStory}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-800 text-white font-semibold text-sm hover:bg-teal-900 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download size={16} />
              {downloadingPost ? "Generating Post Card…" : "Square/Post Card (1080×1350)"}
            </button>
            <button
              onClick={() => handleDownloadCard("story")}
              disabled={downloadingPost || downloadingStory}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
            >
              <Download size={16} />
              {downloadingStory ? "Generating Story Card…" : "Story Card (1080×1920)"}
            </button>
          </div>
        </div>

        {/* Sharing */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Share2 size={18} className="text-teal-600" />
            Challenge Your Friends
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Share your result and challenge friends to beat your score!
          </p>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={generatingLink}
              className="w-full py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {generatingLink ? "Generating…" : "🔗 Generate Challenge Link"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {"share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-2.5 rounded-xl border border-teal-200 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Share via…
                </button>
              )}

              <p className="text-xs text-gray-400 text-center">
                Challenge links don't reveal your email or account details.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
          >
            ← Home
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 py-3 rounded-xl brand-gradient text-white font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          >
            🏆 Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
