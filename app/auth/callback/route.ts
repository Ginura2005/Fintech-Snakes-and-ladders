import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /auth/callback
 * Handles OAuth redirect from Supabase/Google.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/game";

  if (code) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Auto-create profile if it doesn't exist
      const serviceClient = createServiceClient();
      const { data: existing } = await serviceClient
        .from("player_profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existing) {
        // Generate display name from Google name or email prefix
        const rawName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "Player";

        const displayName = sanitizeNewName(rawName);

        await serviceClient.from("player_profiles").insert({
          id: data.user.id,
          display_name: displayName,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          leaderboard_opt_in: false,
        });
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}

function sanitizeNewName(raw: string): string {
  const trimmed = raw.trim().replace(/[^a-zA-Z0-9 _\-]/g, "").replace(/\s+/g, " ").slice(0, 30);
  if (trimmed.length < 2) return "Player";
  return trimmed;
}
