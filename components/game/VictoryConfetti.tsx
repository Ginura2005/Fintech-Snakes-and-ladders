"use client";

import { useEffect, useRef } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "diamond";
  alpha: number;
}

const FESTIVAL_COLORS = [
  "#FEC01F", // Festival Gold
  "#F57222", // Electric Orange
  "#1CA085", // Bright Ceylon Teal
  "#125252", // Deep Teal
  "#8D1739", // Royal Burgundy
  "#FFFFFF",
];

export default function VictoryConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: ConfettiParticle[] = [];
    const count = Math.min(120, Math.floor(width / 12));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.4 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 9 + 6,
        color: FESTIVAL_COLORS[Math.floor(Math.random() * FESTIVAL_COLORS.length)],
        shape: Math.random() > 0.6 ? "diamond" : Math.random() > 0.3 ? "rect" : "circle",
        alpha: 1,
      });
    }

    const startTime = Date.now();
    const duration = 5000;

    const render = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38; // Gravity
        p.vx *= 0.985; // Air resistance
        p.rot += p.vRot;

        if (progress > 0.65) {
          p.alpha = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "diamond") {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, 0);
          ctx.lineTo(0, p.size / 2);
          ctx.lineTo(-p.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
