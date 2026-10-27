"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Play, Trophy } from "lucide-react";

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
  }, [token]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔗</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Link not found</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <Link href="/" className="px-6 py-3 rounded-xl brand-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isWin = cardData?.playerWon;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-5">
        {/* Challenge result card */}
        <div className="glass-card p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Sri Lanka FinTech Festival 2026</span>
          </div>

          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-3">
            🎯 You've been challenged!
          </p>

          <div className="text-5xl mb-3">{isWin ? "🏆" : "🎲"}</div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {cardData?.displayName}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            scored in LANKA FINTECHVERSE
          </p>

          <div className="inline-block px-6 py-3 rounded-2xl bg-teal-50 border border-teal-200 mb-4">
            <p className="text-4xl font-black text-teal-700">{cardData?.finalScore.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">points</p>
          </div>

          {cardData?.rank && (
            <p className="text-sm text-gray-600 mb-4">🏅 Leaderboard rank: #{cardData.rank}</p>
          )}

          <div className="flex justify-center gap-4 text-sm text-gray-500 mb-4">
            <span>❤️ {cardData?.heartsRemaining} hearts</span>
            <span>📝 {cardData?.quizCorrect} quiz</span>
            <span>💰 {cardData?.treasuresCollected} treasure</span>
          </div>

          <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
            {cardData?.festivalDates} · See you at the Festival!
          </p>
        </div>

        {/* CTA */}
        <div className="glass-card p-6 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Can you beat this score?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Play LANKA FINTECHVERSE — the FinTech Snakes &amp; Ladders game at the Sri Lanka FinTech Festival 2026.
            One official attempt per account.
          </p>

          {user ? (
            <Link
              href="/game"
              className="inline-flex items-center gap-2 w-full justify-center py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-90 transition-opacity"
            >
              <Play size={18} className="fill-white" />
              Play Your Game
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="inline-flex items-center gap-3 w-full justify-center py-3 rounded-xl bg-white border-2 border-teal-700 text-teal-700 font-bold hover:bg-teal-50 transition-colors disabled:opacity-60"
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

          <div className="mt-3">
            <Link href="/leaderboard" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
              View full leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
