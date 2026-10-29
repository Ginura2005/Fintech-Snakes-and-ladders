import { ArrowUp, ArrowDown, HelpCircle, Gem, Flag } from "lucide-react";

const ITEMS = [
  {
    icon: ArrowUp,
    label: "Ladder",
    className: "border-teal-500/40 bg-teal-950/40 text-teal-300",
  },
  {
    icon: ArrowDown,
    label: "Snake",
    className: "border-rose-500/40 bg-rose-950/40 text-rose-300",
  },
  {
    icon: HelpCircle,
    label: "Quiz",
    className: "border-[#fec01f]/40 bg-[#fec01f]/10 text-[#fec01f]",
  },
  {
    icon: Gem,
    label: "Treasure",
    className: "border-orange-500/40 bg-orange-950/40 text-orange-300",
  },
  {
    icon: Flag,
    label: "Finish",
    className: "border-white/25 bg-white/5 text-white/80",
  },
] as const;

type FieldLegendProps = {
  className?: string;
  compact?: boolean;
};

/** Single source for board field guide (desktop sidebar + mobile drawer). */
export default function FieldLegend({
  className = "",
  compact = false,
}: FieldLegendProps) {
  return (
    <ul
      className={`flex flex-wrap gap-2 ${className}`.trim()}
      aria-label="Board field guide"
    >
      {ITEMS.map(({ icon: Icon, label, className: chipClass }) => (
        <li
          key={label}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${chipClass}`}
        >
          <Icon size={compact ? 12 : 14} aria-hidden />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
