"use client";

import { BOARD_CONFIG, getLadder, getSnake, getSpecialSquare } from "@/lib/game-engine/board-config";
import BoardSvgOverlay from "./BoardSvgOverlay";

interface BoardProps {
  playerPosition: number;
  computerPosition: number;
  playerName: string;
  animating?: boolean;
  activeLadder?: number | null;
  activeSnake?: number | null;
  movingPawn?: "player" | "computer" | null;
  floatingMessage?: { text: string; type: "ladder" | "snake" | "treasure" | "quiz" | "finish" } | null;
}

// 5×5 Serpentine Grid layout
function buildBoardLayout(): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < 5; row++) {
    const startNum = row * 5 + 1;
    const rowNums = [startNum, startNum + 1, startNum + 2, startNum + 3, startNum + 4];
    if (row % 2 === 1) rowNums.reverse();
    grid.push(rowNums);
  }
  grid.reverse(); // Row 5 (21-25) at top
  return grid;
}

const BOARD_GRID = buildBoardLayout();

function getCellMetadata(square: number) {
  const ladder = getLadder(square);
  const snake = getSnake(square);
  const special = getSpecialSquare(square);

  if (square === 25) {
    return {
      type: "finish",
      bgClass: "bg-gradient-to-br from-[#fec01f]/25 via-teal-950/40 to-[#070722] border-[#fec01f] shadow-[0_0_20px_rgba(254,192,31,0.35)]",
      badge: "FINISH",
      badgeClass: "bg-[#fec01f] text-black font-extrabold shadow-[0_0_8px_rgba(254,192,31,0.6)]",
      icon: "🏁",
    };
  }

  if (ladder) {
    return {
      type: "ladder",
      bgClass: "bg-gradient-to-br from-[#125252]/40 via-teal-950/40 to-[#070722] border-teal-400/50",
      badge: `↑${ladder.to}`,
      badgeClass: "bg-teal-500/90 text-white font-bold",
      icon: "🪜",
    };
  }

  if (snake) {
    const isMajor = snake.type === "major";
    return {
      type: "snake",
      bgClass: isMajor
        ? "bg-gradient-to-br from-[#8d1739]/45 via-rose-950/40 to-[#070722] border-rose-500/60"
        : "bg-gradient-to-br from-amber-950/35 via-rose-950/20 to-[#070722] border-amber-500/50",
      badge: isMajor ? `↓${snake.to}⚠️` : `↓${snake.to}`,
      badgeClass: isMajor
        ? "bg-rose-700 text-white font-bold"
        : "bg-amber-700 text-amber-100 font-bold",
      icon: "🐍",
    };
  }

  if (special?.type === "quiz") {
    return {
      type: "quiz",
      bgClass: "bg-gradient-to-br from-[#fec01f]/15 via-amber-950/30 to-[#070722] border-[#fec01f]/50",
      badge: "+50",
      badgeClass: "bg-[#fec01f] text-black font-bold",
      icon: "📝",
    };
  }

  if (special?.type === "treasure") {
    return {
      type: "treasure",
      bgClass: "bg-gradient-to-br from-[#f57222]/20 via-orange-950/30 to-[#070722] border-[#f57222]/50",
      badge: "🛡️",
      badgeClass: "bg-[#f57222] text-white font-bold",
      icon: "💰",
    };
  }

  return {
    type: "normal",
    bgClass: "bg-[#0b0b28]/70 border-white/[0.08] hover:border-white/20",
    badge: null,
    badgeClass: "",
    icon: null,
  };
}

export default function GameBoard({
  playerPosition,
  computerPosition,
  playerName,
  animating = false,
  activeLadder = null,
  activeSnake = null,
  movingPawn = null,
  floatingMessage = null,
}: BoardProps) {
  return (
    <div className="w-full select-none">
      {/* 5x5 Arena Board with Aspect-Square Canvas */}
      <div className="relative w-full max-w-2xl mx-auto p-1.5 sm:p-3 rounded-2xl bg-[#080824]/95 border border-white/15 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Floating Event Toast */}
        {floatingMessage && (
          <div
            className={`
              absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-heading font-extrabold text-xs sm:text-sm
              shadow-2xl flex items-center gap-2 border animate-bounce max-w-[90%] text-center
              ${
                floatingMessage.type === "ladder"
                  ? "bg-teal-500/95 text-white border-teal-300 shadow-[0_0_25px_rgba(45,212,191,0.6)]"
                  : floatingMessage.type === "snake"
                  ? "bg-rose-600/95 text-white border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                  : floatingMessage.type === "treasure"
                  ? "bg-[#f57222]/95 text-white border-orange-300 shadow-[0_0_25px_rgba(245,114,34,0.6)]"
                  : floatingMessage.type === "finish"
                  ? "bg-[#fec01f]/95 text-black border-amber-200 shadow-[0_0_25px_rgba(254,192,31,0.8)]"
                  : "bg-indigo-600/95 text-white border-indigo-300"
              }
            `}
          >
            <span>{floatingMessage.text}</span>
          </div>
        )}

        {/* Aspect-Square Canvas for Synchronized SVG Overlay & Grid */}
        <div className="relative w-full aspect-square">
          {/* Visual SVG Overlay: 3D Golden Ladders & Curved Snakes */}
          <BoardSvgOverlay activeLadder={activeLadder} activeSnake={activeSnake} />

          {/* Clean 5x5 Grid Cells */}
          <div className="grid grid-cols-5 grid-rows-5 gap-1 sm:gap-1.5 w-full h-full relative z-10">
            {BOARD_GRID.map((row) =>
              row.map((square) => {
                const isPlayerHere = playerPosition === square;
                const isComputerHere = computerPosition === square;
                const meta = getCellMetadata(square);

                return (
                  <div
                    key={square}
                    className={`
                      relative flex flex-col justify-between p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all duration-200
                      ${meta.bgClass}
                      ${isPlayerHere ? "ring-2 ring-[#fec01f] shadow-[0_0_12px_rgba(254,192,31,0.6)] z-20" : ""}
                      ${isComputerHere && !isPlayerHere ? "ring-1.5 ring-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : ""}
                    `}
                  >
                    {/* Top Header: Crisp Square Number + Feature Indicator */}
                    <div className="flex items-center justify-between w-full leading-none">
                      <span
                        className={`font-mono text-[11px] sm:text-xs md:text-sm font-black ${
                          square === 25 ? "text-[#fec01f]" : "text-white/70"
                        }`}
                      >
                        {square.toString().padStart(2, "0")}
                      </span>

                      {meta.badge && (
                        <span
                          className={`text-[8px] sm:text-[9px] font-mono px-1 py-0.5 rounded leading-none ${meta.badgeClass}`}
                        >
                          {meta.badge}
                        </span>
                      )}
                    </div>

                    {/* Middle: Clean Feature Icon (Subtle & Uncluttered) */}
                    <div className="flex items-center justify-center my-auto">
                      {meta.icon && (
                        <span
                          className="text-sm sm:text-base md:text-xl drop-shadow select-none opacity-90"
                          role="img"
                          aria-label={meta.type}
                        >
                          {meta.icon}
                        </span>
                      )}
                    </div>

                    {/* Bottom: Player & AI Pawn Counters */}
                    <div className="flex items-center justify-center gap-1 min-h-[18px] sm:min-h-[24px]">
                      {isPlayerHere && (
                        <div
                          className={`
                            w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-[#ffe072] to-[#fec01f] text-black font-heading font-black
                            flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs border-1.5 sm:border-2 border-white
                            shadow-[0_2px_8px_rgba(0,0,0,0.8),0_0_10px_rgba(254,192,31,0.9)] transition-all duration-200
                            ${
                              movingPawn === "player"
                                ? "scale-125 -translate-y-2 ring-4 ring-[#fec01f]/70"
                                : animating
                                ? "scale-110"
                                : "scale-100"
                            }
                          `}
                          title={`You (Square ${square})`}
                        >
                          P
                        </div>
                      )}

                      {isComputerHere && (
                        <div
                          className={`
                            w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-[#fb7185] to-[#8d1739] text-white font-heading font-black
                            flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs border-1.5 sm:border-2 border-white
                            shadow-[0_2px_8px_rgba(0,0,0,0.8),0_0_10px_rgba(251,113,133,0.9)] transition-all duration-200
                            ${
                              movingPawn === "computer"
                                ? "scale-125 -translate-y-2 ring-4 ring-rose-400/70"
                                : "scale-100"
                            }
                          `}
                          title={`AI Opponent (Square ${square})`}
                        >
                          AI
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Uncluttered Streamlined Legend Pill Bar */}
      <div className="mt-2.5 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs font-mono text-white/70">
        <span className="flex items-center gap-1 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-full text-teal-300">
          <span>🪜</span> Ladders (+25)
        </span>
        <span className="flex items-center gap-1 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full text-rose-300">
          <span>🐍</span> Snakes (-10/-25)
        </span>
        <span className="flex items-center gap-1 bg-amber-950/60 border border-[#fec01f]/30 px-2 py-0.5 rounded-full text-[#fec01f]">
          <span>📝</span> Quiz (+50)
        </span>
        <span className="flex items-center gap-1 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded-full text-orange-300">
          <span>💰</span> Treasure (+50 &amp; 🛡️)
        </span>
      </div>
    </div>
  );
}
