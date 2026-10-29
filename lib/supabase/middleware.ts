import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isPracticeGameRequest(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/game" || pathname === "/game/result") {
    return searchParams.get("mode") === "practice";
  }
  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://vqzyogpdecdqithvnarg.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_s5SduLYiklyi0zbHAY9qdA_DSv7ZOK2";

  if (!url || !anonKey) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isProtectedPath =
      (pathname.startsWith("/game") ||
        (pathname.startsWith("/api/game") && pathname !== "/api/game/state")) &&
      !isPracticeGameRequest(request);

    if (isProtectedPath && !user) {
      // Send users home with a safe return path — UI opens a sign-in modal.
      const redirectUrl = request.nextUrl.clone();
      const intended =
        `${pathname}${request.nextUrl.search}` || "/game";
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("next", intended);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (e) {
    console.error("Middleware session error:", e);
  }

  return supabaseResponse;
}
