"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06061f] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0a0a28] border border-rose-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              Critical Arena Exception
            </h1>
            <p className="text-sm text-white/70">
              The application encountered a critical runtime error. Please reload the arena console.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full h-12 rounded-xl bg-[#fec01f] text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-[#e5ac1b] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
