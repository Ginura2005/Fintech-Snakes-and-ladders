"use client";

import { useState, useEffect } from "react";
import { Ticket, Clock, Award, Sparkles } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isClosed: boolean;
}

// Deadline: October 31, 2026 at 23:59:59 Sri Lanka Time (UTC+05:30)
const TOURNAMENT_DEADLINE = new Date("2026-10-31T23:59:59+05:30").getTime();

interface TournamentCountdownProps {
  compact?: boolean;
}

export default function TournamentCountdown({ compact = false }: TournamentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTime = () => {
      const now = Date.now();
      const diff = TOURNAMENT_DEADLINE - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isClosed: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isClosed: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-2xl mx-auto my-6 p-4 rounded-2xl bg-[#090924]/80 border border-white/10 animate-pulse h-28" />
    );
  }

  if (compact) {
    return (
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#0a0a28] to-teal-950/40 border border-[#fec01f]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-white">
          <Ticket size={16} className="text-[#fec01f] shrink-0" />
          <span>
            <strong className="text-[#fec01f]">Prize:</strong> 10,000 LKR Festival Ticket to Top Winners!
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white/90 font-bold shrink-0">
          <Clock size={13} className="text-[#fec01f]" />
          <span>
            {timeLeft.isClosed
              ? "Tournament Concluded"
              : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s left`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6 sm:my-8 overflow-hidden rounded-2xl border-2 border-[#fec01f]/40 bg-gradient-to-b from-[#0c0c32] via-[#090924] to-[#06061f] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#fec01f]/15 blur-3xl" />

      {/* Prize Banner Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-4 border-b border-white/10 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#fec01f]/15 text-[#fec01f] border border-[#fec01f]/30 shadow-[0_0_12px_rgba(254,192,31,0.3)]">
            <Ticket size={18} />
          </span>
          <div>
            <p className="font-heading font-extrabold text-sm sm:text-base text-white">
              Grand Prize: 10,000 LKR Festival Ticket
            </p>
            <p className="text-xs text-white/60">
              Official entry to the Sri Lanka FinTech Festival 2026 awarded to top leaderboard winners!
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#fec01f]/10 border border-[#fec01f]/40 text-[#fec01f] text-[11px] font-mono font-bold whitespace-nowrap">
          CLOSES OCT 31ST
        </span>
      </div>

      {/* Countdown Digits */}
      <div className="relative z-10 pt-4">
        {timeLeft.isClosed ? (
          <div className="text-center py-2">
            <p className="font-heading text-lg font-bold text-[#fec01f]">
              Arena Closed on October 31st
            </p>
            <p className="text-xs text-white/60 mt-1 font-mono">
              Final verification in progress. Top winners will be contacted for their 10,000 LKR Festival Tickets!
            </p>
          </div>
        ) : (
          <div>
            <p className="text-center text-[11px] font-mono uppercase tracking-widest text-white/50 mb-3">
              Tournament Time Remaining
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              {/* Days */}
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-[#fec01f] block leading-none">
                  {timeLeft.days.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mt-1">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white block leading-none">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mt-1">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white block leading-none">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mt-1">
                  Mins
                </span>
              </div>

              {/* Seconds */}
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-black text-rose-400 block leading-none">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mt-1">
                  Secs
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
