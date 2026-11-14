"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  kind: "star" | "cyan" | "ember";
}

/**
 * Global zero-gravity space motion graphics backdrop.
 * Combines a GPU-lightweight 60fps starfield/microgravity particle canvas
 * with subtle orbital telemetry rings across both Dark ("Mission Control")
 * and Light ("Cleanroom Lab") modes, honoring prefers-reduced-motion.
 */
export const SpaceMotionBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const particles: StarParticle[] = [];
    const PARTICLE_COUNT = 85;
    const LINK_DISTANCE = 118;
    const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;

    interface OrbitalStreak {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      life: number;
      maxLife: number;
    }

    let streak: OrbitalStreak | null = null;
    let nextStreakAt = performance.now() + 2600;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const roll = Math.random();
        const kind: StarParticle["kind"] =
          roll < 0.08 ? "ember" : roll < 0.34 ? "cyan" : "star";

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Gentle zero-gravity drift upward-right
          vx: (Math.random() - 0.35) * 0.16,
          vy: -(Math.random() * 0.14 + 0.04),
          radius:
            kind === "ember"
              ? Math.random() * 1.8 + 1.0
              : Math.random() * 1.4 + 0.5,
          alpha: Math.random() * 0.55 + 0.25,
          twinkleSpeed: Math.random() * 0.018 + 0.006,
          phase: Math.random() * Math.PI * 2,
          kind,
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) initParticles();
    };

    resize();
    window.addEventListener("resize", resize);

    const isDark = resolvedTheme === "dark";

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += p.twinkleSpeed;

          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        const twinkle = reducedMotion ? 1 : 0.65 + 0.35 * Math.sin(p.phase + time * 0.0004);
        const opacity = Math.max(0.08, p.alpha * twinkle);

        if (isDark) {
          if (p.kind === "ember") {
            ctx.fillStyle = `rgba(255, 194, 71, ${opacity * 0.85})`;
          } else if (p.kind === "cyan") {
            ctx.fillStyle = `rgba(98, 201, 245, ${opacity * 0.9})`;
          } else {
            ctx.fillStyle = `rgba(248, 250, 252, ${opacity * 0.78})`;
          }
        } else {
          if (p.kind === "ember") {
            ctx.fillStyle = `rgba(240, 128, 0, ${Math.min(0.72, opacity * 0.85)})`;
          } else if (p.kind === "cyan") {
            ctx.fillStyle = `rgba(0, 145, 225, ${Math.min(0.75, opacity * 0.88)})`;
          } else {
            ctx.fillStyle = `rgba(0, 80, 192, ${Math.min(0.6, opacity * 0.72)})`;
          }
        }

        const drawRadius = isDark ? p.radius : p.radius + 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo on brighter cyan/ember microgravity nodes in both modes
        if (p.kind !== "star" && p.radius > 1.25) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawRadius * 3.1, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? p.kind === "ember"
              ? `rgba(240, 128, 0, ${opacity * 0.14})`
              : `rgba(0, 160, 240, ${opacity * 0.14})`
            : p.kind === "ember"
              ? `rgba(240, 128, 0, ${opacity * 0.16})`
              : `rgba(0, 160, 240, ${opacity * 0.16})`;
          ctx.fill();
        }
      }

      // Simple Micro-Constellation Links between nearby orbital nodes (max 2 per node)
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        let links = 0;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < LINK_DISTANCE_SQ) {
            const falloff = 1 - Math.sqrt(distSq) / LINK_DISTANCE;
            ctx.strokeStyle = isDark
              ? `rgba(98, 201, 245, ${0.1 * falloff})`
              : `rgba(0, 110, 219, ${0.18 * falloff})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            links++;
            if (links >= 2) break;
          }
        }
      }

      // Subtle periodic orbital micro-meteor / telemetry streak
      if (!reducedMotion) {
        if (!streak && time >= nextStreakAt && width > 320) {
          streak = {
            x: width * (0.15 + Math.random() * 0.55),
            y: height * (0.06 + Math.random() * 0.3),
            vx: 5.2 + Math.random() * 2.4,
            vy: 1.8 + Math.random() * 1.1,
            length: 90 + Math.random() * 55,
            life: 0,
            maxLife: 58,
          };
          nextStreakAt = time + 5500 + Math.random() * 4500;
        }

        if (streak) {
          streak.x += streak.vx;
          streak.y += streak.vy;
          streak.life += 1;

          const progress = streak.life / streak.maxLife;
          const fade = Math.sin(progress * Math.PI);
          const mag = Math.hypot(streak.vx, streak.vy) || 1;
          const tailX = streak.x - (streak.vx / mag) * streak.length;
          const tailY = streak.y - (streak.vy / mag) * streak.length;

          const grad = ctx.createLinearGradient(tailX, tailY, streak.x, streak.y);
          if (isDark) {
            grad.addColorStop(0, "rgba(0, 160, 240, 0)");
            grad.addColorStop(0.75, `rgba(98, 201, 245, ${0.28 * fade})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${0.65 * fade})`);
          } else {
            grad.addColorStop(0, "rgba(0, 110, 219, 0)");
            grad.addColorStop(0.78, `rgba(0, 160, 240, ${0.32 * fade})`);
            grad.addColorStop(1, `rgba(0, 80, 192, ${0.55 * fade})`);
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(streak.x, streak.y);
          ctx.stroke();

          if (streak.life >= streak.maxLife) {
            streak = null;
          }
        }
      }

      if (!reducedMotion) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Atmospheric Black Fire Lab / Cleanroom Orbital Glow */}
      <div className="absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-brand-cyan/15 dark:bg-[#FF6B24]/[0.07] blur-3xl animate-space-pulse" />
      <div className="absolute top-[42%] -left-40 h-[28rem] w-[28rem] rounded-full bg-brand-blue/15 dark:bg-[#39B9EB]/[0.06] blur-3xl animate-space-pulse-delayed" />
      <div className="absolute -bottom-36 right-[18%] h-[22rem] w-[22rem] rounded-full bg-brand-flame-orange/10 dark:bg-[#006EDB]/[0.06] blur-3xl" />

      {/* Rotating SVG Orbital Telemetry Rings */}
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-70 dark:opacity-35"
      >
        <g transform="translate(880 210)">
          <g className="animate-orbit-slow origin-center">
            <circle
              cx="0"
              cy="0"
              r="240"
              fill="none"
              stroke="currentColor"
              className="text-brand-blue/25 dark:text-brand-cyan/20"
              strokeWidth="1.2"
              strokeDasharray="8 10"
            />
            <circle cx="240" cy="0" r="4" className="fill-brand-cyan/85 dark:fill-brand-cyan/75" />
            <circle cx="-240" cy="0" r="3" className="fill-brand-flame-orange/80 dark:fill-brand-flame-orange/75" />
          </g>
          <g className="animate-orbit-reverse origin-center">
            <ellipse
              cx="0"
              cy="0"
              rx="370"
              ry="150"
              transform="rotate(-22)"
              fill="none"
              stroke="currentColor"
              className="text-brand-intelligent/25 dark:text-brand-light-cyan/15"
              strokeWidth="1"
            />
            <circle cx="330" cy="-126" r="3.5" className="fill-brand-blue/75 dark:fill-brand-light-cyan/80" />
          </g>
        </g>

        <g transform="translate(180 620)">
          <g className="animate-orbit-reverse origin-center">
            <circle
              cx="0"
              cy="0"
              r="190"
              fill="none"
              stroke="currentColor"
              className="text-brand-cyan/30 dark:text-brand-cyan/15"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle cx="0" cy="-190" r="3" className="fill-brand-intelligent/75 dark:fill-brand-light-cyan/70" />
          </g>
        </g>
      </svg>

      {/* Live 60fps Starfield & Microgravity Ember Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
