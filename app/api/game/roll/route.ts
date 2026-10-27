import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  processTurn,
  rollDice,
  isTerminal,
  GameState,
} from "@/lib/game-engine/engine";
import { getRandomQuestion, getQuizQuestion } from "@/lib/game-engine/quiz-bank";

export const dynamic = "force-dynamic";

// Simple in-memory lock to prevent concurrent rolls for the same player
// In production, use a database advisory lock or Redis
const processingLocks = new Set<string>();

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

    // Prevent concurrent processing for same user
    if (processingLocks.has(user.id)) {
      return NextResponse.json(
        { error: "Turn already being processed" },
        { status: 429 }
      );
    }

    processingLocks.add(user.id);

    try {
      return await processRoll(user.id, supabase);
    } finally {
      processingLocks.delete(user.id);
    }
  } catch (err) {
    console.error("Roll error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processRoll(userId: string, supabase: any) {
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

  // Roll die (server-side crypto random)
  const diceValue = rollDice();

  // Process player turn
  const playerResult = processTurn(engineState, diceValue);

  // Check if quiz was triggered
  let quizQuestion = null;
  const quizEvent = playerResult.events.find((e) => e.type === "quiz_triggered");
  if (quizEvent && playerResult.actor === "player") {
    // Pick a question not already used at this square
    const { data: prevAttempt } = await db
      .from("quiz_attempts")
      .select("question_id")
      .eq("run_id", run.id)
      .eq("square_number", playerResult.toPosition)
      .maybeSingle();

    if (!prevAttempt) {
      const usedIds = (run.player_quiz_encountered || [])
        .map((_: number) => _)
        .flatMap((_: number) => []);
      quizQuestion = getRandomQuestion(usedIds);
    }
  }

  // Persist player move
  await persistTurnResult(db, run.id, playerResult, currentSequence);

  let stateAfterPlayerTurn = playerResult.newState;
  let computerResult = null;

  // If game continues and it's now computer's turn, process computer automatically
  if (!isTerminal(stateAfterPlayerTurn) && stateAfterPlayerTurn.currentTurn === "computer" && !quizEvent) {
    const computerDice = rollDice();
    computerResult = processTurn(stateAfterPlayerTurn, computerDice);
    await persistTurnResult(db, run.id, computerResult, stateAfterPlayerTurn.turnSequence);
    stateAfterPlayerTurn = computerResult.newState;
  }

  // Final state to persist
  const finalState = stateAfterPlayerTurn;

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

  return NextResponse.json({
    run: updatedRun,
    playerRoll: diceValue,
    playerEvents: playerResult.events,
    computerRoll: computerResult ? (computerResult as any).diceValue : null,
    computerEvents: computerResult ? (computerResult as any).events : null,
    quizQuestion: quizQuestion
      ? {
          id: quizQuestion.id,
          category: quizQuestion.category,
          difficulty: quizQuestion.difficulty,
          question: quizQuestion.question,
          options: quizQuestion.options, // shuffling happens client-side for display; correctIndex sent to server only
          squareNumber: playerResult.toPosition,
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
      player_won: state.status === "player_won",
      quiz_correct: state.playerQuizCorrect,
      hearts_remaining: state.playerHearts,
      duration_seconds: state.completedAt
        ? Math.round(
            (new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000
          )
        : null,
    },
    { onConflict: "run_id", ignoreDuplicates: true }
  );
}
