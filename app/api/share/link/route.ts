import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * POST /api/share/link
 * Generate a safe challenge link for the player's completed run.
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

    // Rate Limiting: Max 15 challenge link creations per 60s
    const rateLimit = await checkRateLimit(`share-link:${user.id}`, {
      limit: 15,
      windowSeconds: 60,
    });
    if (!rateLimit.success) {
      return createRateLimitResponse(
        rateLimit,
        "Too many share links created. Please wait a moment."
      );
    }

    const hasServiceKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const db = hasServiceKey ? createServiceClient() : supabase;

    // Fetch the player's run
    const { data: run, error: runError } = await db
      .from("game_runs")
      .select("id, status, player_score, player_won, player_quiz_correct")
      .eq("player_id", user.id)
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: "No run found" }, { status: 404 });
    }

    // Check if a challenge link already exists
    const { data: existing } = await db
      .from("challenge_links")
      .select("token")
      .eq("run_id", run.id)
      .maybeSingle();

    if (existing) {
      const origin = new URL(request.url).origin;
      return NextResponse.json({
        token: existing.token,
        url: `${origin}/challenge/${existing.token}`,
      });
    }

    // Generate a new token
    const token = generateToken();
    const { error: insertError } = await db
      .from("challenge_links")
      .insert({
        token,
        run_id: run.id,
      });

    if (insertError) {
      console.error("Link insert error:", insertError);
      return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      token,
      url: `${origin}/challenge/${token}`,
    });
  } catch (err) {
    console.error("Share link error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateToken(): string {
  const array = new Uint8Array(18);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}
