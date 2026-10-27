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

// Build board layout (5×5 serpentine)
// Row 1 (bottom): 1 -> 5 (left to right)
// Row 2: 6 -> 10 (right to left)
// Row 3: 11 -> 15 (left to right)
// Row 4: 16 -> 20 (right to left)
// Row 5 (top): 21 -> 25 (left to right)
function buildBoardLayout(): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < 5; row++) {
    const startNum = row * 5 + 1;
    const rowNums = [startNum, startNum + 1, startNum + 2, startNum + 3, startNum + 4];
    if (row % 2 === 1) rowNums.reverse();
    grid.push(rowNums);
  }
  // Flip so row 5 (21-25) is at top of screen
  grid.reverse();
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
      bgClass: "bg-gradient-to-br from-[#fec01f]/30 via-teal-900/50 to-[#06061f] border-[#fec01f] shadow-[0_0_25px_rgba(254,192,31,0.4)]",
      badge: "FINISH",
      badgeClass: "bg-[#fec01f] text-black font-extrabold shadow-[0_0_10px_rgba(254,192,31,0.6)]",
      icon: "🏁",
      subtext: "+300 pts",
    };
  }

  if (ladder) {
    return {
      type: "ladder",
      bgClass: "bg-gradient-to-br from-[#125252]/50 via-teal-950/60 to-[#06061f] border-teal-400/60 shadow-[inset_0_0_15px_rgba(45,212,191,0.15)]",
      badge: `↑ ${ladder.to}`,
      badgeClass: "bg-teal-600/90 text-teal-100 border border-teal-300/40 font-bold",
      icon: "🪜",
      subtext: ladder.theme,
    };
  }

  if (snake) {
    const isMajor = snake.type === "major";
    return {
      type: "snake",
      bgClass: isMajor
        ? "bg-gradient-to-br from-[#8d1739]/50 via-rose-950/60 to-[#06061f] border-rose-500/70 shadow-[inset_0_0_15px_rgba(251,113,133,0.2)]"
        : "bg-gradient-to-br from-amber-950/40 via-rose-950/30 to-[#06061f] border-amber-500/60",
      badge: `↓ ${snake.to}`,
      badgeClass: isMajor
        ? "bg-rose-700 text-white border border-rose-400/50 font-bold"
        : "bg-amber-700 text-amber-100 border border-amber-400/40 font-bold",
      icon: isMajor ? "🐍⚠️" : "🐍",
      subtext: isMajor ? "-25 & ❤️" : "-10 pts",
    };
  }

  if (special?.type === "quiz") {
    return {
      type: "quiz",
      bgClass: "bg-gradient-to-br from-[#fec01f]/20 via-amber-950/40 to-[#06061f] border-[#fec01f]/60 shadow-[inset_0_0_15px_rgba(254,192,31,0.15)]",
      badge: "+50",
      badgeClass: "bg-[#fec01f]/90 text-black font-bold",
      icon: "📝",
      subtext: "FinTech Quiz",
    };
  }

  if (special?.type === "treasure") {
    return {
      type: "treasure",
      bgClass: "bg-gradient-to-br from-[#f57222]/25 via-amber-950/40 to-[#06061f] border-[#f57222]/60 shadow-[inset_0_0_15px_rgba(245,114,34,0.15)]",
      badge: "🎁",
      badgeClass: "bg-[#f57222] text-white font-bold",
      icon: "💰",
      subtext: "+50 & 🛡️",
    };
  }

  return {
    type: "normal",
    bgClass: "bg-[#0c0c28]/60 border-white/10 hover:border-white/25",
    badge: null,
    badgeClass: "",
    icon: null,
    subtext: null,
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
      {/* 5x5 Serpentine Arena Board with Visual SVG Snakes & Ladders */}
      <div className="relative w-full max-w-2xl mx-auto p-2 sm:p-3.5 rounded-2xl bg-[#080824]/95 border-2 border-white/15 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Floating Celebration/Hazard Toast */}
        {floatingMessage && (
          <div
            className={`
              absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl font-heading font-extrabold text-sm sm:text-base
              shadow-2xl flex items-center gap-2 border animate-bounce
              ${
                floatingMessage.type === "ladder"
                  ? "bg-teal-500/90 text-white border-teal-300 shadow-[0_0_30px_rgba(45,212,191,0.6)]"
                  : floatingMessage.type === "snake"
                  ? "bg-rose-600/90 text-white border-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
                  : floatingMessage.type === "treasure"
                  ? "bg-[#f57222]/95 text-white border-orange-300 shadow-[0_0_30px_rgba(245,114,34,0.6)]"
                  : floatingMessage.type === "finish"
                  ? "bg-[#fec01f]/95 text-black border-amber-200 shadow-[0_0_30px_rgba(254,192,31,0.8)]"
                  : "bg-indigo-600/90 text-white border-indigo-300"
              }
            `}
          >
            <span>{floatingMessage.text}</span>
          </div>
        )}

        {/* Board Canvas with Aspect-Square Ratio to perfectly synchronize with SVG coordinates */}
        <div className="relative w-full aspect-square">
          {/* SVG Overlay: Serpentine Guide, 3D Ladders & Slithering Snakes */}
          <BoardSvgOverlay activeLadder={activeLadder} activeSnake={activeSnake} />

          {/* 5x5 Tile Grid */}
          <div className="grid grid-cols-5 grid-rows-5 gap-1 sm:gap-2 w-full h-full relative z-10">
            {BOARD_GRID.map((row) =>
              row.map((square) => {
                const isPlayerHere = playerPosition === square;
                const isComputerHere = computerPosition === square;
                const meta = getCellMetadata(square);

                return (
                  <div
                    key={square}
                    className={`
                      relative flex flex-col justify-between p-1 sm:p-2 rounded-xl border transition-all duration-300
                      ${meta.bgClass}
                      ${isPlayerHere ? "ring-2 ring-[#fec01f] shadow-[0_0_16px_rgba(254,192,31,0.5)] z-20" : ""}
                      ${isComputerHere && !isPlayerHere ? "ring-1 ring-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : ""}
                    `}
                  >
                    {/* Top Row: Square Number + Destination Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono text-[10px] sm:text-xs font-bold leading-none ${
                          square === 25 ? "text-[#fec01f]" : "text-white/60"
                        }`}
                      >
                        {square.toString().padStart(2, "0")}
                      </span>

                      {meta.badge && (
                        <span
                          className={`text-[8px] sm:text-[10px] font-mono px-1 py-0.5 rounded leading-none ${meta.badgeClass}`}
                        >
                          {meta.badge}
                        </span>
                      )}
                    </div>

                    {/* Center: Square Feature / Icon */}
                    <div className="flex flex-col items-center justify-center my-auto">
                      {meta.icon && (
                        <span
                          className="text-xs sm:text-base md:text-lg leading-none drop-shadow-md select-none"
                          role="img"
                          aria-label={meta.type}
                        >
                          {meta.icon}
                        </span>
                      )}
                      {meta.subtext && (
                        <span className="text-[7px] sm:text-[8px] font-mono text-white/70 truncate max-w-full text-center mt-0.5 hidden xs:block">
                          {meta.subtext}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Pawns / Counters */}
                    <div className="flex items-center justify-center gap-1 min-h-[22px] sm:min-h-[28px]">
                      {isPlayerHere && (
                        <div
                          className={`
                            w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#ffe072] to-[#fec01f] text-black font-black
                            flex items-center justify-center text-[9px] sm:text-xs border-2 border-white
                            shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_14px_rgba(254,192,31,0.9)] transition-all duration-200
                            ${
                              movingPawn === "player"
                                ? "scale-125 -translate-y-2 ring-4 ring-[#fec01f]/70"
                                : animating
                                ? "scale-110 ring-2 ring-[#fec01f]"
                                : "scale-100"
                            }
                          `}
                          title={`You: ${playerName} (Square ${square})`}
                        >
                          P
                        </div>
                      )}

                      {isComputerHere && (
                        <div
                          className={`
                            w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#fb7185] to-[#8d1739] text-white font-black
                            flex items-center justify-center text-[9px] sm:text-xs border-2 border-white
                            shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_14px_rgba(251,113,133,0.9)] transition-all duration-200
                            ${
                              movingPawn === "computer"
                                ? "scale-125 -translate-y-2 ring-4 ring-rose-400/70"
                                : "scale-100"
                            }
                          `}
                          title={`FinTech AI (Square ${square})`}
                        >
                          C
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

      {/* Board Summary Strip (Legend) */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="festival-card p-2.5 border-teal-500/40 bg-teal-950/30">
          <p className="font-mono font-bold text-teal-300 flex items-center gap-1.5 uppercase text-[11px]">
            <span>🪜</span> Ladders (+25)
          </p>
          <p className="font-mono text-[10px] text-white/60 mt-1">3→8, 6→11, 10→17, 14→22</p>
        </div>

        <div className="festival-card p-2.5 border-rose-500/40 bg-rose-950/30">
          <p className="font-mono font-bold text-rose-300 flex items-center gap-1.5 uppercase text-[11px]">
            <span>🐍</span> Snakes (-10/-25)
          </p>
          <p className="font-mono text-[10px] text-white/60 mt-1">12→5, 19→9 ⚠️, 21→13, 24→16 ⚠️</p>
        </div>

        <div className="festival-card p-2.5 border-[#fec01f]/40 bg-[#fec01f]/10">
          <p className="font-mono font-bold text-[#fec01f] flex items-center gap-1.5 uppercase text-[11px]">
            <span>📝</span> Quizzes (+50)
          </p>
          <p className="font-mono text-[10px] text-white/60 mt-1">Squares 4, 15, 18</p>
        </div>

        <div className="festival-card p-2.5 border-orange-500/40 bg-orange-950/30">
          <p className="font-mono font-bold text-orange-300 flex items-center gap-1.5 uppercase text-[11px]">
            <span>💰</span> Treasures (+50 &amp; 🛡️)
          </p>
          <p className="font-mono text-[10px] text-white/60 mt-1">Squares 7, 20</p>
        </div>
      </div>
    </div>
  );
}
