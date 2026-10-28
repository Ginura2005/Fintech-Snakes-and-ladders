import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  const { id: runId } = await params;
  if (!runId) {
    return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  }

  const db = createServiceClient();

  try {
    // 1. Fetch run details with player profile
    const { data: run, error: runError } = await db
      .from("game_runs")
      .select(
        `
        *,
        player_profiles!inner(display_name, avatar_url, leaderboard_opt_in, created_at)
      `
      )
      .eq("id", runId)
      .maybeSingle();

    if (runError) {
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // 2. Fetch all game moves for this run
    const { data: moves } = await db
      .from("game_moves")
      .select("*")
      .eq("run_id", runId)
      .order("turn_sequence", { ascending: true });

    // 3. Fetch score ledger entries
    const { data: ledger } = await db
      .from("score_ledger")
      .select("*")
      .eq("run_id", runId)
      .order("turn_sequence", { ascending: true });

    // 4. Fetch quiz attempts
    const { data: quizAttempts } = await db
      .from("quiz_attempts")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      run,
      moves: moves || [],
      ledger: ledger || [],
      quizAttempts: quizAttempts || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch run details" },
      { status: 500 }
    );
  }
}
