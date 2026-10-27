"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import GameBoard from "@/components/game/Board";
import QuizOverlay from "@/components/game/QuizOverlay";
import TreasureOverlay from "@/components/game/TreasureOverlay";
import DicePanel from "@/components/game/DicePanel";
import PlayerPanel from "@/components/game/PlayerPanel";
import EventLog from "@/components/game/EventLog";
import OnboardingModal from "@/components/game/OnboardingModal";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import { BOARD_CONFIG } from "@/lib/game-engine/board-config";

interface GameRun {
  id: string;
  status: string;
  current_turn: string;
  turn_sequence: number;
  player_position: number;
  computer_position: number;
  player_hearts: number;
  computer_hearts: number;
  player_shields: number;
  computer_shields: number;
  player_score: number;
  computer_score: number;
  player_quiz_correct: number;
  player_treasures_collected: number[];
  player_quiz_encountered: number[];
  started_at: string;
  completed_at: string | null;
}

interface Profile {
  display_name: string;
  avatar_url: string | null;
  leaderboard_opt_in: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
  squareNumber: number;
}

interface TurnResult {
  run: GameRun;
  playerRoll: number;
  playerEvents: Array<{ type: string; description: string; fromSquare?: number; toSquare?: number }>;
  computerRoll: number | null;
  computerEvents: Array<{ type: string; description: string }> | null;
  quizQuestion: QuizQuestion | null;
  alreadyProcessed?: boolean;
}

export default function GamePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [run, setRun] = useState<GameRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [computerRoll, setComputerRoll] = useState<number | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [showTreasure, setShowTreasure] = useState<{ points: number; square: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const isTerminal = (status: string) =>
    ["player_won", "computer_won", "player_eliminated", "completed"].includes(status);

  // Load user and game state
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/?signin=required");
        return;
      }
      setUser(user);

      // Fetch current game state
      const res = await fetch("/api/game/state");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);

        if (!data.run) {
          // No run yet — show onboarding
          setShowOnboarding(true);
        } else {
          setRun(data.run);
          if (isTerminal(data.run.status)) {
            router.push("/game/result");
            return;
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to connect to the game server. Please check your database setup.");
      }
      setLoading(false);
    };
    load();
  }, [router, supabase.auth]);

  const handleOnboardingComplete = async (displayName: string, leaderboardOptIn: boolean) => {
    setShowOnboarding(false);
    setLoading(true);
    try {
      const res = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, leaderboardOptIn }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({ display_name: displayName, avatar_url: null, leaderboard_opt_in: leaderboardOptIn });
        setRun(data.run);
      } else {
        setError(data.error || "Failed to start game");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleRoll = useCallback(async () => {
    if (!run || rolling || animating || quizQuestion) return;
    if (run.current_turn !== "player") return;
    if (isTerminal(run.status)) return;

    setRolling(true);
    setError(null);
    setLastRoll(null);
    setComputerRoll(null);

    try {
      const res = await fetch("/api/game/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data: TurnResult = await res.json();

      if (!res.ok) {
        setError((data as any).error || "Roll failed");
        setRolling(false);
        return;
      }

      setLastRoll(data.playerRoll);
      setRun(data.run);

      // Build event messages
      const msgs: string[] = [];
      for (const e of data.playerEvents || []) {
        msgs.push(e.description);
      }
      if (data.computerRoll !== null) {
        setComputerRoll(data.computerRoll);
        msgs.push(`🤖 Computer rolled ${data.computerRoll}`);
        for (const e of data.computerEvents || []) {
          msgs.push(e.description);
        }
      }
      setEvents((prev) => [...msgs.reverse(), ...prev].slice(0, 20));

      // Check for quiz
      if (data.quizQuestion) {
        setAnimating(true);
        setTimeout(() => {
          setQuizQuestion(data.quizQuestion);
          setAnimating(false);
        }, 600);
      }

      // Check for treasure
      const treasureEvent = data.playerEvents?.find((e) => e.type === "treasure_collected");
      if (treasureEvent && !data.quizQuestion) {
        setAnimating(true);
        setTimeout(() => {
          setShowTreasure({ points: BOARD_CONFIG.treasure.points, square: data.run.player_position });
          setAnimating(false);
        }, 600);
      }

      // Navigate to result if game over
      if (isTerminal(data.run.status)) {
        setTimeout(() => {
          router.push("/game/result");
        }, 2000);
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setRolling(false);
  }, [run, rolling, animating, quizQuestion, router]);

  const handleQuizAnswer = async (questionId: string, squareNumber: number, selectedOption: number) => {
    setQuizQuestion(null);
    try {
      const res = await fetch("/api/game/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, squareNumber, selectedOption }),
      });
      const data = await res.json();

      if (res.ok) {
        const msg = data.isCorrect
          ? `✅ Correct! +${BOARD_CONFIG.scoring.quizCorrect} points! ${data.explanation}`
          : `❌ Incorrect. ${data.explanation}`;
        setEvents((prev) => [msg, ...prev].slice(0, 20));

        // Refresh run state
        const stateRes = await fetch("/api/game/state");
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setRun(stateData.run);
        }

        // Process computer turn
        setTimeout(async () => {
          const rollRes = await fetch("/api/game/roll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (rollRes.ok) {
            const rollData: TurnResult = await rollRes.json();
            setRun(rollData.run);
            if (rollData.computerRoll !== null) {
              setComputerRoll(rollData.computerRoll);
              const cMsgs: string[] = [`🤖 Computer rolled ${rollData.computerRoll}`];
              for (const e of rollData.computerEvents || []) cMsgs.push(e.description);
              setEvents((prev) => [...cMsgs.reverse(), ...prev].slice(0, 20));
            }
            if (isTerminal(rollData.run.status)) {
              setTimeout(() => router.push("/game/result"), 2000);
            }
          }
        }, 1000);
      }
    } catch {
      setError("Quiz submission failed. Please try again.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06061f]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#fec01f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-white/70">Connecting to Arena Host…</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingModal
        googleName={user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (!run) {
    const isMigrationError =
      error?.toLowerCase().includes("database tables") ||
      error?.toLowerCase().includes("schema cache") ||
      error?.toLowerCase().includes("game_runs");

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06061f] text-white p-4">
        <div className="max-w-md w-full festival-card p-6 border-white/10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">
            {isMigrationError ? "🛠️" : "⚠️"}
          </div>

          <h2 className="text-xl font-bold font-mono text-[#fec01f] mb-2">
            {isMigrationError ? "Database Setup Required" : "Connection Notice"}
          </h2>

          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            {error || "No active game found for this account."}
          </p>

          {isMigrationError && (
            <div className="bg-[#0a0a28] border border-white/10 rounded-xl p-4 text-left text-xs font-mono text-white/70 mb-6 space-y-2">
              <p className="font-bold text-white/90">How to initialize:</p>
              <p>1. Open your Supabase Dashboard SQL Editor.</p>
              <p>2. Paste and run <span className="text-[#fec01f]">001_initial_schema.sql</span>.</p>
              <p>3. Return here and click Retry Connection.</p>
              <a
                href="https://supabase.com/dashboard/project/vqzyogpdecdqithvnarg/sql/new"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-[#fec01f] underline hover:text-white"
              >
                Open Supabase SQL Editor ↗
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl bg-[#fec01f] text-black font-mono text-sm font-bold hover:bg-[#fec01f]/90 transition-colors cursor-pointer"
            >
              🔄 Retry Connection
            </button>
            <a
              href="/"
              className="px-5 py-3 rounded-xl border border-white/10 text-white/80 font-mono text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const gameOver = isTerminal(run.status);

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col selection:bg-[#fec01f] selection:text-black">
      {/* Festival Header */}
      <FestivalHeader
        user={user}
        onSignOut={handleSignOut}
        activePath="/game"
      />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Error notification */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-950/70 border border-red-500/50 text-sm font-mono text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Main Board & Controls */}
          <div className="space-y-5">
            {/* Arena Board */}
            <div className="festival-card p-4 sm:p-6 bg-[#090924]/80">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#fec01f] animate-ping" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-bold">
                    Official Match Arena
                  </span>
                </div>
                <span className="font-mono text-xs text-[#fec01f] bg-[#fec01f]/10 border border-[#fec01f]/30 px-2 py-0.5 rounded">
                  Turn {run.turn_sequence}
                </span>
              </div>

              <GameBoard
                playerPosition={run.player_position}
                computerPosition={run.computer_position}
                playerName={profile?.display_name || "You"}
                animating={animating}
              />
            </div>

            {/* Dice Control Console */}
            {!gameOver && (
              <DicePanel
                isPlayerTurn={run.current_turn === "player"}
                rolling={rolling}
                lastRoll={lastRoll}
                computerRoll={computerRoll}
                onRoll={handleRoll}
                disabled={!!quizQuestion || animating}
                playerPosition={run.player_position}
              />
            )}
          </div>

          {/* Right Stats & Telemetry Feed */}
          <div className="space-y-5">
            {/* Player Stats HUD */}
            <PlayerPanel
              label={profile?.display_name || "You"}
              hearts={run.player_hearts}
              shields={run.player_shields}
              score={run.player_score}
              position={run.player_position}
              quizCorrect={run.player_quiz_correct}
              isCurrentTurn={run.current_turn === "player"}
              tokenColor="teal"
            />

            {/* Computer Opponent HUD */}
            <PlayerPanel
              label="Autonomous FinTech AI"
              hearts={run.computer_hearts}
              shields={run.computer_shields}
              score={run.computer_score}
              position={run.computer_position}
              quizCorrect={0}
              isCurrentTurn={run.current_turn === "computer"}
              tokenColor="burgundy"
            />

            {/* Live Telemetry Log */}
            <EventLog events={events} />

            {/* Strategic Quick Guide */}
            <div className="festival-card p-4 text-xs font-mono text-white/60 space-y-2 border-white/10 bg-[#0a0a28]/80">
              <p className="font-bold text-white/90 uppercase tracking-wider text-[11px] mb-2 border-b border-white/5 pb-1">
                Field Intel
              </p>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-teal-500/20 border border-teal-400 shrink-0" />
                <span><strong>Ladders:</strong> Boost ahead +25 pts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-400 shrink-0" />
                <span><strong>Snakes:</strong> Set back -10/-25 pts &amp; ❤️</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#fec01f]/20 border border-[#fec01f] shrink-0" />
                <span><strong>Quiz:</strong> FinTech test +50 pts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500/20 border border-orange-400 shrink-0" />
                <span><strong>Treasure:</strong> Points &amp; Shield protection</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quiz Overlay */}
      {quizQuestion && (
        <QuizOverlay question={questionIdFix(quizQuestion)} onAnswer={handleQuizAnswer} />
      )}

      {/* Treasure Overlay */}
      {showTreasure && (
        <TreasureOverlay
          points={showTreasure.points}
          shieldAwarded={BOARD_CONFIG.treasure.shieldAwarded}
          onClose={() => setShowTreasure(null)}
        />
      )}

      {/* Festival Footer */}
      <FestivalFooter />
    </div>
  );
}

// Helper to ensure question structure
function questionIdFix(q: QuizQuestion) {
  return q;
}
