import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // If Supabase is not configured yet, allow navigation so app is inspectable
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect /game and /api/game routes for authenticated users
    const isProtectedPath =
      request.nextUrl.pathname.startsWith("/game") ||
      (request.nextUrl.pathname.startsWith("/api/game") &&
        request.nextUrl.pathname !== "/api/game/state");

    if (isProtectedPath && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("signin", "required");
      return NextResponse.redirect(redirectUrl);
    }
  } catch (e) {
    console.error("Middleware session error:", e);
  }

  return supabaseResponse;
}
