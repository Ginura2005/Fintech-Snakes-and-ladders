import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limiter";
import {
  getGoogleAvatarUrl,
  getGoogleDisplayName,
  normalizeGoogleAvatarUrl,
} from "@/lib/auth/google-avatar";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/profile
 * Update display name, avatar, and leaderboard opt-in.
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
    const { displayName, leaderboardOptIn, avatarUrl } = body;

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const db = hasServiceKey ? createServiceClient() : supabase;
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

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

    if (avatarUrl !== undefined) {
      if (avatarUrl === null || avatarUrl === "") {
        updates.avatar_url = null;
      } else if (typeof avatarUrl === "string") {
        const isDataUrl = avatarUrl.startsWith("data:image/");
        const isHttpUrl = /^https?:\/\//i.test(avatarUrl);
        if (!isDataUrl && !isHttpUrl) {
          return NextResponse.json(
            { error: "Avatar must be a valid image URL or uploaded photo." },
            { status: 400 }
          );
        }
        // Limit base64 length to ~600KB to preserve DB integrity
        if (avatarUrl.length > 600000) {
          return NextResponse.json(
            { error: "Avatar image is too large. Please upload an image under 500KB." },
            { status: 400 }
          );
        }
        updates.avatar_url = avatarUrl;
      }
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
 * Retrieves player profile, Google auth metadata, and arena statistics.
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

    // 1. Fetch profile
    let { data: profile } = await db
      .from("player_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const googleName = getGoogleDisplayName(user);
    let googleAvatar = getGoogleAvatarUrl(user);

    // If profile didn't exist yet, lazily create it
    if (!profile) {
      const defaultName = sanitizeDisplayName(googleName || user.email?.split("@")[0] || "Player") || "Festival Player";
      const { data: newProfile } = await db
        .from("player_profiles")
        .insert({
          id: user.id,
          display_name: defaultName,
          avatar_url: googleAvatar,
          leaderboard_opt_in: false,
        })
        .select()
        .single();
      profile = newProfile;
    } else if ((!profile.avatar_url || profile.avatar_url === "") && googleAvatar) {
      // Backfill Google photo for GIS logins that skipped /auth/callback
      const { data: synced } = await db
        .from("player_profiles")
        .update({
          avatar_url: googleAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();
      if (synced) profile = synced;
    }

    // Fall back to a stored googleusercontent URL when auth metadata omits picture
    if (
      !googleAvatar &&
      typeof profile?.avatar_url === "string" &&
      profile.avatar_url.includes("googleusercontent.com")
    ) {
      googleAvatar = normalizeGoogleAvatarUrl(profile.avatar_url);
    }

    // 2. Fetch career stats
    const { data: runs } = await db
      .from("game_runs")
      .select("player_score, status, completed_at")
      .eq("player_id", user.id);

    const highScore = runs?.reduce((max, r) => Math.max(max, r.player_score || 0), 0) ?? 0;
    const totalRuns = runs?.length ?? 0;
    const wins = runs?.filter((r) => r.status === "player_won").length ?? 0;

    let rank: number | null = null;
    if (profile?.leaderboard_opt_in && highScore > 0) {
      const { count } = await db
        .from("leaderboard_entries")
        .select("id", { count: "exact" })
        .gt("final_score", highScore);
      rank = (count ?? 0) + 1;
    }

    return NextResponse.json({
      profile: {
        ...profile,
        google_avatar_url: googleAvatar,
        google_name: googleName,
        email: user.email,
        provider: user.app_metadata?.provider || "google",
      },
      stats: {
        highScore,
        totalRuns,
        wins,
        rank,
      },
    });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function sanitizeDisplayName(name: string): string | null {
  if (typeof name !== "string") return null;
  const stripped = name.replace(/[<>\\\/]/g, "").trim().replace(/\s+/g, " ");
  if (stripped.length < 2 || stripped.length > 24) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 _\-'.]*$/.test(stripped)) return null;
  return stripped;
}
