"use client";

import React from "react";
import { Crown, Sun, Target, TrendingUp, Zap, Binary, Puzzle } from "lucide-react";

interface PuzzleIconProps {
  id?: string;
  size?: number;
  className?: string;
}

export default function PuzzleIcon({ id, size = 20, className = "" }: PuzzleIconProps) {
  switch (id) {
    case "queens":
      return <Crown size={size} className={className || "text-[#fec01f]"} />;
    case "tango":
      return <Sun size={size} className={className || "text-amber-400"} />;
    case "pinpoint":
      return <Target size={size} className={className || "text-rose-400"} />;
    case "crossclimb":
      return <TrendingUp size={size} className={className || "text-teal-400"} />;
    case "zip":
      return <Zap size={size} className={className || "text-cyan-400"} />;
    case "mini-sudoku":
      return <Binary size={size} className={className || "text-indigo-400"} />;
    default:
      return <Puzzle size={size} className={className || "text-[#fec01f]"} />;
  }
}
