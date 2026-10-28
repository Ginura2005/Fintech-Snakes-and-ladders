import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const db = createServiceClient();

  try {
    let query = db
      .from("game_runs")
      .select(
        `
        id,
        player_id,
        status,
        current_turn,
        turn_sequence,
        player_position,
        computer_position,
        player_hearts,
        computer_hearts,
        player_shields,
        computer_shields,
        player_score,
        computer_score,
        player_quiz_correct,
        player_treasures_collected,
        board_seed,
        started_at,
        completed_at,
        duration_seconds,
        player_profiles!inner(display_name, avatar_url, leaderboard_opt_in)
      `,
        { count: "exact" }
      )
      .order("started_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search && search.trim().length > 0) {
      // Filter by display_name or run id
      const searchTerm = search.trim();
      query = query.ilike("player_profiles.display_name", `%${searchTerm}%`);
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Admin runs fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const runs = (data || []).map((r: any) => ({
      id: r.id,
      playerId: r.player_id,
      displayName: r.player_profiles?.display_name || "Unknown",
      avatarUrl: r.player_profiles?.avatar_url,
      leaderboardOptIn: r.player_profiles?.leaderboard_opt_in,
      status: r.status,
      currentTurn: r.current_turn,
      turnSequence: r.turn_sequence,
      playerPosition: r.player_position,
      computerPosition: r.computer_position,
      playerHearts: r.player_hearts,
      computerHearts: r.computer_hearts,
      playerShields: r.player_shields,
      computerShields: r.computer_shields,
      playerScore: r.player_score,
      computerScore: r.computer_score,
      playerQuizCorrect: r.player_quiz_correct,
      treasuresCount: Array.isArray(r.player_treasures_collected)
        ? r.player_treasures_collected.length
        : 0,
      boardSeed: r.board_seed,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      durationSeconds: r.duration_seconds,
    }));

    return NextResponse.json({
      runs,
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load runs" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("runId");

    if (!runId) {
      return NextResponse.json({ error: "Missing runId parameter" }, { status: 400 });
    }

    const db = createServiceClient();
    const { error } = await db.from("game_runs").delete().eq("id", runId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Run ${runId} deleted successfully` });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete run" },
      { status: 500 }
    );
  }
}
