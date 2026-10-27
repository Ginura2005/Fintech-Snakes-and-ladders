"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
      const { data: { user } } = await supabase.auth.getUser();
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
      }
      setLoading(false);
    };
    load();
  }, []);

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

        // Now process computer turn — do another roll for computer
        // Computer turn was deferred because quiz was pending
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your game…</p>
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Something went wrong. <a href="/" className="text-teal-600 underline">Go home</a></p>
      </div>
    );
  }

  const gameOver = isTerminal(run.status);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="font-bold text-sm text-gray-800 hidden sm:block">LANKA FINTECHVERSE</span>
          </a>
          <div className="flex items-center gap-3 text-sm">
            {profile && (
              <span className="text-gray-600 font-medium hidden sm:block">{profile.display_name}</span>
            )}
            <span className="text-teal-700 font-bold">
              {run.player_score.toLocaleString()} pts
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Board + Dice */}
          <div className="space-y-4">
            {/* Board */}
            <div className="glass-card p-4">
              <GameBoard
                playerPosition={run.player_position}
                computerPosition={run.computer_position}
                playerName={profile?.display_name || "You"}
                animating={animating}
              />
            </div>

            {/* Dice */}
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

          {/* Right panel */}
          <div className="space-y-4">
            {/* Player stats */}
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

            {/* Computer stats */}
            <PlayerPanel
              label="Computer"
              hearts={run.computer_hearts}
              shields={run.computer_shields}
              score={run.computer_score}
              position={run.computer_position}
              quizCorrect={0}
              isCurrentTurn={run.current_turn === "computer"}
              tokenColor="burgundy"
            />

            {/* Event log */}
            <EventLog events={events} />

            {/* Legend */}
            <div className="glass-card p-3 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Board Legend</p>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-teal-50 border border-teal-400 inline-block flex-shrink-0" /> Ladder (climb up!)</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-50 border border-red-400 inline-block flex-shrink-0" /> Snake (slide back)</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-400 inline-block flex-shrink-0" /> FinTech Quiz</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-orange-50 border border-orange-400 inline-block flex-shrink-0" /> Treasure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Overlay */}
      {quizQuestion && (
        <QuizOverlay
          question={quizQuestion}
          onAnswer={handleQuizAnswer}
        />
      )}

      {/* Treasure Overlay */}
      {showTreasure && (
        <TreasureOverlay
          points={showTreasure.points}
          shieldAwarded={BOARD_CONFIG.treasure.shieldAwarded}
          onClose={() => setShowTreasure(null)}
        />
      )}
    </main>
  );
}
