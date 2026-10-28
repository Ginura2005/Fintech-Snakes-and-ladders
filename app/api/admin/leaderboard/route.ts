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
  const format = searchParams.get("format");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

  const db = createServiceClient();

  try {
    const { data, error } = await db
      .from("leaderboard_entries")
      .select(
        `
        id,
        run_id,
        player_id,
        display_name,
        final_score,
        player_won,
        quiz_correct,
        hearts_remaining,
        duration_seconds,
        created_at,
        player_profiles!inner(leaderboard_opt_in, avatar_url)
      `
      )
      .order("final_score", { ascending: false })
      .order("player_won", { ascending: false })
      .order("quiz_correct", { ascending: false })
      .order("hearts_remaining", { ascending: false })
      .order("duration_seconds", { ascending: true, nullsFirst: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = (data || []).map((e: any, idx: number) => {
      const isSuspicious =
        (e.duration_seconds && e.duration_seconds < 10) ||
        (e.final_score > 600) ||
        (e.player_won && e.duration_seconds && e.duration_seconds < 15);

      return {
        rank: idx + 1,
        id: e.id,
        runId: e.run_id,
        playerId: e.player_id,
        displayName: e.display_name,
        finalScore: e.final_score,
        playerWon: e.player_won,
        quizCorrect: e.quiz_correct,
        heartsRemaining: e.hearts_remaining,
        durationSeconds: e.duration_seconds,
        optedIn: e.player_profiles?.leaderboard_opt_in ?? false,
        avatarUrl: e.player_profiles?.avatar_url,
        createdAt: e.created_at,
        anomalyFlags: isSuspicious
          ? [
              ...(e.duration_seconds && e.duration_seconds < 15
                ? ["Improbably fast duration"]
                : []),
              ...(e.final_score > 600 ? ["Anomalously high score"] : []),
            ]
          : [],
      };
    });

    // If CSV format requested, generate and return CSV text for festival ticket distribution
    if (format === "csv") {
      const headers = [
        "Rank",
        "Display Name",
        "Final Score",
        "Outcome",
        "Quiz Correct",
        "Hearts Remaining",
        "Duration (sec)",
        "Opted In",
        "Submission Time",
        "Player ID",
        "Run ID",
      ];

      const csvRows = entries.map((r) => [
        r.rank,
        `"${r.displayName.replace(/"/g, '""')}"`,
        r.finalScore,
        r.playerWon ? "Won" : "Finished",
        r.quizCorrect,
        r.heartsRemaining,
        r.durationSeconds ?? "N/A",
        r.optedIn ? "YES" : "NO",
        `"${r.createdAt}"`,
        r.playerId,
        r.runId,
      ]);

      const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="fintechverse_festival_leaderboard_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ entries, total: entries.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/leaderboard
 * Moderation action: Disqualify or toggle player leaderboard visibility.
 */
export async function POST(request: NextRequest) {
  const { isAdmin } = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized: Administrator privileges required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { playerId, action } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    const db = createServiceClient();

    if (action === "opt_out" || action === "disqualify") {
      // Toggle leaderboard_opt_in to false
      const { error } = await db
        .from("player_profiles")
        .update({ leaderboard_opt_in: false })
        .eq("id", playerId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Player disqualified / excluded from public leaderboard",
      });
    } else if (action === "opt_in") {
      const { error } = await db
        .from("player_profiles")
        .update({ leaderboard_opt_in: true })
        .eq("id", playerId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Player reinstated on public leaderboard",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Moderation action failed" },
      { status: 500 }
    );
  }
}
