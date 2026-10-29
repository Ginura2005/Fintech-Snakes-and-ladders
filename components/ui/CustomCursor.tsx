"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  life: number;
}

const SCALE_MAP: Record<string, number> = {
  default: 1,
  link: 1.55,
  button: 1.9,
  view: 2.35,
  explore: 2.35,
  drag: 2.2,
  close: 1.7,
};

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetRef = useRef({ x: -100, y: -100 });
  const dotPosRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef<Particle[]>([]);
  const isVisibleRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Check for fine pointer device (desktop mice/trackpads)
  useEffect(() => {
    const checkPointer = () => {
      const finePointer =
        window.matchMedia("(pointer: fine)").matches &&
        window.matchMedia("(hover: hover)").matches;
      setEnabled(finePointer);
    };

    checkPointer();

    const fineMql = window.matchMedia("(pointer: fine)");
    const hoverMql = window.matchMedia("(hover: hover)");

    fineMql.addEventListener("change", checkPointer);
    hoverMql.addEventListener("change", checkPointer);

    return () => {
      fineMql.removeEventListener("change", checkPointer);
      hoverMql.removeEventListener("change", checkPointer);
    };
  }, []);

  // Manage class on html element & event listeners for pointer
  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    const updateHoverState = (target: Element | null) => {
      if (!target) {
        setCursorState("default", null);
        return;
      }

      // Check for explicit data-cursor or standard interactive elements
      const cursorEl = target.closest<HTMLElement>("[data-cursor]");
      const linkEl = target.closest<HTMLAnchorElement>("a");
      const buttonEl = target.closest<HTMLButtonElement>("button, [role='button']");

      if (cursorEl) {
        const mode = cursorEl.dataset.cursor || "link";
        const label = cursorEl.dataset.cursorLabel || null;
        setCursorState(mode, label);
      } else if (linkEl) {
        setCursorState("link", null);
      } else if (buttonEl) {
        setCursorState("button", null);
      } else {
        setCursorState("default", null);
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      if (e.target instanceof Element) {
        updateHoverState(e.target);
      }
    };

    const handlePointerOut = (e: PointerEvent) => {
      const related = e.relatedTarget;
      if (!(related instanceof Element) || !related.closest("a, button, [data-cursor], [role='button']")) {
        setCursorState("default", null);
      }
    };

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, [enabled]);

  const setCursorState = (mode: string, label: string | null) => {
    const scale = SCALE_MAP[mode] ?? 1;
    const isEnergetic = mode === "button" || mode === "explore" || mode === "view";

    if (ringRef.current) {
      ringRef.current.style.setProperty("--cursor-scale", String(scale));
      ringRef.current.dataset.mode = mode;
      ringRef.current.dataset.energetic = isEnergetic ? "true" : "false";
    }

    if (labelRef.current) {
      const displayLabel = label || (mode === "view" ? "VIEW" : mode === "explore" ? "EXPLORE" : null);
      labelRef.current.dataset.visible = displayLabel ? "true" : "false";
      labelRef.current.textContent = displayLabel ?? "";
    }
  };

  // Main canvas and position loop
  useEffect(() => {
    if (!enabled) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const handlePointerMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        root.style.opacity = "1";
        dotPosRef.current.x = e.clientX;
        dotPosRef.current.y = e.clientY;
        ringPosRef.current.x = e.clientX;
        ringPosRef.current.y = e.clientY;
      }

      const particles = particlesRef.current;
      const last = particles[particles.length - 1];

      if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 14) {
        particles.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (particles.length > 18) {
          particles.shift();
        }
      }
    };

    const handlePointerLeave = () => {
      isVisibleRef.current = false;
      root.style.opacity = "0";
    };

    const renderLoop = () => {
      const target = targetRef.current;

      // Exact Festival lerp rates: dot = 0.38, ring = 0.16
      dotPosRef.current.x += (target.x - dotPosRef.current.x) * 0.38;
      dotPosRef.current.y += (target.y - dotPosRef.current.y) * 0.38;

      ringPosRef.current.x += (target.x - ringPosRef.current.x) * 0.16;
      ringPosRef.current.y += (target.y - ringPosRef.current.y) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPosRef.current.x}px, ${dotPosRef.current.y}px, 0)`;
      }

      if (ringRef.current) {
        const scale = ringRef.current.style.getPropertyValue("--cursor-scale") || "1";
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) scale(${scale})`;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
      }

      // Draw particle trail
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life -= 0.035;
        if (p.life <= 0) continue;

        const radius = 1.2 + 1.6 * p.life;
        ctx.beginPath();
        ctx.fillStyle = `rgba(254, 192, 31, ${0.18 * p.life})`;
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }

      particlesRef.current = particles.filter((p) => p.life > 0);
      animFrameRef.current = window.requestAnimationFrame(renderLoop);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("resize", resizeCanvas);

    animFrameRef.current = window.requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("resize", resizeCanvas);

      if (animFrameRef.current !== null) {
        window.cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      ref={rootRef}
      className="custom-cursor-root pointer-events-none fixed inset-0 z-[9999] hidden opacity-0 transition-opacity duration-200 md:block"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div
        ref={ringRef}
        className="custom-cursor-ring absolute left-0 top-0 pointer-events-none will-change-transform"
        data-mode="default"
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot absolute left-0 top-0 pointer-events-none will-change-transform"
      />
      <span
        ref={labelRef}
        className="custom-cursor-label absolute left-0 top-0 pointer-events-none"
        data-visible="false"
      />
    </div>
  );
}
