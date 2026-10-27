import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard
 * Returns public leaderboard (only opted-in players).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const serviceClient = createServiceClient();

    const { data, error, count } = await serviceClient
      .from("leaderboard_entries")
      .select(
        `
        id,
        display_name,
        final_score,
        player_won,
        quiz_correct,
        hearts_remaining,
        duration_seconds,
        created_at,
        player_profiles!inner(leaderboard_opt_in)
      `,
        { count: "exact" }
      )
      .eq("player_profiles.leaderboard_opt_in", true)
      .order("final_score", { ascending: false })
      .order("player_won", { ascending: false })
      .order("quiz_correct", { ascending: false })
      .order("hearts_remaining", { ascending: false })
      .order("duration_seconds", { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Leaderboard error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Compute ranks
    const entries = (data || []).map((entry: any, index: number) => ({
      rank: offset + index + 1,
      displayName: entry.display_name,
      finalScore: entry.final_score,
      playerWon: entry.player_won,
      quizCorrect: entry.quiz_correct,
      heartsRemaining: entry.hearts_remaining,
      durationSeconds: entry.duration_seconds,
      createdAt: entry.created_at,
    }));

    return NextResponse.json({ entries, total: count ?? 0 });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
