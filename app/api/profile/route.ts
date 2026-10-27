import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/profile
 * Update display name and leaderboard opt-in.
 */
export async function PATCH(request: NextRequest) {
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
    const { displayName, leaderboardOptIn } = body;

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const db = hasServiceKey ? createServiceClient() : supabase;
    const updates: Record<string, unknown> = {};

    if (typeof displayName === "string") {
      const sanitized = sanitizeDisplayName(displayName);
      if (!sanitized) {
        return NextResponse.json(
          { error: "Display name must be 2–24 characters and contain only letters, numbers, and basic punctuation." },
          { status: 400 }
        );
      }
      updates.display_name = sanitized;
    }

    if (typeof leaderboardOptIn === "boolean") {
      updates.leaderboard_opt_in = leaderboardOptIn;

      // If opting out, remove leaderboard entry
      if (!leaderboardOptIn) {
        await db
          .from("leaderboard_entries")
          .delete()
          .eq("player_id", user.id);
      } else {
        // If opting in and game is complete, create/update leaderboard entry
        const { data: run } = await db
          .from("game_runs")
          .select("*")
          .eq("player_id", user.id)
          .maybeSingle();

        const { data: profile } = await db
          .from("player_profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        if (
          run &&
          profile &&
          (run.status === "player_won" ||
            run.status === "computer_won" ||
            run.status === "player_eliminated")
        ) {
          await db.from("leaderboard_entries").upsert(
            {
              run_id: run.id,
              player_id: user.id,
              display_name: updates.display_name || profile.display_name,
              final_score: run.player_score,
              player_won: run.status === "player_won",
              quiz_correct: run.player_quiz_correct,
              hearts_remaining: run.player_hearts,
              duration_seconds: run.duration_seconds,
            },
            { onConflict: "player_id" }
          );
        }
      }
    }

    const { data: updatedProfile, error: updateError } = await db
      .from("player_profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/profile
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const db = hasServiceKey ? createServiceClient() : supabase;
    const { data: profile, error } = await db
      .from("player_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function sanitizeDisplayName(name: string): string | null {
  if (typeof name !== "string") return null;
  // Strip control chars and HTML angle brackets
  const stripped = name.replace(/[<>\\\/]/g, "").trim().replace(/\s+/g, " ");
  if (stripped.length < 2 || stripped.length > 24) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 _\-'.]*$/.test(stripped)) return null;
  return stripped;
}
