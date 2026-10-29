"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import FestivalButton from "@/components/ui/FestivalButton";
import SectionBadge from "@/components/ui/SectionBadge";
import { Lock, X, Play } from "lucide-react";

type SignInRequiredModalProps = {
  open: boolean;
  nextUrl: string;
  onClose: () => void;
};

export default function SignInRequiredModal({
  open,
  nextUrl,
  onClose,
}: SignInRequiredModalProps) {
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !signingIn) onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, signingIn]);

  if (!open) return null;

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle(supabase, {
        nextUrl,
        onError: (err) => {
          setError(err.message);
          setSigningIn(false);
        },
      });
      // OAuth redirect leaves the page; GIS path navigates via window.location
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setError(message);
      setSigningIn(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss sign-in dialog"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => {
          if (!signingIn) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full sm:max-w-md festival-panel border-[3px] border-black bg-surface-container shadow-[0_24px_60px_rgba(0,0,0,0.65)] animate-slide-up rounded-t-2xl sm:rounded-xl overflow-hidden pb-safe"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <SectionBadge variant="primary">Sign in required</SectionBadge>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            disabled={signingIn}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 hover:text-white hover:border-primary transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-center">
          <div className="mx-auto relative h-10 w-44">
            <Image
              src="/long-logo-removebg-preview.png"
              alt="Sri Lanka FinTech Festival"
              fill
              className="object-contain"
            />
          </div>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border-2 border-primary/50 bg-primary/10 text-primary">
            <Lock size={26} aria-hidden />
          </div>

          <div className="space-y-2">
            <h2
              id={titleId}
              className="font-heading text-xl sm:text-2xl font-extrabold text-white"
            >
              Sign in to continue
            </h2>
            <p id={descId} className="text-sm text-white/70 leading-relaxed">
              Official tournament play needs a Google account so we can save your
              run and show you on the leaderboard. After you sign in, you&apos;ll
              return to where you left off.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-left text-xs font-mono text-red-300"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <FestivalButton
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full text-sm disabled:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{signingIn ? "Connecting…" : "Continue with Google"}</span>
            </FestivalButton>

            <FestivalButton
              href="/game?mode=practice"
              variant="outline"
              className="w-full text-sm"
            >
              <Play size={16} className="fill-current" aria-hidden />
              <span>Try Practice Mode instead</span>
            </FestivalButton>
          </div>

          <p className="text-[11px] font-mono text-white/45 leading-relaxed">
            After signing in you&apos;ll go to{" "}
            <span className="text-primary break-all">{nextUrl}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
