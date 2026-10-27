import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/game/state
 * Returns the authoritative game state for the authenticated player.
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

    const serviceClient = createServiceClient();

    const { data: run, error } = await serviceClient
      .from("game_runs")
      .select("*")
      .eq("player_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Fetch state error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!run) {
      return NextResponse.json({ run: null });
    }

    // Fetch player profile
    const { data: profile } = await serviceClient
      .from("player_profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ run, profile });
  } catch (err) {
    console.error("State error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
