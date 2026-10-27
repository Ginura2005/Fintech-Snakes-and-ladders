import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createInitialGameState } from "@/lib/game-engine/engine";
import { BOARD_CONFIG } from "@/lib/game-engine/board-config";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/start
 * Start or retrieve the player's official game run.
 * Idempotent: returns existing run if one exists.
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

    const body = await request.json().catch(() => ({}));
    const { displayName, leaderboardOptIn } = body;

    const serviceClient = createServiceClient();

    // 1. Upsert player profile
    if (displayName) {
      const sanitized = sanitizeDisplayName(displayName);
      if (!sanitized) {
        return NextResponse.json(
          { error: "Invalid display name" },
          { status: 400 }
        );
      }

      const { error: profileError } = await serviceClient
        .from("player_profiles")
        .upsert(
          {
            id: user.id,
            display_name: sanitized,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            leaderboard_opt_in: leaderboardOptIn ?? false,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error("Profile upsert error:", profileError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }
    }

    // 2. Check for existing run (UNIQUE constraint enforces one run per player)
    const { data: existingRun, error: fetchError } = await serviceClient
      .from("game_runs")
      .select("*")
      .eq("player_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch run error:", fetchError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (existingRun) {
      // Return existing run
      return NextResponse.json({ run: existingRun, isNew: false });
    }

    // 3. Create new run
    const newState = createInitialGameState(
      crypto.randomUUID(),
      user.id
    );

    const { data: newRun, error: insertError } = await serviceClient
      .from("game_runs")
      .insert({
        id: newState.id,
        player_id: user.id,
        config_version: BOARD_CONFIG.version,
        status: "in_progress",
        current_turn: "player",
        turn_sequence: 0,
        player_position: 1,
        computer_position: 1,
        player_hearts: BOARD_CONFIG.startHearts,
        computer_hearts: BOARD_CONFIG.startHearts,
        player_shields: 0,
        computer_shields: 0,
        player_score: 0,
        computer_score: 0,
        player_quiz_correct: 0,
        player_treasures_collected: [],
        computer_treasures_collected: [],
        player_quiz_encountered: [],
      })
      .select()
      .single();

    if (insertError) {
      // Handle race condition: another request already inserted
      if (insertError.code === "23505") {
        const { data: raceRun } = await serviceClient
          .from("game_runs")
          .select("*")
          .eq("player_id", user.id)
          .single();
        return NextResponse.json({ run: raceRun, isNew: false });
      }
      console.error("Insert run error:", insertError);
      return NextResponse.json(
        { error: "Failed to create run" },
        { status: 500 }
      );
    }

    return NextResponse.json({ run: newRun, isNew: true });
  } catch (err) {
    console.error("Start game error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function sanitizeDisplayName(name: string): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length < 2 || trimmed.length > 30) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 _\-]*$/.test(trimmed)) return null;
  return trimmed;
}
