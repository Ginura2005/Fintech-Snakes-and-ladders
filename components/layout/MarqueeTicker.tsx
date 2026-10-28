"use client";

interface MarqueeTickerProps {
  reverse?: boolean;
}

const FESTIVAL_TOPICS = [
  "SRI LANKA FINTECH FESTIVAL 2026",
  "GRAND PRIZE: 10,000 LKR FESTIVAL TICKET",
  "TOURNAMENT CLOSES OCTOBER 31ST",
  "AI & DATA IN BANKING",
  "LANKAPAY ECOSYSTEM",
  "DIGITAL ASSETS & BLOCKCHAIN",
  "CYBERSECURITY & RESILIENCE",
  "FINANCIAL INCLUSION",
  "DIGITAL IDENTITY",
  "CROSS-BORDER PAYMENTS",
  "COLOMBO INNOVATION HUB",
  "FINTECHVERSE ARENA",
  "NEXT-GEN FINANCIAL APIS",
  "EMBEDDED FINANCE",
];

export default function MarqueeTicker({ reverse = false }: MarqueeTickerProps) {
  return (
    <div className="awards-marquee py-3 border-y border-white/10 bg-white/[0.02]">
      <div
        className={`awards-marquee__row ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {/* Render twice for seamless loop */}
        {[...FESTIVAL_TOPICS, ...FESTIVAL_TOPICS].map((topic, i) => (
          <span
            key={i}
            className={`awards-marquee__chip ${
              i % 4 === 1
                ? "bg-[#8d1739]/30 border-[#8d1739]/60 text-white"
                : i % 4 === 3
                ? "bg-[#125252]/40 border-teal-500/50 text-[#2dd4bf]"
                : i % 4 === 2
                ? "border-[#fec01f]/60 text-[#fec01f]"
                : ""
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
