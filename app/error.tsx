"use client";

import { useEffect, useState } from "react";
import FestivalButton from "@/components/ui/FestivalButton";
import SectionBadge from "@/components/ui/SectionBadge";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Lanka FinTechverse runtime exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-primary selection:text-black">
      <div className="relative max-w-lg w-full festival-card p-6 sm:p-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-xl bg-brand-burgundy/20 border-2 border-brand-rose/40 text-brand-rose flex items-center justify-center mx-auto">
          <AlertTriangle size={28} aria-hidden />
        </div>

        <div className="space-y-2">
          <SectionBadge variant="rose">Something went wrong</SectionBadge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Session Interrupted
          </h1>
          <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            An unexpected error occurred. Your game progress is saved on the server when available.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <FestivalButton
            onClick={() => reset()}
            className="w-full sm:w-auto text-xs uppercase tracking-wider"
          >
            <RotateCcw size={15} aria-hidden />
            Try again
          </FestivalButton>

          <FestivalButton
            href="/"
            variant="outline"
            className="w-full sm:w-auto text-xs uppercase tracking-wider"
          >
            <ArrowLeft size={15} aria-hidden />
            Return home
          </FestivalButton>
        </div>

        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-mono uppercase tracking-wider text-white/40 hover:text-white/80 transition-colors"
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-brand-rose/90 overflow-x-auto space-y-1">
              <p className="font-bold text-white/90">
                Message: {error.message || "Unknown error occurred"}
              </p>
              {error.digest && (
                <p className="text-white/40 text-[10px]">Digest: {error.digest}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
