"use client";

interface EventLogProps {
  events: string[];
}

export default function EventLog({ events }: EventLogProps) {
  if (events.length === 0) return null;

  return (
    <div className="festival-card p-4 bg-[#0a0a28]/85 border-white/10">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/5">
        <p className="font-mono text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#fec01f] animate-pulse" />
          Arena Telemetry Feed
        </p>
        <span className="font-mono text-[10px] text-white/30 uppercase">Live</span>
      </div>
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {events.map((event, i) => (
          <div
            key={i}
            className={`text-xs font-mono leading-relaxed flex items-start gap-2 ${
              i === 0 ? "text-white font-medium" : "text-white/60"
            }`}
          >
            <span className="text-[#fec01f] text-[10px] mt-0.5 select-none">›</span>
            <span>{event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
