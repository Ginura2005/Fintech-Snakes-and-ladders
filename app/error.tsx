"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log unexpected runtime errors for observability
    console.error("Lanka FinTechverse runtime exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#06061f] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#fec01f] selection:text-black">
      {/* Background radial glows */}
      <div className="pointer-events-none absolute w-96 h-96 rounded-full bg-rose-600/10 blur-3xl -top-20" />
      <div className="pointer-events-none absolute w-96 h-96 rounded-full bg-[#fec01f]/10 blur-3xl -bottom-20" />

      <div className="relative max-w-lg w-full festival-card p-6 sm:p-8 border-rose-500/30 text-center space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.15)]">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <span className="section-badge section-badge-rose">
            TELEMETRY DISRUPTION
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Arena Engine Interrupted
          </h1>
          <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            The session encountered an unexpected state. Your game progress is safe on the server.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto h-12 px-6 rounded-xl interactive-btn interactive-btn--primary font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(254,192,31,0.35)]"
          >
            <RotateCcw size={15} />
            <span>Re-initialize Arena</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto h-12 px-6 rounded-xl interactive-btn interactive-btn--outline font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Collapsible Technical Diagnostics */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-mono uppercase tracking-wider text-white/40 hover:text-white/80 transition-colors"
          >
            {showDetails ? "Hide Error Diagnostics ▲" : "Show Error Diagnostics ▼"}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300/90 overflow-x-auto space-y-1">
              <p className="font-bold text-white/90">
                Message: {error.message || "Unknown error occurred"}
              </p>
              {error.digest && (
                <p className="text-white/40 text-[10px]">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
