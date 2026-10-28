import { SupabaseClient } from "@supabase/supabase-js";

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

const DEFAULT_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "952048375622-dt322h6v6moj1r84504c19962vne8965.apps.googleusercontent.com";

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
  const next = options?.nextUrl || "/game";
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
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
      });

      if (error) throw error;

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
