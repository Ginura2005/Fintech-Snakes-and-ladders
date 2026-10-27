import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/share/card?runId=...
 * Returns metadata for generating a shareable result card.
 * Returns only public-safe information.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const serviceClient = createServiceClient();
    const supabase = await createClient();
    const db = hasServiceKey ? serviceClient : supabase;

    let runId: string | null = null;

    if (token) {
      // Challenge link
      const { data: link } = await db
        .from("challenge_links")
        .select("run_id")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!link) {
        return NextResponse.json({ error: "Link not found or expired" }, { status: 404 });
      }
      runId = link.run_id;
    } else {
      // Authenticated user's own card
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: run } = await db
        .from("game_runs")
        .select("id")
        .eq("player_id", user.id)
        .maybeSingle();

      if (!run) {
        return NextResponse.json({ error: "No run found" }, { status: 404 });
      }
      runId = run.id;
    }

    // Fetch run + profile
    const { data: run } = await db
      .from("game_runs")
      .select(
        `id, status, player_score, player_won, player_quiz_correct, player_hearts,
         player_treasures_collected, started_at, completed_at, duration_seconds,
         player_profiles!inner(display_name, leaderboard_opt_in)`
      )
      .eq("id", runId)
      .single();

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const profile = (run as any).player_profiles;

    // Only include display name if opted in OR it's the player's own request
    const displayName = profile?.leaderboard_opt_in
      ? profile.display_name
      : "Anonymous Player";

    // Fetch leaderboard rank if opted in
    let rank: number | null = null;
    if (profile?.leaderboard_opt_in) {
      const { data: leaderboardEntry } = await db
        .from("leaderboard_entries")
        .select("id")
        .eq("run_id", runId)
        .maybeSingle();

      if (leaderboardEntry) {
        const { count } = await db
          .from("leaderboard_entries")
          .select("id", { count: "exact" })
          .gt("final_score", run.player_score);
        rank = (count ?? 0) + 1;
      }
    }

    return NextResponse.json({
      displayName,
      finalScore: run.player_score,
      status: run.status,
      playerWon: run.status === "player_won",
      quizCorrect: run.player_quiz_correct,
      heartsRemaining: run.player_hearts,
      treasuresCollected: (run.player_treasures_collected as number[] || []).length,
      durationSeconds: run.duration_seconds,
      rank,
      festivalDates: "2–3 November 2026",
    });
  } catch (err) {
    console.error("Card error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
