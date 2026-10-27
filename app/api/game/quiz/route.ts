import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getQuizQuestion } from "@/lib/game-engine/quiz-bank";
import { BOARD_CONFIG } from "@/lib/game-engine/board-config";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/quiz
 * Submit a quiz answer for the current quiz encounter.
 * Idempotent: if already answered this square, returns previous result.
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

    const body = await request.json();
    const { questionId, squareNumber, selectedOption } = body;

    if (
      typeof questionId !== "string" ||
      typeof squareNumber !== "number" ||
      typeof selectedOption !== "number"
    ) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Fetch run
    const { data: run, error: runError } = await serviceClient
      .from("game_runs")
      .select("id, status, player_quiz_correct, player_quiz_encountered, player_score, turn_sequence")
      .eq("player_id", user.id)
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: "No active run" }, { status: 404 });
    }

    if (run.status !== "in_progress") {
      return NextResponse.json({ error: "Game is not active" }, { status: 409 });
    }

    // Idempotency: check if already answered this square
    const { data: existing } = await serviceClient
      .from("quiz_attempts")
      .select("*")
      .eq("run_id", run.id)
      .eq("square_number", squareNumber)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        alreadyAnswered: true,
        isCorrect: existing.is_correct,
        questionId: existing.question_id,
      });
    }

    // Validate answer
    const question = getQuizQuestion(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Validate square is a quiz square
    const specialSquares = BOARD_CONFIG.specialSquares;
    const isValidQuizSquare = specialSquares.some(
      (sq) => sq.square === squareNumber && sq.type === "quiz"
    );
    if (!isValidQuizSquare) {
      return NextResponse.json({ error: "Not a quiz square" }, { status: 400 });
    }

    // Verify the player has encountered this square
    const encountered = (run.player_quiz_encountered || []).includes(squareNumber);
    if (!encountered) {
      return NextResponse.json({ error: "Quiz square not encountered" }, { status: 400 });
    }

    const isCorrect = selectedOption === question.correctIndex;
    const scoreDelta = isCorrect ? BOARD_CONFIG.scoring.quizCorrect : 0;
    const newScore = Math.max(0, (run.player_score || 0) + scoreDelta);
    const newQuizCorrect = (run.player_quiz_correct || 0) + (isCorrect ? 1 : 0);

    // Record quiz attempt (unique per run+square)
    const { error: attemptError } = await serviceClient
      .from("quiz_attempts")
      .insert({
        run_id: run.id,
        square_number: squareNumber,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
      });

    if (attemptError?.code === "23505") {
      // Race condition: already recorded
      const { data: raceExisting } = await serviceClient
        .from("quiz_attempts")
        .select("*")
        .eq("run_id", run.id)
        .eq("square_number", squareNumber)
        .single();
      return NextResponse.json({
        alreadyAnswered: true,
        isCorrect: raceExisting?.is_correct ?? false,
      });
    }

    // Update score if correct
    if (isCorrect) {
      await serviceClient
        .from("game_runs")
        .update({
          player_score: newScore,
          player_quiz_correct: newQuizCorrect,
        })
        .eq("id", run.id);

      // Record in ledger
      await serviceClient.from("score_ledger").insert({
        run_id: run.id,
        turn_sequence: run.turn_sequence,
        actor: "player",
        event: "quiz_correct",
        delta: scoreDelta,
        balance_after: newScore,
      });
    }

    // Now process computer turn (quiz square doesn't affect computer turn)
    // The computer turn will be triggered by the next roll API call

    return NextResponse.json({
      isCorrect,
      scoreDelta,
      explanation: question.explanation,
      correctIndex: question.correctIndex,
      newScore,
    });
  } catch (err) {
    console.error("Quiz error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
