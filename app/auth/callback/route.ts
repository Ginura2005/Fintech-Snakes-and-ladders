import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

/**
 * GET /auth/callback
 * Handles OAuth redirect from Supabase/Google.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/game";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  let redirectTarget = `${origin}${next}`;
  if (!isLocalEnv && forwardedHost) {
    redirectTarget = `https://${forwardedHost}${next}`;
  }

  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(redirectTarget);

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://vqzyogpdecdqithvnarg.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_s5SduLYiklyi0zbHAY9qdA_DSv7ZOK2";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server component compatibility
            }
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Supabase auth code exchange error:", error);
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent(error.message || "auth_failed")}`
      );
    }

    if (data?.user) {
      // Auto-create or verify profile
      try {
        const { data: existing } = await supabase
          .from("player_profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existing) {
          const rawName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Player";

          const displayName = sanitizeNewName(rawName);

          await supabase.from("player_profiles").insert({
            id: data.user.id,
            display_name: displayName,
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
            leaderboard_opt_in: false,
          });
        }
      } catch (profileErr) {
        console.warn("Profile creation warning (non-fatal):", profileErr);
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}

function sanitizeNewName(raw: string): string {
  const trimmed = raw
    .trim()
    .replace(/[^a-zA-Z0-9 _\-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 30);
  if (trimmed.length < 2) return "Player";
  return trimmed;
}
