import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/retry
 * Allows an authenticated player to restart / retry their game run:
 * - If they lost (computer won or eliminated), they can retry until they win.
 * - If they completed a run but choose NOT to post it to the leaderboard,
 *   they can discard and play again to try for a higher score.
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

    // Rate Limiting: Max 8 retries per 60s
    const rateLimit = await checkRateLimit(`retry:${user.id}`, {
      limit: 8,
      windowSeconds: 60,
    });
    if (!rateLimit.success) {
      return createRateLimitResponse(
        rateLimit,
        "Too many match retries. Please wait a few seconds before restarting."
      );
    }

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const db = hasServiceKey ? createServiceClient() : supabase;

    // Check if body requested keeping previous official leaderboard entry
    const body = await request.json().catch(() => ({}));
    const { keepLeaderboard } = body;

    // 1. If not keeping leaderboard, remove any existing leaderboard entry
    if (!keepLeaderboard) {
      await db
        .from("leaderboard_entries")
        .delete()
        .eq("player_id", user.id);
    }

    // 2. Delete the active game run so a fresh one can be started
    // (Cascades to game_moves, score_ledger, quiz_attempts)
    const { error: deleteError } = await db
      .from("game_runs")
      .delete()
      .eq("player_id", user.id);

    if (deleteError) {
      console.error("Failed to delete game run for retry:", deleteError);
      return NextResponse.json(
        { error: deleteError.message || "Failed to reset game run" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Game run reset successfully. You can now start a fresh run.",
    });
  } catch (err) {
    console.error("Game retry error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
