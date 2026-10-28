import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  label = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-7 h-7 border-2",
    lg: "w-11 h-11 border-3",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="relative">
        {/* Glow backdrop ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-[#fec01f]/20 blur-[1px] absolute inset-0`}
        />
        {/* Spinning gradient ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-t-[#fec01f] border-r-teal-400 border-b-transparent border-l-transparent animate-spin`}
        />
      </div>
      {label && (
        <span className="text-xs font-mono tracking-wider uppercase text-white/60 animate-pulse">
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
