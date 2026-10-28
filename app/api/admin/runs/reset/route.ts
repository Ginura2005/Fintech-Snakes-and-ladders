import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/runs/reset
 * Resets a player's official attempt so they can play again.
 * Essential for festival operations (device crashes, booth resets, support tickets).
 */
export async function POST(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { playerId, runId } = body;

    if (!playerId && !runId) {
      return NextResponse.json(
        { error: "Must specify either playerId or runId to reset" },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    // 1. Locate the run to determine player_id and run_id
    let targetPlayerId = playerId;
    let targetRunId = runId;

    if (runId && !playerId) {
      const { data: run } = await db
        .from("game_runs")
        .select("id, player_id")
        .eq("id", runId)
        .maybeSingle();

      if (run) {
        targetPlayerId = run.player_id;
        targetRunId = run.id;
      }
    }

    // 2. Clean up any leaderboard entry for this run or player
    if (targetPlayerId) {
      await db.from("leaderboard_entries").delete().eq("player_id", targetPlayerId);
    }
    if (targetRunId) {
      await db.from("leaderboard_entries").delete().eq("run_id", targetRunId);
    }

    // 3. Delete the game run (PostgreSQL foreign keys CASCADE to moves, score_ledger, quiz_attempts)
    let deleteQuery = db.from("game_runs").delete();
    if (targetPlayerId) {
      deleteQuery = deleteQuery.eq("player_id", targetPlayerId);
    } else {
      deleteQuery = deleteQuery.eq("id", targetRunId);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error("Reset run error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Player attempt reset successfully. The player can now begin a fresh run.`,
      targetPlayerId,
      targetRunId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reset player run" },
      { status: 500 }
    );
  }
}
