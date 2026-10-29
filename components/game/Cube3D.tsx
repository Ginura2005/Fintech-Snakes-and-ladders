"use client";

import React, { useRef, useState, useEffect } from "react";

export interface ThrowPhysics {
  speed: number; // 0.7 (slow) to 1.8 (hard flick)
  tilt: number;  // -30deg (left roll) to +30deg (right roll)
  arc: number;   // -15px to -50px (vertical height)
  dur: number;   // 0.22s to 0.4s
}

interface Cube3DProps {
  value: number | null;
  isRolling: boolean;
  size?: number; // Size in pixels (e.g. 54, 80, 96)
  color?: "teal" | "burgundy";
  clickable?: boolean;
  onClick?: () => void;
  onThrow?: (physics: ThrowPhysics) => void;
  className?: string;
  tiltAngle?: number;
}

const DOT_POSITIONS: Record<number, string[]> = {
  1: ["col-start-2 row-start-2"],
  2: ["col-start-1 row-start-1", "col-start-3 row-start-3"],
  3: ["col-start-1 row-start-1", "col-start-2 row-start-2", "col-start-3 row-start-3"],
  4: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
  5: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-2 row-start-2",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
  6: [
    "col-start-1 row-start-1",
    "col-start-3 row-start-1",
    "col-start-1 row-start-2",
    "col-start-3 row-start-2",
    "col-start-1 row-start-3",
    "col-start-3 row-start-3",
  ],
};

// Target cube container rotation angles to bring face N squarely to the front (+Z)
// 720deg (2 full revolutions) adds physical spin momentum before landing
const TARGET_ANGLES: Record<number, { x: number; y: number }> = {
  1: { x: 720, y: 720 },
  2: { x: 630, y: 720 },
  3: { x: 720, y: 630 },
  4: { x: 720, y: 810 },
  5: { x: 810, y: 720 },
  6: { x: 720, y: 900 },
};

function DiePipFace({
  faceNumber,
  size,
  halfSize,
  transform,
  isTeal,
}: {
  faceNumber: number;
  size: number;
  halfSize: number;
  transform: string;
  isTeal: boolean;
}) {
  const dots = DOT_POSITIONS[faceNumber] || [];
  const pipSize = Math.max(6, Math.round(size * 0.18));

  const faceBorder = isTeal
    ? "border-[#fec01f]/85 bg-gradient-to-br from-[#1b6b6b] via-[#0b292e] to-[#041114]"
    : "border-rose-400/85 bg-gradient-to-br from-[#9b1c40] via-[#3a081c] to-[#120208]";

  const pipColor = isTeal
    ? "bg-[#fec01f] shadow-[inset_1px_1.5px_2px_rgba(0,0,0,0.9),0_0_8px_rgba(254,192,31,0.9)]"
    : "bg-[#fb7185] shadow-[inset_1px_1.5px_2px_rgba(0,0,0,0.9),0_0_8px_rgba(251,113,133,0.9)]";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      className={`
        absolute inset-0 rounded-3xl border-2 ${faceBorder}
        shadow-[inset_2px_2px_4px_rgba(255,255,255,0.35),inset_-3px_-3px_5px_rgba(0,0,0,0.8),0_0_15px_rgba(0,0,0,0.7)]
        flex items-center justify-center p-2 sm:p-2.5 select-none
        before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-gradient-to-b before:from-white/18 before:to-transparent before:rounded-t-3xl before:pointer-events-none
      `}
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full items-center justify-items-center">
        {dots.map((pos, idx) => (
          <div
            key={idx}
            style={{ width: `${pipSize}px`, height: `${pipSize}px` }}
            className={`rounded-full ${pipColor} ${pos}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Cube3D({
  value,
  isRolling,
  size = 80,
  color = "teal",
  clickable = false,
  onClick,
  onThrow,
  className = "",
  tiltAngle = 0,
}: Cube3DProps) {
  const isTeal = color === "teal";
  const half = Math.round(size / 2);
  const displayVal = value || 1;
  const target = TARGET_ANGLES[displayVal] || TARGET_ANGLES[1];

  // Dynamic throw rotation & physics
  const [rotations, setRotations] = useState<{ x: number; y: number }>({
    x: target.x,
    y: target.y,
  });

  const [hasLanded, setHasLanded] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (isRolling) {
      setHasLanded(false);
    } else if (value) {
      const angles = TARGET_ANGLES[value] || TARGET_ANGLES[1];
      setRotations({ x: angles.x, y: angles.y });
      setHasLanded(true);
      const timer = setTimeout(() => setHasLanded(false), 720);
      return () => clearTimeout(timer);
    }
  }, [isRolling, value]);

  // Pointer / Touch Swipe-to-Throw gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!clickable || isRolling) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    // Bound drag offset for tactile tilt feel
    setDragOffset({
      x: Math.max(-25, Math.min(25, dx * 0.4)),
      y: Math.max(-25, Math.min(25, dy * 0.4)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!clickable || isRolling) return;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!start) {
      onClick?.();
      return;
    }

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = Math.max(30, Date.now() - start.time);
    const dist = Math.hypot(dx, dy);

    let physics: ThrowPhysics;

    if (dist > 8) {
      // User swiped / flicked the 3D cube!
      const rawSpeed = (dist / dt) * 1.5;
      const speed = Math.min(1.4, Math.max(0.7, rawSpeed));
      // Side roll tilt from horizontal swipe
      const tilt = Math.max(-24, Math.min(24, (dx / 5) * 1.2));
      // Upward throw arc
      const arc = -Math.round(20 + Math.min(18, speed * 8));
      // Slow, smooth, perceptible tumble duration
      const dur = Math.max(0.7, Math.min(1.05, 0.85 / speed));

      physics = { speed, tilt, arc, dur };
    } else {
      // Crisp gentle direct tap
      physics = { speed: 1.0, tilt: 10, arc: -24, dur: 0.85 };
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    if (onThrow) {
      onThrow(physics);
    } else {
      onClick?.();
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    pointerStartRef.current = null;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        perspective: "800px",
      }}
      className={`relative select-none shrink-0 touch-none ${
        clickable ? "cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95" : ""
      } ${className}`}
      title={clickable ? "Swipe hard, gentle, or sideways to throw 3D cube!" : undefined}
    >
      {/* 3D Cube Container */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transformStyle: "preserve-3d",
          transform: isRolling
            ? undefined
            : `rotateX(${rotations.x - dragOffset.y * 1.2}deg) rotateY(${rotations.y + dragOffset.x * 1.2}deg) rotateZ(${tiltAngle}deg)`,
          transition: isRolling
            ? "none"
            : isDragging
            ? "transform 0.05s ease-out"
            : "transform 0.72s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`relative w-full h-full ${isRolling ? "animate-dice-tumble" : ""} ${
          hasLanded ? "scale-105" : "scale-100"
        }`}
      >
        {/* Face 1 (Front) */}
        <DiePipFace
          faceNumber={1}
          size={size}
          halfSize={half}
          transform={`rotateY(0deg) translateZ(${half}px)`}
          isTeal={isTeal}
        />
        {/* Face 6 (Back) */}
        <DiePipFace
          faceNumber={6}
          size={size}
          halfSize={half}
          transform={`rotateY(180deg) translateZ(${half}px)`}
          isTeal={isTeal}
        />
        {/* Face 3 (Right) */}
        <DiePipFace
          faceNumber={3}
          size={size}
          halfSize={half}
          transform={`rotateY(90deg) translateZ(${half}px)`}
          isTeal={isTeal}
        />
        {/* Face 4 (Left) */}
        <DiePipFace
          faceNumber={4}
          size={size}
          halfSize={half}
          transform={`rotateY(-90deg) translateZ(${half}px)`}
          isTeal={isTeal}
        />
        {/* Face 2 (Top) */}
        <DiePipFace
          faceNumber={2}
          size={size}
          halfSize={half}
          transform={`rotateX(90deg) translateZ(${half}px)`}
          isTeal={isTeal}
        />
        {/* Face 5 (Bottom) */}
        <DiePipFace
          faceNumber={5}
          size={size}
          halfSize={half}
          transform={`rotateX(-90deg) translateZ(${half}px)`}
          isTeal={isTeal}
        />
      </div>

      {/* Tabletop Ground Shadow */}
      <div
        style={{
          width: `${Math.round(size * 1.15)}px`,
          height: `${Math.round(size * 0.28)}px`,
          bottom: `-${Math.round(size * 0.18)}px`,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        className={`
          absolute rounded-full bg-black/75 blur-[4px] pointer-events-none transition-all duration-200
          ${isRolling ? "scale-75 opacity-30" : "scale-100 opacity-80"}
        `}
      />
    </div>
  );
}
