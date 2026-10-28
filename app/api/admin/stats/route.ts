import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  const db = createServiceClient();

  try {
    // 1. Players count
    const { count: totalPlayers, error: playerError } = await db
      .from("player_profiles")
      .select("*", { count: "exact", head: true });

    // 2. Game runs by status
    const { data: runs, error: runsError } = await db
      .from("game_runs")
      .select("id, status, player_score, duration_seconds, started_at, completed_at, player_quiz_correct");

    // 3. Leaderboard entries
    const { count: totalLeaderboard, error: lbError } = await db
      .from("leaderboard_entries")
      .select("*", { count: "exact", head: true });

    // 4. Quiz attempts
    const { data: quizAttempts, error: quizError } = await db
      .from("quiz_attempts")
      .select("id, is_correct, category");

    // Aggregate statistics
    const allRuns = runs || [];
    const inProgress = allRuns.filter((r) => r.status === "in_progress").length;
    const playerWon = allRuns.filter((r) => r.status === "player_won").length;
    const computerWon = allRuns.filter((r) => r.status === "computer_won").length;
    const playerEliminated = allRuns.filter((r) => r.status === "player_eliminated").length;
    const completed = playerWon + computerWon + playerEliminated;

    const scores = allRuns.map((r) => r.player_score).filter((s) => typeof s === "number");
    const highScore = scores.length > 0 ? Math.max(...scores) : 0;
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const winningDurations = allRuns
      .filter((r) => r.status === "player_won" && r.duration_seconds && r.duration_seconds > 0)
      .map((r) => r.duration_seconds as number);
    const fastestWinSeconds = winningDurations.length > 0 ? Math.min(...winningDurations) : null;
    const avgDurationSeconds =
      winningDurations.length > 0
        ? Math.round(winningDurations.reduce((a, b) => a + b, 0) / winningDurations.length)
        : null;

    const totalQuizzes = quizAttempts ? quizAttempts.length : 0;
    const correctQuizzes = quizAttempts ? quizAttempts.filter((q) => q.is_correct).length : 0;
    const quizAccuracyRate = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

    // Table health check
    const tablesHealth = {
      player_profiles: !playerError,
      game_runs: !runsError,
      leaderboard_entries: !lbError,
      quiz_attempts: !quizError,
    };

    return NextResponse.json({
      summary: {
        totalPlayers: totalPlayers ?? 0,
        totalRuns: allRuns.length,
        inProgress,
        playerWon,
        computerWon,
        playerEliminated,
        completed,
        winRatePercent: completed > 0 ? Math.round((playerWon / completed) * 100) : 0,
        highScore,
        avgScore,
        fastestWinSeconds,
        avgDurationSeconds,
        totalLeaderboard: totalLeaderboard ?? 0,
        totalQuizzes,
        correctQuizzes,
        quizAccuracyRate,
      },
      tablesHealth,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
