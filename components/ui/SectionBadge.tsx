import type { ReactNode } from "react";

type SectionBadgeVariant =
  | "primary"
  | "on-dark"
  | "teal"
  | "burgundy"
  | "rose";

const VARIANT: Record<SectionBadgeVariant, string> = {
  primary: "section-badge-primary",
  "on-dark": "section-badge-on-dark",
  teal: "section-badge-teal",
  burgundy: "section-badge-burgundy",
  rose: "section-badge-rose",
};

type SectionBadgeProps = {
  children: ReactNode;
  variant?: SectionBadgeVariant;
  className?: string;
};

/** Caps label matching fintechfestival.lk section badges. */
export default function SectionBadge({
  children,
  variant = "on-dark",
  className = "",
}: SectionBadgeProps) {
  return (
    <span className={`section-badge ${VARIANT[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
