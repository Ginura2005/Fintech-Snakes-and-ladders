"use client";

import React from "react";
import { BOARD_CONFIG } from "@/lib/game-engine/board-config";

/**
 * Grid coordinates in 1000x1000 viewBox:
 * 5 columns (0..4), 5 rows (0..4).
 * Col width = 200, row height = 200.
 * Center of (col, row) = (col * 200 + 100, row * 200 + 100)
 */
export const SQUARE_CENTERS: Record<number, { x: number; y: number; col: number; row: number }> = {
  // Row 4 (bottom): 1 -> 5
  1: { col: 0, row: 4, x: 100, y: 900 },
  2: { col: 1, row: 4, x: 300, y: 900 },
  3: { col: 2, row: 4, x: 500, y: 900 },
  4: { col: 3, row: 4, x: 700, y: 900 },
  5: { col: 4, row: 4, x: 900, y: 900 },
  // Row 3: 10 <- 6
  6: { col: 4, row: 3, x: 900, y: 700 },
  7: { col: 3, row: 3, x: 700, y: 700 },
  8: { col: 2, row: 3, x: 500, y: 700 },
  9: { col: 1, row: 3, x: 300, y: 700 },
  10: { col: 0, row: 3, x: 100, y: 700 },
  // Row 2: 11 -> 15
  11: { col: 0, row: 2, x: 100, y: 500 },
  12: { col: 1, row: 2, x: 300, y: 500 },
  13: { col: 2, row: 2, x: 500, y: 500 },
  14: { col: 3, row: 2, x: 700, y: 500 },
  15: { col: 4, row: 2, x: 900, y: 500 },
  // Row 1: 20 <- 16
  16: { col: 4, row: 1, x: 900, y: 300 },
  17: { col: 3, row: 1, x: 700, y: 300 },
  18: { col: 2, row: 1, x: 500, y: 300 },
  19: { col: 1, row: 1, x: 300, y: 300 },
  20: { col: 0, row: 1, x: 100, y: 300 },
  // Row 0 (top): 21 -> 25
  21: { col: 0, row: 0, x: 100, y: 100 },
  22: { col: 1, row: 0, x: 300, y: 100 },
  23: { col: 2, row: 0, x: 500, y: 100 },
  24: { col: 3, row: 0, x: 700, y: 100 },
  25: { col: 4, row: 0, x: 900, y: 100 },
};

interface BoardSvgOverlayProps {
  activeLadder?: number | null;
  activeSnake?: number | null;
}

export default function BoardSvgOverlay({
  activeLadder,
  activeSnake,
}: BoardSvgOverlayProps) {
  // Build serpentine track path
  const serpentinePath = `
    M 100 900 
    L 900 900 
    C 960 900, 960 700, 900 700 
    L 100 700 
    C 40 700, 40 500, 100 500 
    L 900 500 
    C 960 500, 960 300, 900 300 
    L 100 300 
    C 40 300, 40 100, 100 100 
    L 900 100
  `;

  return (
    <svg
      viewBox="0 0 1000 1000"
      className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible select-none"
      aria-hidden="true"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="ladderGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2dd4bf" floodOpacity="0.6" />
        </filter>
        <filter id="activeLadderGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#fec01f" floodOpacity="0.9" />
        </filter>
        <filter id="snakeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.7" />
        </filter>
        <filter id="activeSnakeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#fb7185" floodOpacity="0.95" />
        </filter>

        {/* Gradients */}
        <linearGradient id="goldLadder" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#125252" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#fec01f" />
        </linearGradient>

        <linearGradient id="majorSnakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#8d1739" />
          <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>

        <linearGradient id="ordinarySnakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>

      {/* ── 1. Serpentine Track Guide ── */}
      <path
        d={serpentinePath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10 14"
      />

      {/* ── 2. Visual Ladders ── */}
      {BOARD_CONFIG.ladders.map((ladder) => {
        const p1 = SQUARE_CENTERS[ladder.from];
        const p2 = SQUARE_CENTERS[ladder.to];
        if (!p1 || !p2) return null;

        const isActive = activeLadder === ladder.from;

        // Vector calculations
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return null;

        // Normal unit vector
        const nx = -dy / len;
        const ny = dx / len;
        const railHalfWidth = 14;

        // Left and Right rails
        const lx1 = p1.x + nx * railHalfWidth;
        const ly1 = p1.y + ny * railHalfWidth;
        const lx2 = p2.x + nx * railHalfWidth;
        const ly2 = p2.y + ny * railHalfWidth;

        const rx1 = p1.x - nx * railHalfWidth;
        const ry1 = p1.y - ny * railHalfWidth;
        const rx2 = p2.x - nx * railHalfWidth;
        const ry2 = p2.y - ny * railHalfWidth;

        // Calculate rungs along ladder length
        const rungStep = 32;
        const numRungs = Math.max(3, Math.floor(len / rungStep));
        const rungs = [];
        for (let i = 1; i < numRungs; i++) {
          const t = i / numRungs;
          const rLx = lx1 + (lx2 - lx1) * t;
          const rLy = ly1 + (ly2 - ly1) * t;
          const rRx = rx1 + (rx2 - rx1) * t;
          const rRy = ry1 + (ry2 - ry1) * t;
          rungs.push({ x1: rLx, y1: rLy, x2: rRx, y2: rRy, key: i });
        }

        return (
          <g
            key={`ladder-${ladder.from}-${ladder.to}`}
            filter={isActive ? "url(#activeLadderGlow)" : "url(#ladderGlow)"}
            className="transition-all duration-300"
          >
            {/* Rails */}
            <line
              x1={lx1}
              y1={ly1}
              x2={lx2}
              y2={ly2}
              stroke={isActive ? "#fec01f" : "url(#goldLadder)"}
              strokeWidth={isActive ? 6 : 4.5}
              strokeLinecap="round"
            />
            <line
              x1={rx1}
              y1={ry1}
              x2={rx2}
              y2={ry2}
              stroke={isActive ? "#fec01f" : "url(#goldLadder)"}
              strokeWidth={isActive ? 6 : 4.5}
              strokeLinecap="round"
            />

            {/* Rungs */}
            {rungs.map((rung) => (
              <line
                key={rung.key}
                x1={rung.x1}
                y1={rung.y1}
                x2={rung.x2}
                y2={rung.y2}
                stroke={isActive ? "#fec01f" : "#5eead4"}
                strokeWidth={isActive ? 4 : 3}
                strokeLinecap="round"
                opacity={isActive ? 1 : 0.85}
              />
            ))}

            {/* Bottom Base Anchor Ring */}
            <circle
              cx={p1.x}
              cy={p1.y}
              r={10}
              fill="#125252"
              stroke="#2dd4bf"
              strokeWidth={2.5}
            />
            {/* Top Landing Anchor Ring */}
            <circle
              cx={p2.x}
              cy={p2.y}
              r={12}
              fill="#fec01f"
              stroke="#fff"
              strokeWidth={2}
            />
          </g>
        );
      })}

      {/* ── 3. Visual Snakes ── */}
      {BOARD_CONFIG.snakes.map((snake) => {
        const head = SQUARE_CENTERS[snake.from];
        const tail = SQUARE_CENTERS[snake.to];
        if (!head || !tail) return null;

        const isMajor = snake.type === "major";
        const isActive = activeSnake === snake.from;
        const grad = isMajor ? "url(#majorSnakeGrad)" : "url(#ordinarySnakeGrad)";

        // Generate curved serpentine bezier path from head to tail
        const dx = tail.x - head.x;
        const dy = tail.y - head.y;
        const dist = Math.hypot(dx, dy);

        // Perpendicular offset for wave curve
        const nx = -dy / dist;
        const ny = dx / dist;

        // Wave amplitude
        const amp = Math.min(60, dist * 0.22);
        const c1x = head.x + dx * 0.33 + nx * amp;
        const c1y = head.y + dy * 0.33 + ny * amp;
        const c2x = head.x + dx * 0.66 - nx * amp;
        const c2y = head.y + dy * 0.66 - ny * amp;

        const snakeBodyPath = `M ${head.x} ${head.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tail.x} ${tail.y}`;

        // Angle of head
        const headAngle = (Math.atan2(c1y - head.y, c1x - head.x) * 180) / Math.PI;

        return (
          <g
            key={`snake-${snake.from}-${snake.to}`}
            filter={isActive ? "url(#activeSnakeGlow)" : "url(#snakeShadow)"}
            className="transition-all duration-300"
          >
            {/* Under-shadow for depth */}
            <path
              d={snakeBodyPath}
              fill="none"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={isMajor ? 24 : 18}
              strokeLinecap="round"
              transform="translate(0, 4)"
            />

            {/* Snake Main Body */}
            <path
              d={snakeBodyPath}
              fill="none"
              stroke={grad}
              strokeWidth={isMajor ? 18 : 14}
              strokeLinecap="round"
            />

            {/* Snake Scale Pattern / Dorsal Highlight */}
            <path
              d={snakeBodyPath}
              fill="none"
              stroke={isMajor ? "#fec01f" : "#fef08a"}
              strokeWidth="3.5"
              strokeDasharray="6 10"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Snake Head */}
            <g transform={`translate(${head.x}, ${head.y}) rotate(${headAngle})`}>
              {/* Flicking Forked Tongue */}
              <path
                d="M 12 0 L 22 -4 M 12 0 L 22 4"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Head Base */}
              <ellipse
                cx="4"
                cy="0"
                rx={isMajor ? 14 : 11}
                ry={isMajor ? 10 : 8}
                fill={isMajor ? "#8d1739" : "#c2410c"}
                stroke={isMajor ? "#fb7185" : "#f97316"}
                strokeWidth="2"
              />
              {/* Eyes */}
              <circle cx="6" cy="-4" r="2.5" fill="#fec01f" />
              <circle cx="6" cy="4" r="2.5" fill="#fec01f" />
              <circle cx="7" cy="-4" r="1.2" fill="#000" />
              <circle cx="7" cy="4" r="1.2" fill="#000" />
            </g>

            {/* Snake Tapered Tail */}
            <circle
              cx={tail.x}
              cy={tail.y}
              r={isMajor ? 5 : 4}
              fill={isMajor ? "#4c0519" : "#7c2d12"}
              stroke={isMajor ? "#f43f5e" : "#ea580c"}
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
}
