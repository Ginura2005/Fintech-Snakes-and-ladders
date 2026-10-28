import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "card" | "circle" | "text";
}

export default function Skeleton({
  className = "",
  variant = "default",
  ...props
}: SkeletonProps) {
  const baseClasses =
    "relative overflow-hidden bg-white/[0.05] border border-white/5 animate-pulse";

  const variantClasses = {
    default: "rounded-xl",
    card: "rounded-2xl p-4 border-white/10",
    circle: "rounded-full aspect-square",
    text: "h-4 rounded-md w-full",
  }[variant];

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-hidden="true"
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}
