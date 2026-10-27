"use client";

import { BOARD_CONFIG, getLadder, getSnake, getSpecialSquare } from "@/lib/game-engine/board-config";

interface BoardProps {
  playerPosition: number;
  computerPosition: number;
  playerName: string;
  animating?: boolean;
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
      bgClass: "bg-gradient-to-br from-[#fec01f]/25 via-teal-900/40 to-[#06061f] border-[#fec01f] shadow-[0_0_25px_rgba(254,192,31,0.35)]",
      badge: "FINISH",
      badgeClass: "bg-[#fec01f] text-black font-extrabold shadow-[0_0_10px_rgba(254,192,31,0.5)]",
      icon: "🏁",
      subtext: "+300 pts",
    };
  }

  if (ladder) {
    return {
      type: "ladder",
      bgClass: "bg-gradient-to-br from-[#125252]/60 via-teal-950/70 to-[#06061f] border-teal-400/70 shadow-[inset_0_0_15px_rgba(45,212,191,0.2)]",
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
        ? "bg-gradient-to-br from-[#8d1739]/60 via-rose-950/70 to-[#06061f] border-rose-500/80 shadow-[inset_0_0_15px_rgba(251,113,133,0.25)]"
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
      bgClass: "bg-gradient-to-br from-[#fec01f]/20 via-amber-950/40 to-[#06061f] border-[#fec01f]/70 shadow-[inset_0_0_15px_rgba(254,192,31,0.2)]",
      badge: "+50",
      badgeClass: "bg-[#fec01f]/90 text-black font-bold",
      icon: "📝",
      subtext: "FinTech Quiz",
    };
  }

  if (special?.type === "treasure") {
    return {
      type: "treasure",
      bgClass: "bg-gradient-to-br from-[#f57222]/25 via-amber-950/40 to-[#06061f] border-[#f57222]/70 shadow-[inset_0_0_15px_rgba(245,114,34,0.2)]",
      badge: "🎁",
      badgeClass: "bg-[#f57222] text-white font-bold",
      icon: "💰",
      subtext: "+50 & 🛡️",
    };
  }

  return {
    type: "normal",
    bgClass: "bg-[#0c0c28]/70 border-white/10 hover:border-white/25",
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
}: BoardProps) {
  return (
    <div className="w-full select-none">
      {/* 5x5 Grid Board Canvas */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full max-w-2xl mx-auto p-2 sm:p-3.5 rounded-2xl bg-[#080824]/90 border-2 border-white/15 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
        {BOARD_GRID.map((row) =>
          row.map((square) => {
            const isPlayerHere = playerPosition === square;
            const isComputerHere = computerPosition === square;
            const meta = getCellMetadata(square);

            return (
              <div
                key={square}
                className={`
                  relative flex flex-col justify-between p-1.5 sm:p-2 rounded-xl border transition-all duration-300
                  min-h-[64px] sm:min-h-[82px] md:min-h-[96px]
                  ${meta.bgClass}
                  ${isPlayerHere ? "ring-2 ring-[#fec01f] shadow-[0_0_15px_rgba(254,192,31,0.5)] z-10" : ""}
                `}
              >
                {/* Top row: Square number + Destination Badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-[11px] sm:text-xs font-bold ${
                      square === 25 ? "text-[#fec01f]" : "text-white/60"
                    }`}
                  >
                    {square.toString().padStart(2, "0")}
                  </span>

                  {meta.badge && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded leading-none ${meta.badgeClass}`}
                    >
                      {meta.badge}
                    </span>
                  )}
                </div>

                {/* Center: Icon & label */}
                <div className="flex flex-col items-center justify-center my-auto">
                  {meta.icon && (
                    <span
                      className="text-base sm:text-lg md:text-xl leading-none drop-shadow-md"
                      role="img"
                      aria-label={meta.type}
                    >
                      {meta.icon}
                    </span>
                  )}
                  {meta.subtext && (
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/70 truncate max-w-full text-center mt-1 hidden xs:block">
                      {meta.subtext}
                    </span>
                  )}
                </div>

                {/* Bottom row: Player and Computer Tokens */}
                <div className="flex items-center justify-center gap-1.5 min-h-[24px] sm:min-h-[28px]">
                  {isPlayerHere && (
                    <div
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#ffe072] to-[#fec01f] text-black font-extrabold
                        flex items-center justify-center text-[10px] sm:text-xs border-2 border-white
                        shadow-[0_0_12px_rgba(254,192,31,0.8)] transition-transform duration-300
                        ${animating ? "scale-125 ring-2 ring-[#fec01f]" : "scale-100"}
                      `}
                      title={`You: ${playerName}`}
                    >
                      P
                    </div>
                  )}

                  {isComputerHere && (
                    <div
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#fb7185] to-[#8d1739] text-white font-extrabold
                        flex items-center justify-center text-[10px] sm:text-xs border-2 border-white
                        shadow-[0_0_12px_rgba(251,113,133,0.8)] transition-transform duration-300
                        ${animating ? "scale-125 ring-2 ring-[#fb7185]" : "scale-100"}
                      `}
                      title="Computer Opponent"
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
            <span>💰</span> Treasures (+50 & 🛡️)
          </p>
          <p className="font-mono text-[10px] text-white/60 mt-1">Squares 7, 20</p>
        </div>
      </div>
    </div>
  );
}
