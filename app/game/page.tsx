"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import GameBoard from "@/components/game/Board";
import QuizOverlay from "@/components/game/QuizOverlay";
import TreasureOverlay from "@/components/game/TreasureOverlay";
import DicePanel from "@/components/game/DicePanel";
import Cinematic3DDiceOverlay from "@/components/game/Cinematic3DDiceOverlay";
import { ThrowPhysics } from "@/components/game/Cube3D";
import CompactScoreHeader from "@/components/game/CompactScoreHeader";
import { AvatarMood } from "@/components/game/GameAvatar";
import EventLog from "@/components/game/EventLog";
import OnboardingModal from "@/components/game/OnboardingModal";
import FestivalHeader from "@/components/layout/FestivalHeader";
import FestivalFooter from "@/components/layout/FestivalFooter";
import { BOARD_CONFIG, BoardConfig } from "@/lib/game-engine/board-config";
import { generateDynamicBoard } from "@/lib/game-engine/procedural-generator";
import { sounds } from "@/lib/audio/sound-effects";
import {
  createInitialGameState,
  processTurn,
  rollDice,
  isTerminal as checkTerminal,
  GameState,
} from "@/lib/game-engine/engine";
import { getRandomQuestion, getQuizQuestion } from "@/lib/game-engine/quiz-bank";
import { Volume2, VolumeX, Shield, Trophy, RotateCcw, Play } from "lucide-react";

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
  computer_treasures_collected?: number[];
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
  playerRoll: number | null;
  playerEvents: Array<{ type: string; description: string; fromSquare?: number; toSquare?: number }>;
  playerFrom?: number | null;
  playerTo?: number | null;
  computerRoll: number | null;
  computerEvents: Array<{ type: string; description: string; fromSquare?: number; toSquare?: number }> | null;
  computerFrom?: number | null;
  computerTo?: number | null;
  quizQuestion: QuizQuestion | null;
  alreadyProcessed?: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [activeBoardConfig, setActiveBoardConfig] = useState<BoardConfig>(BOARD_CONFIG);
  const [boardSeed, setBoardSeed] = useState<number | null>(null);
  const [showPracticeBanner, setShowPracticeBanner] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [run, setRun] = useState<GameRun | null>(null);
  const [loading, setLoading] = useState(true);

  // Animated display coordinates
  const [playerDisplayPos, setPlayerDisplayPos] = useState<number>(1);
  const [computerDisplayPos, setComputerDisplayPos] = useState<number>(1);

  // Interactive dice & animation states
  const [rolling, setRolling] = useState(false);
  const [computerRolling, setComputerRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [computerRoll, setComputerRoll] = useState<number | null>(null);
  const [movingPawn, setMovingPawn] = useState<"player" | "computer" | null>(null);
  const [activeLadder, setActiveLadder] = useState<number | null>(null);
  const [activeSnake, setActiveSnake] = useState<number | null>(null);
    // 3D Cinematic Matte Blur Dice Overlay State
  const [diceOverlay, setDiceOverlay] = useState<{
    show: boolean;
    actor: "player" | "computer";
    rollValue: number | null;
    isRolling: boolean;
    physics?: ThrowPhysics;
    isOvershoot?: boolean;
  }>({
    show: false,
    actor: "player",
    rollValue: null,
    isRolling: false,
  });

  const [floatingMessage, setFloatingMessage] = useState<{
    text: string;
    type: "ladder" | "snake" | "treasure" | "quiz" | "finish";
  } | null>(null);

  // Expressive character avatar moods & Ava dynamic speech reactions
  const [playerMood, setPlayerMood] = useState<AvatarMood>("idle");
  const [computerMood, setComputerMood] = useState<AvatarMood>("idle");
  const [computerReaction, setComputerReaction] = useState<string | null>(null);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerComputerReaction = (mood: AvatarMood, speech: string, durationMs: number = 2800) => {
    setComputerMood(mood);
    setComputerReaction(speech);
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = setTimeout(() => {
      setComputerReaction(null);
      setComputerMood("idle");
    }, durationMs);
  };

  const triggerPlayerMood = (mood: AvatarMood, durationMs: number = 2500) => {
    setPlayerMood(mood);
    setTimeout(() => {
      setPlayerMood("idle");
    }, durationMs);
  };

  const getRandomAvaThinkingLine = () => {
    const lines = [
      "My turn! Let's see what I get...",
      "Calculating the optimal trajectory...",
      "Aiming for that golden ladder!",
      "Rolling for the win!",
      "Let's see if luck is on my side!",
      "Focusing on the next square!",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  };

  // Overlays
  const [events, setEvents] = useState<string[]>([]);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [showTreasure, setShowTreasure] = useState<{ points: number; square: number } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showMobileIntel, setShowMobileIntel] = useState(false);

  // Local Practice Game Engine state
  const localStateRef = useRef<GameState | null>(null);

  const isTerminal = (status: string) =>
    ["player_won", "computer_won", "player_eliminated", "completed"].includes(status);

  // Initialize Practice Mode (optionally with procedural seed)
  const startPracticeGame = useCallback((seed?: number) => {
    let config = BOARD_CONFIG;
    if (seed !== undefined) {
      config = generateDynamicBoard(seed).config;
      setBoardSeed(seed);
    } else {
      setBoardSeed(null);
    }
    setActiveBoardConfig(config);

    const initialState = createInitialGameState("practice-" + Date.now(), "guest-pilot");
    localStateRef.current = initialState;
    setIsPracticeMode(true);
    setProfile({
      display_name: "Practice Pilot",
      avatar_url: null,
      leaderboard_opt_in: false,
    });
    setRun({
      id: initialState.id,
      status: initialState.status,
      current_turn: initialState.currentTurn,
      turn_sequence: initialState.turnSequence,
      player_position: initialState.playerPosition,
      computer_position: initialState.computerPosition,
      player_hearts: initialState.playerHearts,
      computer_hearts: initialState.computerHearts,
      player_shields: initialState.playerShields,
      computer_shields: initialState.computerShields,
      player_score: initialState.playerScore,
      computer_score: initialState.computerScore,
      player_quiz_correct: initialState.playerQuizCorrect,
      player_treasures_collected: initialState.playerTreasuresCollected,
      computer_treasures_collected: initialState.computerTreasuresCollected,
      player_quiz_encountered: initialState.playerQuizEncountered,
      started_at: initialState.startedAt,
      completed_at: null,
    });
    setPlayerDisplayPos(1);
    setComputerDisplayPos(1);
    setEvents([
      seed !== undefined
        ? `✨ Arena reshuffled! Board seed #${seed} generated with dynamic layout.`
        : "🎮 Practice Arena active. Train your FinTech skills across all 25 squares!",
      "🎲 Roll 1–6 to advance toward Square 25.",
    ]);
    setError(null);
    const dismissed = typeof window !== "undefined" && sessionStorage.getItem("practice_banner_dismissed");
    if (!dismissed) {
      setShowPracticeBanner(true);
    }
    setLoading(false);
  }, []);

  const shufflePracticeBoard = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    sounds.playDiceRoll();
    startPracticeGame(newSeed);
  }, [startPracticeGame]);

  // Auto-dismiss practice banner timer
  useEffect(() => {
    if (showPracticeBanner) {
      const timer = setTimeout(() => {
        setShowPracticeBanner(false);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [showPracticeBanner]);

  // Check auth and initial load
  useEffect(() => {
    const load = async () => {
      const modeParam = searchParams.get("mode");
      if (modeParam === "practice") {
        startPracticeGame();
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // If not authenticated, give immediate practice mode option rather than hard kicking
        startPracticeGame();
        return;
      }
      setUser(user);

      // Fetch official current game state
      try {
        const res = await fetch("/api/game/state");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);

          if (!data.run) {
            setShowOnboarding(true);
          } else {
            setRun(data.run);
            if (data.run.board_seed) {
              const seedNum = Number(data.run.board_seed);
              const gen = generateDynamicBoard(seedNum);
              setActiveBoardConfig(gen.config);
              setBoardSeed(seedNum);
            }
            setPlayerDisplayPos(data.run.player_position);
            setComputerDisplayPos(data.run.computer_position);
            if (isTerminal(data.run.status)) {
              router.push("/game/result");
              return;
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          // If database tables are not initialized, offer practice mode
          setError(
            errData.error ||
              "Could not connect to official match host. You can play in Practice Arena right now!"
          );
        }
      } catch {
        setError("Network connection issue. You can continue in Practice Arena!");
      }
      setLoading(false);
    };
    load();
  }, [router, searchParams, startPracticeGame, supabase.auth]);

  // Synchronize display positions when run loads
  useEffect(() => {
    if (run && !animating) {
      setPlayerDisplayPos(run.player_position);
      setComputerDisplayPos(run.computer_position);
    }
  }, [run, animating]);

  // Handle onboarding for ranked matches
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
        if (data.run.board_seed) {
          const seedNum = Number(data.run.board_seed);
          const gen = generateDynamicBoard(seedNum);
          setActiveBoardConfig(gen.config);
          setBoardSeed(seedNum);
        }
        setPlayerDisplayPos(data.run.player_position);
        setComputerDisplayPos(data.run.computer_position);
      } else {
        setError(data.error || "Failed to start game. Starting in Practice Arena instead.");
        startPracticeGame();
      }
    } catch {
      setError("Network error. Starting in Practice Arena.");
      startPracticeGame();
    }
    setLoading(false);
  };

  /**
   * Smooth step-by-step pawn hopping animation
   */
  const animatePawnMovement = async (
    actor: "player" | "computer",
    from: number,
    finalTo: number,
    diceVal: number,
    eventsList: Array<{ type: string; description: string; fromSquare?: number; toSquare?: number }>
  ) => {
    setMovingPawn(actor);

    // 1. Overshoot check (failsafe: exact landing on 25 required)
    const isOvershot = eventsList.some((e) => e.type === "overshoot") || (from + diceVal > 25);
    if (isOvershot) {
      sounds.playShieldDeflect();
      setFloatingMessage({
        text: `🎯 Overshot! Exactly ${25 - from} needed to reach finish.`,
        type: "finish",
      });
      if (actor === "player") {
        triggerPlayerMood("worried", 2000);
        triggerComputerReaction("thinking", "Close one! Exactly " + (25 - from) + " needed for 25!", 2200);
      } else {
        triggerPlayerMood("happy", 2000);
        triggerComputerReaction("worried", "Ah, overshot! Need an exact roll for 25!", 2200);
      }
      await sleep(1000);
      setFloatingMessage(null);
      setMovingPawn(null);
      return;
    }

    // 2. Normal forward stepping
    const rawLanding = Math.min(25, from + diceVal);
    for (let pos = from + 1; pos <= rawLanding; pos++) {
      if (actor === "player") {
        setPlayerDisplayPos(pos);
      } else {
        setComputerDisplayPos(pos);
      }
      sounds.playPawnStep();
      await sleep(270);
    }

    // 3. Check for ladder ascent
    const ladderEv = eventsList.find((e) => e.type === "ladder");
    if (ladderEv) {
      const ladderFrom = ladderEv.fromSquare || rawLanding;
      const ladderTo = ladderEv.toSquare || finalTo;
      setActiveLadder(ladderFrom);
      setFloatingMessage({
        text: `🪜 Ladder Boost! +${BOARD_CONFIG.scoring.ladder} pts`,
        type: "ladder",
      });
      sounds.playLadderClimb();

      if (actor === "player") {
        triggerPlayerMood("celebrating", 2600);
        triggerComputerReaction("worried", "Whoa, golden ladder shortcut! Great move!", 2600);
      } else {
        triggerPlayerMood("worried", 2600);
        triggerComputerReaction("celebrating", "Boom! Golden ladder boost! 🚀", 2600);
      }

      await sleep(300);

      if (actor === "player") setPlayerDisplayPos(ladderTo);
      else setComputerDisplayPos(ladderTo);

      await sleep(850);
      setActiveLadder(null);
      setFloatingMessage(null);
    }

    // 4. Check for snake slide
    const snakeEv = eventsList.find((e) => e.type === "snake_ordinary" || e.type === "snake_major");
    if (snakeEv) {
      const snakeFrom = snakeEv.fromSquare || rawLanding;
      const snakeTo = snakeEv.toSquare || finalTo;
      const isMajor = snakeEv.type === "snake_major";
      setActiveSnake(snakeFrom);

      const shieldConsumed = eventsList.some((e) => e.type === "shield_consumed");
      if (shieldConsumed) {
        sounds.playShieldDeflect();
        setFloatingMessage({ text: "🛡️ Cyber Shield Absorbed Incident!", type: "snake" });
        if (actor === "player") {
          triggerPlayerMood("happy", 2400);
          triggerComputerReaction("thinking", "Smart shield! Deflected the hazard.", 2600);
          setRun((prev) => prev ? { ...prev, player_shields: Math.max(0, prev.player_shields - 1) } : null);
        } else {
          triggerComputerReaction("happy", "Phew! My cyber shield absorbed that hazard!", 2600);
          setRun((prev) => prev ? { ...prev, computer_shields: Math.max(0, prev.computer_shields - 1) } : null);
        }
      } else {
        sounds.playHeartLost();
        setFloatingMessage({
          text: isMajor ? "🐍⚠️ Major Risk Snake: -25 pts & ❤️ lost!" : "🐍 Snake Hazard: -10 pts & ❤️ lost!",
          type: "snake",
        });
        if (actor === "player") {
          triggerPlayerMood("worried", 2600);
          triggerComputerReaction("thinking", "Ouch, snake hazard! Lost a heart!", 2600);
          // Immediately update visible heart in top score bar
          setRun((prev) => prev ? { ...prev, player_hearts: Math.max(0, prev.player_hearts - 1) } : null);
        } else {
          triggerPlayerMood("happy", 2600);
          triggerComputerReaction("worried", "Oh no! Slid down the hazard & lost a heart! 🐍", 2600);
          // Immediately update visible heart in top score bar
          setRun((prev) => prev ? { ...prev, computer_hearts: Math.max(0, prev.computer_hearts - 1) } : null);
        }
      }
      await sleep(300);

      if (actor === "player") setPlayerDisplayPos(snakeTo);
      else setComputerDisplayPos(snakeTo);

      await sleep(900);
      setActiveSnake(null);
      setFloatingMessage(null);
    }

    // 5. Check for finish line victory
    if (finalTo === 25) {
      sounds.playVictory();
      setFloatingMessage({
        text: actor === "player" ? "🏁 VICTORY! Reached Square 25 (+300 pts)!" : "🏁 Ava reached Square 25!",
        type: "finish",
      });
      if (actor === "player") {
        triggerPlayerMood("celebrating", 4500);
        triggerComputerReaction("happy", "Incredible match! GG, FinTech Champion! 🏆", 4500);
      } else {
        triggerPlayerMood("worried", 4500);
        triggerComputerReaction("celebrating", "Square 25 reached! Victory is mine! 🏁", 4500);
      }
      await sleep(1500);
      setFloatingMessage(null);
    }

    // Confirm final positioning
    if (actor === "player") setPlayerDisplayPos(finalTo);
    else setComputerDisplayPos(finalTo);

    setMovingPawn(null);
  };

  /**
   * Execute Turn (Practice Mode using pure engine)
   */
  const handlePracticeRoll = async (physics?: ThrowPhysics) => {
    if (!localStateRef.current || rolling || animating || quizQuestion) return;
    const currentState = localStateRef.current;
    if (currentState.currentTurn !== "player" || checkTerminal(currentState)) return;

    const activePhysics = physics || { speed: 1.0, tilt: 10, arc: -24, dur: 0.85 };
    setRolling(true);
    setError(null);
    sounds.playDiceRoll();

    // Auto-dismiss practice banner on roll
    if (showPracticeBanner) {
      setShowPracticeBanner(false);
      if (typeof window !== "undefined") sessionStorage.setItem("practice_banner_dismissed", "true");
    }

    // 1. Roll Player 3D Die with Cinematic Matte Blur Overlay
    setDiceOverlay({
      show: true,
      actor: "player",
      rollValue: null,
      isRolling: true,
      physics: activePhysics,
    });

    await sleep(850);
    const pDice = rollDice();
    const isOvershot = currentState.playerPosition + pDice > 25;

    setLastRoll(pDice);
    setRolling(false);
    setDiceOverlay({
      show: true,
      actor: "player",
      rollValue: pDice,
      isRolling: false,
      physics: activePhysics,
      isOvershoot: isOvershot,
    });

    await sleep(950);
    setDiceOverlay((prev) => ({ ...prev, show: false }));
    await sleep(350);
    setAnimating(true);

    const fromPos = currentState.playerPosition;
    const pResult = processTurn(currentState, pDice, undefined, activeBoardConfig);
    localStateRef.current = pResult.newState;

    // Animate player movement
    await animatePawnMovement("player", fromPos, pResult.toPosition, pDice, pResult.events);

    // Update log
    const pMsgs = pResult.events.map((e) => e.description);
    setEvents((prev) => [...pMsgs.reverse(), ...prev].slice(0, 25));

    // Update run state for HUD
    const stateAfterPlayer = pResult.newState;
    setRun({
      id: stateAfterPlayer.id,
      status: stateAfterPlayer.status,
      current_turn: stateAfterPlayer.currentTurn,
      turn_sequence: stateAfterPlayer.turnSequence,
      player_position: stateAfterPlayer.playerPosition,
      computer_position: stateAfterPlayer.computerPosition,
      player_hearts: stateAfterPlayer.playerHearts,
      computer_hearts: stateAfterPlayer.computerHearts,
      player_shields: stateAfterPlayer.playerShields,
      computer_shields: stateAfterPlayer.computerShields,
      player_score: stateAfterPlayer.playerScore,
      computer_score: stateAfterPlayer.computerScore,
      player_quiz_correct: stateAfterPlayer.playerQuizCorrect,
      player_treasures_collected: stateAfterPlayer.playerTreasuresCollected,
      computer_treasures_collected: stateAfterPlayer.computerTreasuresCollected,
      player_quiz_encountered: stateAfterPlayer.playerQuizEncountered,
      started_at: stateAfterPlayer.startedAt,
      completed_at: stateAfterPlayer.completedAt,
    });

    // Check if FinTech quiz triggered
    const quizEv = pResult.events.find((e) => e.type === "quiz_triggered");
    if (quizEv) {
      const q = getRandomQuestion();
      if (q) {
        setQuizQuestion({
          id: q.id,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
          squareNumber: pResult.toPosition,
        });
        triggerPlayerMood("thinking", 3000);
        triggerComputerReaction("thinking", "FinTech checkpoint! Show what you've got!", 2800);
      }
      setAnimating(false);
      return;
    }

    // Check treasure
    const treasureEv = pResult.events.find((e) => e.type === "treasure_collected");
    if (treasureEv) {
      sounds.playTreasure();
      setShowTreasure({ points: BOARD_CONFIG.treasure.points, square: pResult.toPosition });
      triggerPlayerMood("celebrating", 2400);
      triggerComputerReaction("thinking", "Nice treasure cache! That shield will help protect points.", 2400);
    }

    // Check if terminal
    if (checkTerminal(stateAfterPlayer)) {
      setAnimating(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("practice_run", JSON.stringify(stateAfterPlayer));
      }
      setTimeout(() => router.push("/game/result?mode=practice"), 2200);
      return;
    }

    // 2. Autonomous Computer Opponent Turn
    if (stateAfterPlayer.currentTurn === "computer") {
      await sleep(400);
      triggerComputerReaction("thinking", getRandomAvaThinkingLine(), 2200);
      await sleep(450);

      const avaPhysics: ThrowPhysics = {
        speed: 1.0,
        tilt: (Math.random() - 0.5) * 20,
        arc: -24,
        dur: 0.85,
      };

      setComputerRolling(true);
      sounds.playDiceRoll();
      setDiceOverlay({
        show: true,
        actor: "computer",
        rollValue: null,
        isRolling: true,
        physics: avaPhysics,
      });

      await sleep(850);
      const cDice = rollDice();
      const compOvershot = stateAfterPlayer.computerPosition + cDice > 25;
      setComputerRoll(cDice);
      setComputerRolling(false);

      setDiceOverlay({
        show: true,
        actor: "computer",
        rollValue: cDice,
        isRolling: false,
        physics: avaPhysics,
        isOvershoot: compOvershot,
      });

      await sleep(950);
      setDiceOverlay((prev) => ({ ...prev, show: false }));
      await sleep(350);

      const cFrom = stateAfterPlayer.computerPosition;
      const cResult = processTurn(stateAfterPlayer, cDice, undefined, activeBoardConfig);
      localStateRef.current = cResult.newState;

      // Animate computer movement
      await animatePawnMovement("computer", cFrom, cResult.toPosition, cDice, cResult.events);

      const cMsgs = [`Ava rolled ${cDice}`, ...cResult.events.map((e) => e.description)];
      setEvents((prev) => [...cMsgs.reverse(), ...prev].slice(0, 25));

      const finalState = cResult.newState;
      setRun({
        id: finalState.id,
        status: finalState.status,
        current_turn: finalState.currentTurn,
        turn_sequence: finalState.turnSequence,
        player_position: finalState.playerPosition,
        computer_position: finalState.computerPosition,
        player_hearts: finalState.playerHearts,
        computer_hearts: finalState.computerHearts,
        player_shields: finalState.playerShields,
        computer_shields: finalState.computerShields,
        player_score: finalState.playerScore,
        computer_score: finalState.computerScore,
        player_quiz_correct: finalState.playerQuizCorrect,
        player_treasures_collected: finalState.playerTreasuresCollected,
        computer_treasures_collected: finalState.computerTreasuresCollected,
        player_quiz_encountered: finalState.playerQuizEncountered,
        started_at: finalState.startedAt,
        completed_at: finalState.completedAt,
      });

      if (checkTerminal(finalState)) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("practice_run", JSON.stringify(finalState));
        }
        setTimeout(() => router.push("/game/result?mode=practice"), 2200);
      }
    }

    setAnimating(false);
  };

  /**
   * Execute Turn (Ranked Mode via Server API)
   */
  const handleRankedRoll = useCallback(async (physics?: ThrowPhysics) => {
    if (!run || rolling || animating || quizQuestion) return;
    if (run.current_turn !== "player") return;
    if (isTerminal(run.status)) return;

    const activePhysics = physics || { speed: 1.0, tilt: 10, arc: -24, dur: 0.85 };
    setRolling(true);
    setError(null);
    setLastRoll(null);
    setComputerRoll(null);
    sounds.playDiceRoll();

    setDiceOverlay({
      show: true,
      actor: "player",
      rollValue: null,
      isRolling: true,
      physics: activePhysics,
    });

    const startTime = Date.now();

    try {
      const res = await fetch("/api/game/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data: TurnResult = await res.json();

      if (!res.ok) {
        setError((data as any).error || "Roll failed");
        setRolling(false);
        setDiceOverlay((prev) => ({ ...prev, show: false }));
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 850) {
        await sleep(850 - elapsed);
      }

      const pRoll = data.playerRoll ?? 1;
      const isOvershot = (data.playerFrom ?? run.player_position) + pRoll > 25;

      setLastRoll(pRoll);
      setRolling(false);
      setDiceOverlay({
        show: true,
        actor: "player",
        rollValue: pRoll,
        isRolling: false,
        physics: activePhysics,
        isOvershoot: isOvershot,
      });

      await sleep(950);
      setDiceOverlay((prev) => ({ ...prev, show: false }));
      await sleep(350);
      setAnimating(true);

      // Animate player pawn movement
      const playerFrom = data.playerFrom ?? run.player_position;
      const playerTo = data.playerTo ?? data.run.player_position;
      await animatePawnMovement("player", playerFrom, playerTo, data.playerRoll ?? 1, data.playerEvents || []);

      // Build player events
      const pMsgs: string[] = (data.playerEvents || []).map((e) => e.description);
      setEvents((prev) => [...pMsgs.reverse(), ...prev].slice(0, 25));

      // Check for quiz
      if (data.quizQuestion) {
        setQuizQuestion(data.quizQuestion);
        triggerPlayerMood("thinking", 3000);
        triggerComputerReaction("thinking", "FinTech checkpoint! Show what you've got!", 2800);
        setAnimating(false);
        setRun(data.run);
        return;
      }

      // Check for treasure
      const treasureEv = data.playerEvents?.find((e) => e.type === "treasure_collected");
      if (treasureEv) {
        sounds.playTreasure();
        setShowTreasure({ points: BOARD_CONFIG.treasure.points, square: data.run.player_position });
        triggerPlayerMood("celebrating", 2400);
        triggerComputerReaction("thinking", "Nice treasure cache! That shield will help protect points.", 2400);
      }

      // If game ended on player turn
      if (isTerminal(data.run.status)) {
        setRun(data.run);
        setAnimating(false);
        setTimeout(() => router.push("/game/result"), 2200);
        return;
      }

      // Now sequentially animate Computer Turn if returned
      if (data.computerRoll !== null) {
        await sleep(400);
        triggerComputerReaction("thinking", getRandomAvaThinkingLine(), 2200);
        await sleep(450);

        const avaPhysics: ThrowPhysics = {
          speed: 1.0,
          tilt: (Math.random() - 0.5) * 20,
          arc: -24,
          dur: 0.85,
        };

        setComputerRolling(true);
        sounds.playDiceRoll();
        setDiceOverlay({
          show: true,
          actor: "computer",
          rollValue: null,
          isRolling: true,
          physics: avaPhysics,
        });

        await sleep(850);
        const compOvershot = (data.computerFrom ?? run.computer_position) + data.computerRoll > 25;
        setComputerRoll(data.computerRoll);
        setComputerRolling(false);

        setDiceOverlay({
          show: true,
          actor: "computer",
          rollValue: data.computerRoll,
          isRolling: false,
          physics: avaPhysics,
          isOvershoot: compOvershot,
        });

        await sleep(950);
        setDiceOverlay((prev) => ({ ...prev, show: false }));
        await sleep(350);

        const compFrom = data.computerFrom ?? run.computer_position;
        const compTo = data.computerTo ?? data.run.computer_position;
        await animatePawnMovement("computer", compFrom, compTo, data.computerRoll, data.computerEvents || []);

        const cMsgs: string[] = [
          `Ava rolled ${data.computerRoll}`,
          ...(data.computerEvents || []).map((e) => e.description),
        ];
        setEvents((prev) => [...cMsgs.reverse(), ...prev].slice(0, 25));
      }

      setRun(data.run);

      if (isTerminal(data.run.status)) {
        setTimeout(() => router.push("/game/result"), 2200);
      }
    } catch {
      setError("Network communication error. Please try rolling again.");
    }

    setRolling(false);
    setAnimating(false);
  }, [run, rolling, animating, quizQuestion, router]);

  const handleRoll = (physics?: ThrowPhysics) => {
    if (isPracticeMode) {
      handlePracticeRoll(physics);
    } else {
      handleRankedRoll(physics);
    }
  };

  /**
   * Handle Quiz Submission (for both Ranked and Practice modes)
   */
  const handleQuizAnswer = async (questionId: string, squareNumber: number, selectedOption: number) => {
    setQuizQuestion(null);

    if (isPracticeMode && localStateRef.current) {
      const q = getQuizQuestion(questionId);
      const isCorrect = q ? q.correctIndex === selectedOption : false;

      if (isCorrect) {
        sounds.playQuizCorrect();
        triggerPlayerMood("celebrating", 2600);
        triggerComputerReaction("happy", "FinTech genius! Flawless answer!", 2600);
        localStateRef.current.playerScore += BOARD_CONFIG.scoring.quizCorrect;
        localStateRef.current.playerQuizCorrect += 1;
        setEvents((prev) => [
          `✅ Correct! +${BOARD_CONFIG.scoring.quizCorrect} pts! ${q?.explanation || ""}`,
          ...prev,
        ]);
      } else {
        sounds.playQuizWrong();
        triggerPlayerMood("worried", 2600);
        triggerComputerReaction("thinking", "Tricky question! You'll get the next one.", 2600);
        setEvents((prev) => [`❌ Incorrect. ${q?.explanation || ""}`, ...prev]);
      }

      // Pass turn to computer
      localStateRef.current.currentTurn = "computer";
      localStateRef.current.turnSequence += 1;

      // Update HUD
      const st = localStateRef.current;
      setRun((prev) =>
        prev
          ? {
              ...prev,
              player_score: st.playerScore,
              player_quiz_correct: st.playerQuizCorrect,
              current_turn: "computer",
              turn_sequence: st.turnSequence,
            }
          : null
      );

      // Trigger computer turn after short delay
      setTimeout(async () => {
        triggerComputerReaction("thinking", getRandomAvaThinkingLine(), 2200);
        await sleep(400);
        setComputerRolling(true);
        sounds.playDiceRoll();
        await sleep(650);

        const cDice = rollDice();
        setComputerRoll(cDice);
        setComputerRolling(false);

        const cFrom = localStateRef.current!.computerPosition;
        const cResult = processTurn(localStateRef.current!, cDice, undefined, activeBoardConfig);
        localStateRef.current = cResult.newState;

        await animatePawnMovement("computer", cFrom, cResult.toPosition, cDice, cResult.events);

        const cMsgs = [`Ava rolled ${cDice}`, ...cResult.events.map((e) => e.description)];
        setEvents((prev) => [...cMsgs.reverse(), ...prev].slice(0, 25));

        const finalState = cResult.newState;
        setRun({
          id: finalState.id,
          status: finalState.status,
          current_turn: finalState.currentTurn,
          turn_sequence: finalState.turnSequence,
          player_position: finalState.playerPosition,
          computer_position: finalState.computerPosition,
          player_hearts: finalState.playerHearts,
          computer_hearts: finalState.computerHearts,
          player_shields: finalState.playerShields,
          computer_shields: finalState.computerShields,
          player_score: finalState.playerScore,
          computer_score: finalState.computerScore,
          player_quiz_correct: finalState.playerQuizCorrect,
          player_treasures_collected: finalState.playerTreasuresCollected,
          computer_treasures_collected: finalState.computerTreasuresCollected,
          player_quiz_encountered: finalState.playerQuizEncountered,
          started_at: finalState.startedAt,
          completed_at: finalState.completedAt,
        });

        if (checkTerminal(finalState)) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("practice_run", JSON.stringify(finalState));
          }
          setTimeout(() => router.push("/game/result?mode=practice"), 2200);
        }
      }, 700);
      return;
    }

    // Ranked API flow
    try {
      const res = await fetch("/api/game/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, squareNumber, selectedOption }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.isCorrect) {
          sounds.playQuizCorrect();
          triggerPlayerMood("celebrating", 2600);
          triggerComputerReaction("happy", "FinTech genius! Flawless answer!", 2600);
          setEvents((prev) => [
            `✅ Correct! +${BOARD_CONFIG.scoring.quizCorrect} pts! ${data.explanation}`,
            ...prev,
          ]);
        } else {
          sounds.playQuizWrong();
          triggerPlayerMood("worried", 2600);
          triggerComputerReaction("thinking", "Tricky question! You'll get the next one.", 2600);
          setEvents((prev) => [`❌ Incorrect. ${data.explanation}`, ...prev]);
        }

        // Refresh state
        const stateRes = await fetch("/api/game/state");
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setRun(stateData.run);
        }

        // Process computer turn
        setTimeout(async () => {
          triggerComputerReaction("thinking", getRandomAvaThinkingLine(), 2200);
          await sleep(400);
          setComputerRolling(true);
          sounds.playDiceRoll();

          const rollRes = await fetch("/api/game/roll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (rollRes.ok) {
            const rollData: TurnResult = await rollRes.json();
            setComputerRolling(false);

            if (rollData.computerRoll !== null) {
              setComputerRoll(rollData.computerRoll);
              const compFrom = run?.computer_position ?? 1;
              const compTo = rollData.run.computer_position;
              await animatePawnMovement(
                "computer",
                compFrom,
                compTo,
                rollData.computerRoll,
                rollData.computerEvents || []
              );

              const cMsgs: string[] = [
                `Ava rolled ${rollData.computerRoll}`,
                ...(rollData.computerEvents || []).map((e) => e.description),
              ];
              setEvents((prev) => [...cMsgs.reverse(), ...prev].slice(0, 25));
            }

            setRun(rollData.run);
            if (isTerminal(rollData.run.status)) {
              setTimeout(() => router.push("/game/result"), 2200);
            }
          } else {
            setComputerRolling(false);
          }
        }, 800);
      }
    } catch {
      setError("Quiz submission encountered a network error.");
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06061f] text-white p-4">
        <div className="max-w-md w-full festival-card p-6 border-white/10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">
            🎮
          </div>

          <h2 className="text-xl font-bold font-mono text-[#fec01f] mb-2">
            Arena Launch Console
          </h2>

          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            {error || "Ready to experience the digital Snakes and Ladders arena?"}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => startPracticeGame()}
              className="w-full py-3.5 rounded-xl interactive-btn interactive-btn--primary font-mono text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(254,192,31,0.4)]"
            >
              <Play size={18} />
              <span>Launch Practice Arena Now</span>
            </button>

            <a
              href="/"
              className="block w-full py-3 rounded-xl border border-white/10 text-white/80 font-mono text-xs font-semibold hover:bg-white/5 transition-colors"
            >
              Return Home
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

      {/* Mode Notification Banner (Auto-dismisses & persists dismiss state) */}
      {isPracticeMode && (
        <div
          className={`transition-all duration-500 ease-out overflow-hidden ${
            showPracticeBanner
              ? "max-h-20 opacity-100 border-b border-teal-500/40"
              : "max-h-0 opacity-0 border-b-0 py-0 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-[#0a0a28] px-4 py-2 text-center text-xs font-mono text-teal-200 flex items-center justify-center gap-2 sm:gap-3">
            <span className="font-bold uppercase tracking-wider bg-teal-500/20 px-2 py-0.5 rounded border border-teal-400/40 shrink-0">
              Practice Arena
            </span>
            <span className="truncate">Unlimited moves, full audio &amp; physics. Ready to rank?</span>
            <a
              href="/"
              className="text-[#fec01f] font-bold underline hover:text-white transition-colors shrink-0"
            >
              Sign in for Official Tournament Leaderboard →
            </a>
            <button
              onClick={() => {
                setShowPracticeBanner(false);
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("practice_banner_dismissed", "true");
                }
              }}
              className="text-teal-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors ml-1 shrink-0 cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

                {/* Unified Mobile-First Match Header (Player vs Ava) */}
        <CompactScoreHeader
          playerName={profile?.display_name || "You"}
          playerScore={run.player_score}
          playerHearts={run.player_hearts}
          playerShields={run.player_shields}
          playerPosition={playerDisplayPos}
          playerQuizCorrect={run.player_quiz_correct}
          playerMood={playerMood}
          computerScore={run.computer_score}
          computerHearts={run.computer_hearts}
          computerShields={run.computer_shields}
          computerPosition={computerDisplayPos}
          computerMood={computerMood}
          computerReaction={computerReaction}
          currentTurn={run.current_turn as "player" | "computer"}
          turnSequence={run.turn_sequence}
          isPracticeMode={isPracticeMode}
          onResetPractice={isPracticeMode ? () => startPracticeGame() : undefined}
          onShuffleBoard={isPracticeMode ? shufflePracticeBoard : undefined}
          boardSeed={boardSeed}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6 items-start">
          {/* Main Arena Board & Controls */}
          <div className="space-y-3 sm:space-y-4">
            <GameBoard
              playerPosition={playerDisplayPos}
              computerPosition={computerDisplayPos}
              playerName={profile?.display_name || "You"}
              playerMood={playerMood}
              computerMood={computerMood}
              animating={animating}
              activeLadder={activeLadder}
              activeSnake={activeSnake}
              movingPawn={movingPawn}
              floatingMessage={floatingMessage}
              boardConfig={activeBoardConfig}
            />

            {/* Dice Control Console */}
            {!gameOver && (
              <DicePanel
                isPlayerTurn={run.current_turn === "player"}
                rolling={rolling}
                computerRolling={computerRolling}
                lastRoll={lastRoll}
                computerRoll={computerRoll}
                onRoll={handleRoll}
                disabled={!!quizQuestion || animating}
                playerPosition={playerDisplayPos}
              />
            )}

            {/* Field Point Values Reference Pills (Placed directly below Roll Dice button) */}
            <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-white/70 pt-0.5">
              <span className="flex items-center gap-1 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-full text-teal-300">
                <span>🪜</span> Ladders (+25)
              </span>
              <span className="flex items-center gap-1 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full text-rose-300">
                <span>🐍</span> Snakes (-10/-25 &amp; ❤️)
              </span>
              <span className="flex items-center gap-1 bg-amber-950/60 border border-[#fec01f]/30 px-2 py-0.5 rounded-full text-[#fec01f]">
                <span>📝</span> Quiz (+50)
              </span>
              <span className="flex items-center gap-1 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded-full text-orange-300">
                <span>💰</span> Treasure (+50 &amp; 🛡️)
              </span>
            </div>

            {/* Mobile Collapsible Chronicle & Field Intel */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileIntel(!showMobileIntel)}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-wider text-white/70 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span>📜 Match Chronicle &amp; Field Guide ({events.length})</span>
                <span>{showMobileIntel ? "▲ Hide" : "▼ Show"}</span>
              </button>
              {showMobileIntel && (
                <div className="mt-3 space-y-3 animate-slide-up">
                  <EventLog events={events} />
                  <div className="festival-card p-3 text-xs font-mono text-white/60 space-y-1.5 border-white/10 bg-[#0a0a28]/80">
                    <p className="font-bold text-white/90 uppercase tracking-wider text-[11px] mb-1">
                      Field Intel
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-teal-500/20 border border-teal-400 shrink-0" />
                      <span><strong>Ladders:</strong> Boost ahead +25 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-400 shrink-0" />
                      <span><strong>Snakes:</strong> Set back -10/-25 pts &amp; ❤️</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-[#fec01f]/20 border border-[#fec01f] shrink-0" />
                      <span><strong>Quiz:</strong> FinTech test +50 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-orange-500/20 border border-orange-400 shrink-0" />
                      <span><strong>Treasure:</strong> Points &amp; Shield protection</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Telemetry Feed */}
          <div className="hidden lg:block space-y-4">
            <EventLog events={events} />
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
        <QuizOverlay question={quizQuestion} onAnswer={handleQuizAnswer} />
      )}

      {/* Treasure Overlay */}
      {showTreasure && (
        <TreasureOverlay
          points={showTreasure.points}
          shieldAwarded={BOARD_CONFIG.treasure.shieldAwarded}
          onClose={() => setShowTreasure(null)}
        />
      )}

      {/* Cinematic 3D Physical Dice Overlay (Full-Screen Matte Blur) */}
      <Cinematic3DDiceOverlay {...diceOverlay} />

      {/* Festival Footer */}
      <FestivalFooter />
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#06061f]">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-[#fec01f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-sm text-white/70">Initializing FinTech Arena…</p>
          </div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
