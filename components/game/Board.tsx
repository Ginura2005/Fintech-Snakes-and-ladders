"use client";

import { BOARD_CONFIG, getLadder, getSnake, getSpecialSquare, BoardConfig } from "@/lib/game-engine/board-config";
import BoardSvgOverlay, { SQUARE_CENTERS } from "./BoardSvgOverlay";
import GameAvatar, { AvatarMood } from "./GameAvatar";
import { Trophy, TrendingUp, AlertTriangle, HelpCircle, Gem } from "lucide-react";

interface BoardProps {
  playerPosition: number;
  computerPosition: number;
  playerName: string;
  playerMood?: AvatarMood;
  computerMood?: AvatarMood;
  animating?: boolean;
  activeLadder?: number | null;
  activeSnake?: number | null;
  movingPawn?: "player" | "computer" | null;
  floatingMessage?: { text: string; type: "ladder" | "snake" | "treasure" | "quiz" | "finish" } | null;
  /** Dynamic or procedural board configuration */
  boardConfig?: BoardConfig;
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

function getCellMetadata(square: number, config: BoardConfig = BOARD_CONFIG) {
  const ladder = getLadder(square, config);
  const snake = getSnake(square, config);
  const special = getSpecialSquare(square, config);
  if (square === 25) {
    return {
      type: "finish",
      bgClass: "bg-gradient-to-br from-[#fec01f]/25 via-teal-950/40 to-[#070722] border-[#fec01f] shadow-[0_0_20px_rgba(254,192,31,0.35)]",
      badge: "FINISH",
      badgeClass: "bg-[#fec01f] text-black font-extrabold shadow-[0_0_8px_rgba(254,192,31,0.6)]",
    };
  }

  if (ladder) {
    return {
      type: "ladder",
      bgClass: "bg-gradient-to-br from-[#125252]/40 via-teal-950/40 to-[#070722] border-teal-400/50",
      badge: `↑${ladder.to}`,
      badgeClass: "bg-teal-500/90 text-white font-bold",
    };
  }

  if (snake) {
    const isMajor = snake.type === "major";
    return {
      type: "snake",
      bgClass: isMajor
        ? "bg-gradient-to-br from-[#8d1739]/45 via-rose-950/40 to-[#070722] border-rose-500/60"
        : "bg-gradient-to-br from-amber-950/35 via-rose-950/20 to-[#070722] border-amber-500/50",
      badge: isMajor ? `↓${snake.to}!` : `↓${snake.to}`,
      badgeClass: isMajor
        ? "bg-rose-700 text-white font-bold"
        : "bg-amber-700 text-amber-100 font-bold",
    };
  }

  if (special?.type === "quiz") {
    return {
      type: "quiz",
      bgClass: "bg-gradient-to-br from-[#fec01f]/15 via-amber-950/30 to-[#070722] border-[#fec01f]/50",
      badge: "+50",
      badgeClass: "bg-[#fec01f] text-black font-bold",
    };
  }

  if (special?.type === "treasure") {
    return {
      type: "treasure",
      bgClass: "bg-gradient-to-br from-[#f57222]/20 via-orange-950/30 to-[#070722] border-[#f57222]/50",
      badge: "SHLD",
      badgeClass: "bg-[#f57222] text-white font-bold",
    };
  }

  return {
    type: "normal",
    bgClass: "bg-[#0b0b28]/70 border-white/[0.08] hover:border-white/20",
    badge: null,
    badgeClass: "",
  };
}

export default function GameBoard({
  playerPosition,
  computerPosition,
  playerName,
  playerMood = "idle",
  computerMood = "idle",
  animating = false,
  activeLadder = null,
  activeSnake = null,
  movingPawn = null,
  floatingMessage = null,
  boardConfig = BOARD_CONFIG,
}: BoardProps) {
  const activeConfig = boardConfig;
  // Center coordinates for character pawns on 1000x1000 board
  const playerCoord = SQUARE_CENTERS[playerPosition] || SQUARE_CENTERS[1];
  const computerCoord = SQUARE_CENTERS[computerPosition] || SQUARE_CENTERS[1];
  const sameSquare = playerPosition === computerPosition;

  // Floating coordinates in percentage
  // X = col * 20 + 10% (from SQUARE_CENTERS.x / 10)
  // Y = row * 20 + 13.5% (anchored to lower half of tile)
  const playerX = playerCoord.x / 10;
  const playerY = playerCoord.row * 20 + 13.5;

  const computerX = computerCoord.x / 10;
  const computerY = computerCoord.row * 20 + 13.5;

  // Movement action states
  const isPlayerMoving = movingPawn === "player";
  const isComputerMoving = movingPawn === "computer";

  const isPlayerLadder = activeLadder !== null && isPlayerMoving;
  const isComputerLadder = activeLadder !== null && isComputerMoving;
  const isPlayerSnake = activeSnake !== null && isPlayerMoving;
  const isComputerSnake = activeSnake !== null && isComputerMoving;

  // Dynamic spring physics depending on movement type
  const getPawnTransition = (isLadder: boolean, isSnake: boolean) => {
    if (isLadder) {
      return "left 750ms cubic-bezier(0.22, 1, 0.36, 1), top 750ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.25, 1, 0.5, 1)";
    }
    if (isSnake) {
      return "left 800ms cubic-bezier(0.4, 0, 0.2, 1), top 800ms cubic-bezier(0.4, 0, 0.2, 1), transform 260ms cubic-bezier(0.25, 1, 0.5, 1)";
    }
    return "left 260ms cubic-bezier(0.25, 1, 0.5, 1), top 260ms cubic-bezier(0.25, 1, 0.5, 1), transform 260ms cubic-bezier(0.25, 1, 0.5, 1)";
  };

  return (
    <div className="w-full select-none">
      {/* 5x5 Arena Board with Aspect-Square Canvas */}
      <div className="relative w-full max-w-2xl mx-auto p-1.5 sm:p-3 rounded-2xl bg-[#080824]/95 border border-white/15 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Floating Event Toast */}
        {floatingMessage && (
          <div
            className={`
              absolute top-3 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-heading font-extrabold text-xs sm:text-sm
              shadow-2xl flex items-center gap-2 border animate-toast-pop max-w-[90%] text-center pointer-events-none
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
          <BoardSvgOverlay activeLadder={activeLadder} activeSnake={activeSnake} ladders={activeConfig.ladders} snakes={activeConfig.snakes} />

          {/* Clean 5x5 Grid Cells */}
          <div className="grid grid-cols-5 grid-rows-5 gap-1 sm:gap-1.5 w-full h-full relative z-10">
            {BOARD_GRID.map((row) =>
              row.map((square) => {
                const isPlayerHere = playerPosition === square;
                const isComputerHere = computerPosition === square;
                const meta = getCellMetadata(square, activeConfig);

                return (
                  <div
                    key={square}
                    className={`
                      relative flex flex-col justify-between p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all duration-300
                      ${meta.bgClass}
                      ${
                        isPlayerHere && isComputerHere
                          ? "ring-2 ring-[#fec01f] shadow-[0_0_16px_rgba(254,192,31,0.6)] z-20"
                          : isPlayerHere
                          ? "ring-2 ring-[#fec01f] shadow-[0_0_12px_rgba(254,192,31,0.5)] z-20"
                          : isComputerHere
                          ? "ring-1.5 ring-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                          : ""
                      }
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

                    {/* Middle: Clean Feature Icon (Real Lucide SVG, No Emojis) */}
                    <div className="flex items-center justify-center my-auto">
                      {meta.type === "finish" && <Trophy size={16} className="text-[#fec01f] drop-shadow" />}
                      {meta.type === "ladder" && <TrendingUp size={15} className="text-teal-300 drop-shadow" />}
                      {meta.type === "snake" && <AlertTriangle size={14} className="text-rose-400 drop-shadow" />}
                      {meta.type === "quiz" && <HelpCircle size={14} className="text-[#fec01f] drop-shadow" />}
                      {meta.type === "treasure" && <Gem size={14} className="text-orange-400 drop-shadow" />}
                    </div>

                    {/* Bottom: Subtle Tile Landing Groove */}
                    <div className="flex items-center justify-center min-h-[14px] sm:min-h-[18px] w-full">
                      <div
                        className={`
                          w-6 sm:w-8 h-1 rounded-full transition-all duration-300
                          ${
                            isPlayerHere || isComputerHere
                              ? "bg-[#fec01f]/35 blur-[0.5px] scale-110"
                              : "bg-white/[0.04]"
                          }
                        `}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Continuous Floating Pawn Layer (Smooth Physical Movement) ── */}
          <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
            {/* Human Player Character Pawn ("Trailblazer") */}
            <div
              className="absolute will-change-[left,top,transform]"
              style={{
                left: `${playerX}%`,
                top: `${playerY}%`,
                transform: sameSquare
                  ? "translate(calc(-50% - 13px), -50%)"
                  : "translate(-50%, -50%)",
                transition: getPawnTransition(isPlayerLadder, isPlayerSnake),
                zIndex: isPlayerMoving ? 35 : 28,
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Parabolic Hop Body */}
                <div
                  className={`
                    relative transition-transform duration-200
                    ${isPlayerMoving ? "animate-pawn-hop" : animating ? "scale-105" : "scale-100"}
                    ${isPlayerLadder ? "ring-4 ring-[#fec01f] shadow-[0_0_25px_rgba(254,192,31,0.9)] rounded-full" : ""}
                    ${isPlayerSnake ? "ring-4 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.9)] rounded-full" : ""}
                  `}
                  title={`You (Square ${playerPosition})`}
                >
                  <GameAvatar type="player" size="pawn" mood={playerMood} />
                </div>

                {/* Ground Drop Shadow */}
                <span
                  className={`
                    w-4 h-1 sm:w-5 sm:h-1.5 bg-black/60 rounded-full blur-[1px] -mt-0.5
                    ${isPlayerMoving ? "animate-pawn-shadow" : "opacity-60"}
                  `}
                />
              </div>
            </div>

            {/* Ava (AI Rival) Character Pawn */}
            <div
              className="absolute will-change-[left,top,transform]"
              style={{
                left: `${computerX}%`,
                top: `${computerY}%`,
                transform: sameSquare
                  ? "translate(calc(-50% + 13px), -50%)"
                  : "translate(-50%, -50%)",
                transition: getPawnTransition(isComputerLadder, isComputerSnake),
                zIndex: isComputerMoving ? 35 : 27,
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Parabolic Hop Body */}
                <div
                  className={`
                    relative transition-transform duration-200
                    ${isComputerMoving ? "animate-pawn-hop" : "scale-100"}
                    ${isComputerLadder ? "ring-4 ring-[#fec01f] shadow-[0_0_25px_rgba(254,192,31,0.9)] rounded-full" : ""}
                    ${isComputerSnake ? "ring-4 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.9)] rounded-full" : ""}
                  `}
                  title={`Ava (Square ${computerPosition})`}
                >
                  <GameAvatar type="computer" size="pawn" mood={computerMood} />
                </div>

                {/* Ground Drop Shadow */}
                <span
                  className={`
                    w-4 h-1 sm:w-5 sm:h-1.5 bg-black/60 rounded-full blur-[1px] -mt-0.5
                    ${isComputerMoving ? "animate-pawn-shadow" : "opacity-60"}
                  `}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
