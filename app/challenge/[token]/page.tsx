"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Play, Trophy, Sparkles, Heart, Star } from "lucide-react";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";

interface CardData {
  displayName: string;
  finalScore: number;
  status: string;
  playerWon: boolean;
  quizCorrect: number;
  heartsRemaining: number;
  treasuresCollected: number;
  durationSeconds: number | null;
  rank: number | null;
  festivalDates: string;
}

export default function ChallengePage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    fetch(`/api/share/card?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCardData(data);
      })
      .catch(() => setError("Failed to load challenge"))
      .finally(() => setLoading(false));
  }, [token, supabase.auth]);

  const handleSignIn = async () => {
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/game`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06061f] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#fec01f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#06061f] text-white flex items-center justify-center p-4">
        <div className="festival-panel p-8 text-center max-w-sm">
          <p className="text-4xl mb-4">🔗</p>
          <h2 className="font-heading text-xl font-bold text-white mb-2">Challenge Not Found</h2>
          <p className="text-white/60 text-xs font-mono mb-6">{error}</p>
          <Link
            href="/"
            className="interactive-btn interactive-btn--primary text-sm font-bold py-3 px-6"
          >
            Go to Festival Home
          </Link>
        </div>
      </div>
    );
  }

  const isWin = cardData?.playerWon;

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      <FestivalHeader user={user} activePath="/challenge" />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#fec01f]/15 to-transparent blur-3xl opacity-60" />

        <div className="max-w-md w-full space-y-5 relative z-10">
          {/* Challenge result card */}
          <div className="festival-panel p-8 text-center border-2 border-[#fec01f]/40 bg-[#0a0a28]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="relative h-10 w-44 mx-auto mb-4">
              <Image
                src="/long-logo-removebg-preview.png"
                alt="Sri Lanka FinTech Festival"
                fill
                className="object-contain"
                priority
              />
            </div>

            <span className="section-badge section-badge-primary text-[10px] mb-3">
              <Sparkles size={12} className="text-[#fec01f]" />
              FESTIVAL ARENA CHALLENGE
            </span>

            <div className="text-5xl mb-2 animate-float-gentle">{isWin ? "🏆" : "🎲"}</div>

            <h2 className="font-heading text-2xl font-black text-white mb-1">
              {cardData?.displayName}
            </h2>
            <p className="font-mono text-xs text-white/60 mb-5 uppercase tracking-wider">
              Scored in Lanka FinTechverse
            </p>

            <div className="inline-block px-7 py-4 rounded-2xl bg-white/[0.04] border-2 border-[#fec01f]/40 mb-5">
              <p className="font-mono text-4xl sm:text-5xl font-black text-[#fec01f]">
                {cardData?.finalScore.toLocaleString()}
              </p>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest mt-1">
                Official Score
              </p>
            </div>

            {cardData?.rank && (
              <p className="font-mono text-xs text-white/80 mb-4 flex items-center justify-center gap-1.5">
                <Trophy size={13} className="text-[#fec01f]" />
                <span>Leaderboard Rank: #{cardData.rank}</span>
              </p>
            )}

            <div className="flex justify-center gap-4 text-xs font-mono text-white/70 mb-5 border-t border-white/10 pt-4">
              <span className="flex items-center gap-1">
                <Heart size={13} className="text-rose-400 fill-rose-400" />
                {cardData?.heartsRemaining} hearts
              </span>
              <span className="flex items-center gap-1">
                <Star size={13} className="text-[#fec01f] fill-[#fec01f]" />
                {cardData?.quizCorrect} quiz
              </span>
              <span>💰 {cardData?.treasuresCollected} treasure</span>
            </div>

            <p className="font-mono text-[10px] text-white/40 tracking-wider uppercase">
              {cardData?.festivalDates} · Sri Lanka FinTech Festival 2026
            </p>
          </div>

          {/* CTA Box */}
          <div className="festival-card p-6 text-center bg-[#090924]/85 border-white/15">
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              Can You Beat This Score?
            </h3>
            <p className="text-sm text-white/70 mb-5 leading-relaxed">
              Step into the FinTechverse arena at the Sri Lanka FinTech Festival 2026. One official attempt per attendee!
            </p>

            {user ? (
              <Link
                href="/game"
                className="interactive-btn interactive-btn--primary w-full py-3.5 text-sm font-bold shadow-[0_0_20px_rgba(254,192,31,0.3)]"
              >
                <Play size={16} className="fill-current" />
                <span>Play Your Game</span>
              </Link>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="interactive-btn interactive-btn--primary w-full py-3.5 text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(254,192,31,0.3)] disabled:opacity-60"
              >
                <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{signingIn ? "Connecting…" : "Sign In with Google to Play"}</span>
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-white/5">
              <Link
                href="/leaderboard"
                className="font-mono text-xs text-[#fec01f] hover:underline uppercase tracking-wider"
              >
                View Live Festival Leaderboard →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FestivalFooter />
    </div>
  );
}
