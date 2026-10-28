"use client";

import React from "react";
import { Check } from "lucide-react";

interface SuccessFeedbackProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function SuccessFeedback({
  title = "Success!",
  subtitle,
  className = "",
}: SuccessFeedbackProps) {
  return (
    <div
      role="status"
      className={`p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-center flex flex-col items-center justify-center gap-2 animate-scaleIn ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-400 text-teal-300 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)]">
        <Check size={24} className="stroke-[2.5]" />
      </div>
      <div className="space-y-0.5">
        <p className="font-heading font-bold text-sm text-white">{title}</p>
        {subtitle && (
          <p className="font-mono text-xs text-teal-300/80">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
