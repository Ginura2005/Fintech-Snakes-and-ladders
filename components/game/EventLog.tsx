"use client";

interface EventLogProps {
  events: string[];
}

export default function EventLog({ events }: EventLogProps) {
  if (events.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Event Log
      </p>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {events.map((event, i) => (
          <p
            key={i}
            className={`text-xs text-gray-700 leading-relaxed ${i === 0 ? "font-medium" : "opacity-75"}`}
          >
            {event}
          </p>
        ))}
      </div>
    </div>
  );
}
