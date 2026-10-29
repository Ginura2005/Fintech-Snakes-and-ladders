"use client";

import { useState, useEffect } from "react";
import { Megaphone, X, Radio, AlertTriangle } from "lucide-react";

export default function FestivalBroadcastBanner() {
  const [banner, setBanner] = useState<{
    enabled: boolean;
    message: string;
    type: "info" | "warning" | "celebration" | "urgent";
  } | null>(null);

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/festival/banner");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.announcement?.enabled) {
            setBanner(data.announcement);
          } else if (isMounted) {
            setBanner(null);
          }
        }
      } catch {
        // ignore network error
      }
    };

    fetchBanner();
    const interval = setInterval(fetchBanner, 30000); // 30s background poll

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!banner || !banner.enabled || dismissed) return null;

  const styleMap = {
    info: "bg-teal-950/80 border-teal-500/40 text-teal-200",
    warning: "bg-amber-950/80 border-amber-500/40 text-amber-200",
    celebration: "bg-[#fec01f]/15 border-[#fec01f]/50 text-[#fec01f]",
    urgent: "bg-rose-950/80 border-rose-500/40 text-rose-200",
  };

  return (
    <div
      role="alert"
      className={`relative z-40 border-b py-2 px-4 text-xs font-mono backdrop-blur-md transition-all shadow-md ${
        styleMap[banner.type] || styleMap.info
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="p-1 rounded bg-white/10 shrink-0">
            <Radio size={13} className="animate-pulse" />
          </span>
          <span className="font-bold uppercase tracking-wider text-[11px] shrink-0">
            Official Broadcast:
          </span>
          <p className="truncate text-white font-sans">{banner.message}</p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
