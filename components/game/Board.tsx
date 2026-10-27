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
      bgClass: "bg-gradient-to-br from-emerald-50 to-teal-100 border-teal-500 shadow-sm",
      badge: "FINISH",
      badgeClass: "bg-teal-700 text-white font-black",
      icon: "🏁",
      subtext: "+300 pts",
    };
  }

  if (ladder) {
    return {
      type: "ladder",
      bgClass: "bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 border-teal-400 hover:border-teal-600",
      badge: `↑ ${ladder.to}`,
      badgeClass: "bg-teal-600 text-white font-bold",
      icon: "🪜",
      subtext: ladder.theme,
    };
  }

  if (snake) {
    const isMajor = snake.type === "major";
    return {
      type: "snake",
      bgClass: isMajor
        ? "bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 border-rose-400"
        : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300",
      badge: `↓ ${snake.to}`,
      badgeClass: isMajor ? "bg-red-700 text-white font-bold" : "bg-amber-600 text-white font-bold",
      icon: isMajor ? "🐍⚠️" : "🐍",
      subtext: isMajor ? "-25 & ❤️" : "-10",
    };
  }

  if (special?.type === "quiz") {
    return {
      type: "quiz",
      bgClass: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300",
      badge: "+50",
      badgeClass: "bg-yellow-500 text-yellow-950 font-bold",
      icon: "📝",
      subtext: "Quiz",
    };
  }

  if (special?.type === "treasure") {
    return {
      type: "treasure",
      bgClass: "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300",
      badge: "🎁",
      badgeClass: "bg-orange-500 text-white font-bold",
      icon: "💰",
      subtext: "+50 & 🛡️",
    };
  }

  return {
    type: "normal",
    bgClass: "bg-white/90 border-slate-200/80 hover:border-slate-300",
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
      {/* 5x5 Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-2xl mx-auto">
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
                  min-h-[58px] sm:min-h-[76px] md:min-h-[90px]
                  ${meta.bgClass}
                  ${isPlayerHere ? "ring-2 ring-teal-500 shadow-md" : ""}
                `}
              >
                {/* Top row: Square number + Destination Badge */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] sm:text-xs font-black ${square === 25 ? "text-teal-900" : "text-slate-500"}`}>
                    {square}
                  </span>

                  {meta.badge && (
                    <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md leading-none ${meta.badgeClass}`}>
                      {meta.badge}
                    </span>
                  )}
                </div>

                {/* Center: Icon & label */}
                <div className="flex flex-col items-center justify-center my-auto">
                  {meta.icon && (
                    <span className="text-sm sm:text-base md:text-lg leading-none" role="img" aria-label={meta.type}>
                      {meta.icon}
                    </span>
                  )}
                  {meta.subtext && (
                    <span className="text-[8px] sm:text-[9px] font-semibold text-slate-600 truncate max-w-full text-center mt-0.5 hidden xs:block">
                      {meta.subtext}
                    </span>
                  )}
                </div>

                {/* Bottom row: Player and Computer Tokens */}
                <div className="flex items-center justify-center gap-1 min-h-[22px] sm:min-h-[26px]">
                  {isPlayerHere && (
                    <div
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-700 text-white font-bold
                        flex items-center justify-center text-[9px] sm:text-[11px] border-2 border-white
                        shadow-md transition-transform duration-300
                        ${animating ? "scale-125" : "scale-100"}
                      `}
                      title={`You: ${playerName}`}
                    >
                      P
                    </div>
                  )}

                  {isComputerHere && (
                    <div
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#8D1739] text-white font-bold
                        flex items-center justify-center text-[9px] sm:text-[11px] border-2 border-white
                        shadow-md transition-transform duration-300
                        ${animating ? "scale-125" : "scale-100"}
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

      {/* Board Summary Strip */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-2">
          <p className="font-bold text-teal-800 flex items-center gap-1">
            <span>🪜</span> Ladders (+25)
          </p>
          <p className="text-[11px] text-teal-700 mt-0.5">3→8, 6→11, 10→17, 14→22</p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
          <p className="font-bold text-rose-800 flex items-center gap-1">
            <span>🐍</span> Snakes (-10/-25)
          </p>
          <p className="text-[11px] text-rose-700 mt-0.5">12→5, 19→9 ⚠️, 21→13, 24→16 ⚠️</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="font-bold text-yellow-800 flex items-center gap-1">
            <span>📝</span> Quizzes (+50)
          </p>
          <p className="text-[11px] text-yellow-700 mt-0.5">Squares 4, 15, 18</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
          <p className="font-bold text-amber-800 flex items-center gap-1">
            <span>💰</span> Treasures (+50 & 🛡️)
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Squares 7, 20</p>
        </div>
      </div>
    </div>
  );
}
