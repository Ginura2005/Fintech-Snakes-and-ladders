import { SupabaseClient } from "@supabase/supabase-js";
import { getSafeNextPath } from "@/lib/auth/safe-next-path";
import {
  decodeGoogleIdTokenPicture,
  getGoogleAvatarUrl,
  normalizeGoogleAvatarUrl,
} from "@/lib/auth/google-avatar";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: "signin" | "signup" | "use";
          }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
            }
          ) => void;
        };
      };
    };
  }
}

const DEFAULT_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface SignInOptions {
  nextUrl?: string;
  onError?: (err: Error) => void;
}

/**
 * Initiates Google Sign-In:
 * 1. Attempts modern Google Identity Services (One-Tap / popup) which displays
 *    "Fintech Verse" and "to continue to verse.fintechfestival.lk" directly on your domain.
 * 2. Seamlessly falls back to Supabase OAuth redirect if One-Tap is suppressed or unsupported.
 */
export async function signInWithGoogle(
  supabase: SupabaseClient,
  options?: SignInOptions
): Promise<void> {
  const next = getSafeNextPath(options?.nextUrl, "/game");
  const origin = typeof window !== "undefined" ? window.location.origin : "https://verse.fintechfestival.lk";

  // Try Google Identity Services (GIS) on-domain sign-in
  if (
    typeof window !== "undefined" &&
    window.google?.accounts?.id &&
    DEFAULT_CLIENT_ID
  ) {
    try {
      const tokenPromise = new Promise<string>((resolve, reject) => {
        let isResolved = false;

        window.google!.accounts.id.initialize({
          client_id: DEFAULT_CLIENT_ID,
          context: "signin",
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (response.credential) {
              isResolved = true;
              resolve(response.credential);
            } else {
              reject(new Error("No Google credential returned"));
            }
          },
        });

        window.google!.accounts.id.prompt((notification) => {
          if (!isResolved && (notification.isNotDisplayed() || notification.isSkippedMoment())) {
            // One-Tap could not be shown (e.g. dismissed previously, 3rd party cookies disabled)
            // Fall back to standard OAuth redirect
            reject(new Error("GIS_PROMPT_UNAVAILABLE"));
          }
        });
      });

      const credential = await tokenPromise;
      const jwtPicture = decodeGoogleIdTokenPicture(credential);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
      });

      if (error) throw error;

      // Ensure player_profiles picks up Google photo (GIS skips /auth/callback)
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
        });
        const json = (await res.json().catch(() => null)) as {
          profile?: { avatar_url?: string | null; google_avatar_url?: string | null };
        } | null;

        const stored = json?.profile?.avatar_url;
        const avatarUrl =
          json?.profile?.google_avatar_url ||
          getGoogleAvatarUrl(data.user) ||
          (jwtPicture ? normalizeGoogleAvatarUrl(jwtPicture) : null);

        // Only fill empty profiles — never overwrite custom uploads
        if (avatarUrl && (!stored || stored === "")) {
          await fetch("/api/profile", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatarUrl }),
          });
        }
      } catch {
        // Non-fatal — profile page / game start will backfill later
      }

      if (typeof window !== "undefined") {
        window.location.href = next;
      }
      return;
    } catch (gisError: any) {
      // If GIS prompt was unavailable or failed, smoothly fallback to standard OAuth flow
      if (gisError?.message !== "GIS_PROMPT_UNAVAILABLE") {
        console.warn("GIS login skipped, falling back to OAuth redirect:", gisError);
      }
    }
  }

  // Standard Supabase OAuth redirect fallback
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    options?.onError?.(error);
    throw error;
  }
}
