import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  processTurn,
  rollDice,
  isTerminal,
  GameState,
} from "@/lib/game-engine/engine";
import { BOARD_CONFIG } from "@/lib/game-engine/board-config";
import { generateDynamicBoard } from "@/lib/game-engine/procedural-generator";
import { getRandomQuestion, getQuizQuestion } from "@/lib/game-engine/quiz-bank";
import {
  checkRateLimit,
  checkTurnCooldown,
  acquireActionLock,
  releaseActionLock,
  createRateLimitResponse,
} from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

// Managed via @/lib/security/rate-limiter with atomic TTL self-expiry

/**
 * POST /api/game/roll
 * Process one complete turn for the active player.
 * Handles both player and computer turns.
 * Idempotent: if the turn_sequence already has a move recorded, return it.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Rate Limiting: Max 35 rolls per 60 seconds
    const rateLimit = await checkRateLimit(`roll:${user.id}`, {
      limit: 35,
      windowSeconds: 60,
    });
    if (!rateLimit.success) {
      return createRateLimitResponse(
        rateLimit,
        "Roll rate limit reached. Please wait a few seconds before rolling again."
      );
    }

    // 2. Anti-Speed-Hacking: 1000ms minimum turn interval
    const cooldown = checkTurnCooldown(`cooldown:${user.id}`, 1000);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: "Turn cooldown active. Please wait for the 3D dice to settle.",
          remainingMs: cooldown.remainingMs,
        },
        { status: 429, headers: { "Retry-After": "1" } }
      );
    }

    // 3. Atomic action lock with 5s self-expiry
    const lockKey = `lock:roll:${user.id}`;
    if (!acquireActionLock(lockKey, 5000)) {
      return NextResponse.json(
        { error: "Turn already being processed" },
        { status: 429 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // body empty or non-json
    }
    const puzzleBonus = Math.min(50, Math.max(0, Math.floor(Number(body?.puzzleBonus) || 0)));

    try {
      return await processRoll(user.id, supabase, puzzleBonus);
    } finally {
      releaseActionLock(lockKey);
    }
  } catch (err) {
    console.error("Roll error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processRoll(userId: string, supabase: any, puzzleBonus: number = 0) {
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const db = hasServiceKey ? createServiceClient() : supabase;

  // Fetch current run
  const { data: run, error: fetchError } = await db
    .from("game_runs")
    .select("*")
    .eq("player_id", userId)
    .single();

  if (fetchError || !run) {
    return NextResponse.json({ error: "No active run found" }, { status: 404 });
  }

  // Check terminal state
  if (isTerminal({ status: run.status } as GameState)) {
    return NextResponse.json({ error: "Game is already finished", run }, { status: 409 });
  }

  const currentSequence = run.turn_sequence;

  // Check for duplicate (idempotency)
  const { data: existingMove } = await db
    .from("game_moves")
    .select("*")
    .eq("run_id", run.id)
    .eq("turn_sequence", currentSequence)
    .maybeSingle();

  if (existingMove) {
    // Return current state (already processed)
    return NextResponse.json({ run, move: existingMove, alreadyProcessed: true });
  }

  // Build engine state from DB row
  const engineState: GameState = {
    id: run.id,
    playerId: run.player_id,
    configVersion: run.config_version,
    status: run.status,
    currentTurn: run.current_turn,
    turnSequence: run.turn_sequence,
    playerPosition: run.player_position,
    computerPosition: run.computer_position,
    playerHearts: run.player_hearts,
    computerHearts: run.computer_hearts,
    playerShields: run.player_shields,
    computerShields: run.computer_shields,
    playerScore: run.player_score,
    computerScore: run.computer_score,
    playerQuizCorrect: run.player_quiz_correct,
    playerTreasuresCollected: run.player_treasures_collected || [],
    computerTreasuresCollected: run.computer_treasures_collected || [],
    playerQuizEncountered: run.player_quiz_encountered || [],
    startedAt: run.started_at,
    completedAt: run.completed_at,
  };

  const boardConfig = run.board_seed ? generateDynamicBoard(Number(run.board_seed)).config : BOARD_CONFIG;
  const initialActor = engineState.currentTurn;

  // Roll die (server-side crypto random)
  const firstDice = rollDice();

  // Process first turn
  const firstResult = processTurn(engineState, firstDice, undefined, boardConfig);

  // Check if quiz was triggered
  let quizQuestion = null;
  const quizEvent = firstResult.events.find((e) => e.type === "quiz_triggered");
  if (quizEvent && initialActor === "player") {
    // Pick a question not already used at this square
    const { data: prevAttempt } = await db
      .from("quiz_attempts")
      .select("question_id")
      .eq("run_id", run.id)
      .eq("square_number", firstResult.toPosition)
      .maybeSingle();

    if (!prevAttempt) {
      const usedIds = (run.player_quiz_encountered || [])
        .map((_: number) => _)
        .flatMap((_: number) => []);
      quizQuestion = getRandomQuestion(usedIds);
    }
  }

  // Persist first move
  await persistTurnResult(db, run.id, firstResult, currentSequence);

  let stateAfterTurn = firstResult.newState;
  let secondResult: any = null;

  // If initial turn was player, no quiz was triggered, and it's now computer's turn:
  if (initialActor === "player" && !quizEvent && !isTerminal(stateAfterTurn) && stateAfterTurn.currentTurn === "computer") {
    const computerDice = rollDice();
    secondResult = processTurn(stateAfterTurn, computerDice, undefined, boardConfig);
    await persistTurnResult(db, run.id, secondResult, stateAfterTurn.turnSequence);
    stateAfterTurn = secondResult.newState;
  }

  // Final state to persist
  const finalState = stateAfterTurn;

  // Award modest Arena Challenge Bonus if game ended and bonus hasn't already been recorded
  if (isTerminal(finalState) && puzzleBonus > 0) {
    const { data: existingBonus } = await db
      .from("score_ledger")
      .select("id")
      .eq("run_id", run.id)
      .eq("event", "puzzle_bonus")
      .maybeSingle();

    if (!existingBonus) {
      finalState.playerScore += puzzleBonus;
      await db.from("score_ledger").insert({
        run_id: run.id,
        turn_sequence: finalState.turnSequence,
        actor: "player",
        event: "puzzle_bonus",
        delta: puzzleBonus,
        balance_after: finalState.playerScore,
      });
    }
  }

  // Update game_runs
  const { error: updateError } = await db
    .from("game_runs")
    .update({
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
      completed_at: finalState.completedAt,
      duration_seconds: finalState.completedAt
        ? Math.round((new Date(finalState.completedAt).getTime() - new Date(run.started_at).getTime()) / 1000)
        : null,
    })
    .eq("id", run.id)
    .eq("turn_sequence", currentSequence); // optimistic lock

  if (updateError) {
    console.error("Update run error:", updateError);
    return NextResponse.json({ error: "State update failed" }, { status: 500 });
  }

  // If game ended and player opted into leaderboard, record entry
  if (isTerminal(finalState)) {
    await tryRecordLeaderboardEntry(db, finalState, userId);
  }

  // Refresh run from DB
  const { data: updatedRun } = await db
    .from("game_runs")
    .select("*")
    .eq("id", run.id)
    .single();

  const playerTurnData = initialActor === "player" ? firstResult : null;
  const computerTurnData = initialActor === "computer" ? firstResult : secondResult;

  return NextResponse.json({
    run: updatedRun,
    playerRoll: playerTurnData ? playerTurnData.diceValue : null,
    playerEvents: playerTurnData ? playerTurnData.events : null,
    playerFrom: playerTurnData ? playerTurnData.fromPosition : null,
    playerTo: playerTurnData ? playerTurnData.toPosition : null,
    computerRoll: computerTurnData ? computerTurnData.diceValue : null,
    computerEvents: computerTurnData ? computerTurnData.events : null,
    computerFrom: computerTurnData ? computerTurnData.fromPosition : null,
    computerTo: computerTurnData ? computerTurnData.toPosition : null,
    quizQuestion: quizQuestion
      ? {
          id: quizQuestion.id,
          category: quizQuestion.category,
          difficulty: quizQuestion.difficulty,
          question: quizQuestion.question,
          options: quizQuestion.options, // shuffling happens client-side for display; correctIndex sent to server only
          squareNumber: firstResult.toPosition,
        }
      : null,
  });
}

async function persistTurnResult(
  serviceClient: any,
  runId: string,
  result: any,
  sequence: number
) {
  // Insert move record
  await serviceClient.from("game_moves").upsert(
    {
      run_id: runId,
      turn_sequence: sequence,
      actor: result.actor,
      dice_result: result.diceValue,
      from_position: result.fromPosition,
      to_position: result.toPosition,
      events: result.events,
    },
    { onConflict: "run_id,turn_sequence", ignoreDuplicates: true }
  );

  // Insert score ledger entries
  for (const delta of result.scoreDeltas) {
    const balance =
      delta.actor === "player"
        ? result.newState.playerScore
        : result.newState.computerScore;
    await serviceClient.from("score_ledger").insert({
      run_id: runId,
      turn_sequence: sequence,
      actor: delta.actor,
      event: delta.event,
      delta: delta.delta,
      balance_after: balance,
    });
  }
}

async function tryRecordLeaderboardEntry(
  serviceClient: any,
  state: GameState,
  userId: string
) {
  // Only winning runs where the player has actively chosen to post can be recorded
  if (state.status !== "player_won") return;

  const { data: profile } = await serviceClient
    .from("player_profiles")
    .select("display_name, leaderboard_opt_in")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.leaderboard_opt_in) return;

  await serviceClient.from("leaderboard_entries").upsert(
    {
      run_id: state.id,
      player_id: userId,
      display_name: profile.display_name,
      final_score: state.playerScore,
      player_won: true,
      quiz_correct: state.playerQuizCorrect,
      hearts_remaining: state.playerHearts,
      duration_seconds: state.completedAt
        ? Math.round(
            (new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000
          )
        : null,
    },
    { onConflict: "player_id" }
  );
}
