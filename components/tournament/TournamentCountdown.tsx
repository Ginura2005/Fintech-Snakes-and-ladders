"use client";

import { useEffect, useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { TOURNAMENT_DEADLINE_MS } from "@/lib/tournament/deadline";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isClosed: boolean;
}

function getTimeLeft(now = Date.now()): TimeLeft {
  const diff = TOURNAMENT_DEADLINE_MS - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isClosed: false,
  };
}

function pad(value: number, padded: boolean) {
  return padded ? String(value).padStart(2, "0") : String(value);
}

function FlipUnit({
  label,
  value,
  padded,
  mounted,
}: {
  label: string;
  value: number;
  padded: boolean;
  mounted: boolean;
}) {
  const display = mounted ? pad(value, padded) : "—";
  const prevRef = useRef(display);
  const [flipFrom, setFlipFrom] = useState(display);
  const [flipTo, setFlipTo] = useState(display);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const next = pad(value, padded);

    if (prevRef.current === "—" || prevRef.current === next) {
      prevRef.current = next;
      setFlipFrom(next);
      setFlipTo(next);
      return;
    }

    setFlipFrom(prevRef.current);
    setFlipTo(next);
    setFlipping(true);
    prevRef.current = next;

    const id = window.setTimeout(() => {
      setFlipping(false);
      setFlipFrom(next);
    }, 600);

    return () => window.clearTimeout(id);
  }, [value, padded, mounted]);

  const topValue = flipping ? flipTo : flipFrom;
  const bottomValue = flipFrom;

  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden border-[3px] border-black bg-white text-black">
      <div className="countdown-flip relative aspect-[1.05] w-full sm:aspect-[1.1]">
        <div className="countdown-flip__half countdown-flip__half--top" aria-hidden>
          <span className="countdown-flip__num">{topValue}</span>
        </div>
        <div className="countdown-flip__half countdown-flip__half--bottom" aria-hidden>
          <span className="countdown-flip__num">{bottomValue}</span>
        </div>

        {flipping ? (
          <>
            <div className="countdown-flip__flap countdown-flip__flap--top">
              <span className="countdown-flip__num">{flipFrom}</span>
            </div>
            <div className="countdown-flip__flap countdown-flip__flap--bottom">
              <span className="countdown-flip__num">{flipTo}</span>
            </div>
          </>
        ) : null}

        <span className="sr-only">{display}</span>
        <div aria-hidden className="countdown-flip__hinge" />
      </div>

      <div className="border-t-2 border-black bg-primary px-1 py-1.5 text-center sm:py-2">
        <span className="font-mono text-[9px] font-bold tracking-widest text-black sm:text-[10px]">
          {label}
        </span>
      </div>
    </div>
  );
}

interface TournamentCountdownProps {
  compact?: boolean;
  className?: string;
}

/**
 * Flip-clock countdown adapted from FinTech-Festival EventCountdown,
 * with tournament prize framing for Lanka FinTechverse.
 */
export default function TournamentCountdown({
  compact = false,
  className = "",
}: TournamentCountdownProps) {
  // Start empty to avoid SSR/client Date.now() hydration mismatch
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
    setTimeLeft(getTimeLeft());
    const id = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-[3px] border-black bg-white p-3 text-xs text-black ${className}`.trim()}
        role="timer"
        aria-live="polite"
      >
        <div className="inline-flex items-center gap-2 min-w-0">
          <Ticket size={16} className="shrink-0 text-brand-burgundy" aria-hidden />
          <span className="font-medium truncate">
            Prize: <strong>10,000 LKR</strong> festival ticket
          </span>
        </div>
        <span className="font-mono font-bold shrink-0 whitespace-nowrap">
          {timeLeft.isClosed
            ? "Closed"
            : mounted
              ? `${timeLeft.days}d ${pad(timeLeft.hours, true)}h ${pad(timeLeft.minutes, true)}m`
              : "—"}
        </span>
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days, padded: false },
    { label: "HOURS", value: timeLeft.hours, padded: true },
    { label: "MINS", value: timeLeft.minutes, padded: true },
    { label: "SECS", value: timeLeft.seconds, padded: true },
  ] as const;

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto my-6 sm:my-8 overflow-hidden border-[3px] border-black bg-brand-burgundy text-white ${className}`.trim()}
      role="timer"
      aria-live="polite"
      suppressHydrationWarning
    >
      <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-center sm:text-left">
          <div className="flex items-start gap-3 min-w-0">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-primary text-black">
              <Ticket size={18} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-heading font-extrabold text-sm sm:text-base text-white leading-snug">
                Grand Prize: 10,000 LKR Festival Ticket
              </p>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Awarded to top leaderboard winners for Sri Lanka FinTech Festival 2026.
              </p>
            </div>
          </div>
          <span className="inline-flex self-center sm:self-start items-center border-2 border-black bg-primary px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-black whitespace-nowrap">
            CLOSES OCT 31
          </span>
        </div>

        {timeLeft.isClosed ? (
          <div className="border-[3px] border-black bg-white p-4 text-center text-black">
            <p className="font-heading text-lg font-bold text-brand-burgundy">
              Tournament closed
            </p>
            <p className="text-xs mt-1 text-black/70">
              Final verification in progress. Top winners will be contacted for their tickets.
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-3 font-mono text-[10px] tracking-widest text-white/70 sm:mb-4 sm:text-xs">
              {mounted ? "Countdown to tournament close" : "Loading countdown…"}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {units.map((unit) => (
                <FlipUnit
                  key={unit.label}
                  label={unit.label}
                  mounted={mounted}
                  padded={unit.padded}
                  value={unit.value}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
