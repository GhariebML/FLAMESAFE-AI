"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
  depth: 1 | 2 | 3;
  kind: "star" | "cyan" | "ember";
}

/**
 * PHASE 3 & 5 — LIVING ORBITAL SPACE ENVIRONMENT
 * 5-Layer GPU-lightweight orbital research backdrop:
 * - Layer 1: Deep Space Obsidian Base (#080A0F)
 * - Layer 2: 3-Depth Starfield with slow microgravity drift & subtle pointer parallax
 * - Layer 3: Distant Nebula & Earth Horizon Atmospheric Glow
 * - Layer 4: Orbital Signals & Trajectory Arcs
 * - Layer 5: Route-Aware Intensity (quieter on /evidence & /insights, coordinate grid on /compare, neural pulse on /research)
 * Automatically pauses when tab is hidden and honors prefers-reduced-motion.
 */
export const SpaceMotionBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname() || "/";

  const isQuietReadingRoute =
    pathname.startsWith("/evidence") || pathname.startsWith("/insights");
  const isObservatoryRoute = pathname.startsWith("/compare");
  const isAILabRoute = pathname.startsWith("/research");
  const isHomeRoute = pathname === "/";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mediaQuery.matches;
    let isTabHidden = document.hidden;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Subtle pointer parallax target & smoothed offset
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const particles: StarParticle[] = [];
    const PARTICLE_COUNT = isQuietReadingRoute ? 52 : 84;
    const LINK_DISTANCE = isAILabRoute ? 128 : 112;
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
    let nextStreakAt = performance.now() + 3400;

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const roll = Math.random();
        const kind: StarParticle["kind"] =
          roll < 0.09 ? "ember" : roll < 0.34 ? "cyan" : "star";
        const depthRoll = Math.random();
        const depth: 1 | 2 | 3 = depthRoll < 0.5 ? 1 : depthRoll < 0.82 ? 2 : 3;

        const speedMultiplier = depth === 1 ? 0.55 : depth === 2 ? 0.85 : 1.2;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.35) * 0.14 * speedMultiplier,
          vy: -(Math.random() * 0.12 + 0.03) * speedMultiplier,
          radius:
            kind === "ember"
              ? (Math.random() * 1.4 + 0.9) * (depth * 0.38)
              : (Math.random() * 1.15 + 0.45) * (depth * 0.36),
          alpha: (Math.random() * 0.5 + 0.22) * (isQuietReadingRoute ? 0.72 : 1),
          twinkleSpeed: Math.random() * 0.016 + 0.005,
          phase: Math.random() * Math.PI * 2,
          depth,
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

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion || width === 0 || height === 0) return;
      const nx = (e.clientX / width - 0.5) * 2;
      const ny = (e.clientY / height - 0.5) * 2;
      targetParallaxX = nx * 12;
      targetParallaxY = ny * 8;
    };

    const onVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden && !reducedMotion && !animationFrameId) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (!reducedMotion && !isTabHidden && !animationFrameId) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    mediaQuery.addEventListener("change", onMotionChange);

    const isDark = resolvedTheme === "dark";

    const renderFrame = (time: number) => {
      animationFrameId = 0;
      ctx.clearRect(0, 0, width, height);

      if (!reducedMotion) {
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;
      }

      for (const p of particles) {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += p.twinkleSpeed;

          if (p.x < -16) p.x = width + 16;
          if (p.x > width + 16) p.x = -16;
          if (p.y < -16) p.y = height + 16;
          if (p.y > height + 16) p.y = -16;
        }

        const parallaxFactor = p.depth === 1 ? 0.35 : p.depth === 2 ? 0.7 : 1.15;
        const drawX = p.x + currentParallaxX * parallaxFactor;
        const drawY = p.y + currentParallaxY * parallaxFactor;

        const twinkle = reducedMotion
          ? 1
          : 0.68 + 0.32 * Math.sin(p.phase + time * 0.00038);
        const opacity = Math.max(0.08, p.alpha * twinkle);

        if (isDark) {
          if (p.kind === "ember") {
            ctx.fillStyle = `rgba(255, 107, 36, ${opacity * 0.85})`;
          } else if (p.kind === "cyan") {
            ctx.fillStyle = `rgba(57, 185, 235, ${opacity * 0.88})`;
          } else {
            ctx.fillStyle = `rgba(247, 247, 245, ${opacity * 0.76})`;
          }
        } else {
          if (p.kind === "ember") {
            ctx.fillStyle = `rgba(233, 75, 22, ${Math.min(0.7, opacity * 0.85)})`;
          } else if (p.kind === "cyan") {
            ctx.fillStyle = `rgba(0, 110, 219, ${Math.min(0.72, opacity * 0.86)})`;
          } else {
            ctx.fillStyle = `rgba(24, 52, 94, ${Math.min(0.55, opacity * 0.68)})`;
          }
        }

        const drawRadius = isDark ? p.radius : p.radius + 0.3;
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
        ctx.fill();

        if (p.kind !== "star" && p.radius > 1.15) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, drawRadius * 3.0, 0, Math.PI * 2);
          ctx.fillStyle =
            p.kind === "ember"
              ? `rgba(255, 107, 36, ${opacity * 0.13})`
              : `rgba(57, 185, 235, ${opacity * 0.13})`;
          ctx.fill();
        }
      }

      // Micro-Constellation / Neural-Orbital Links (quieter on reading routes)
      if (!isQuietReadingRoute) {
        ctx.lineWidth = 0.7;
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
              const baseLinkAlpha = isAILabRoute ? 0.13 : 0.085;
              ctx.strokeStyle = isDark
                ? `rgba(57, 185, 235, ${baseLinkAlpha * falloff})`
                : `rgba(0, 110, 219, ${0.14 * falloff})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
              links++;
              if (links >= 2) break;
            }
          }
        }
      }

      // Subtle periodic orbital signal / telemetry streak
      if (!reducedMotion && !isQuietReadingRoute) {
        if (!streak && time >= nextStreakAt && width > 320) {
          streak = {
            x: width * (0.15 + Math.random() * 0.55),
            y: height * (0.06 + Math.random() * 0.28),
            vx: 4.8 + Math.random() * 2.2,
            vy: 1.6 + Math.random() * 1.0,
            length: 85 + Math.random() * 50,
            life: 0,
            maxLife: 58,
          };
          nextStreakAt = time + 6500 + Math.random() * 5000;
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
          grad.addColorStop(0, "rgba(57, 185, 235, 0)");
          grad.addColorStop(0.75, `rgba(57, 185, 235, ${0.26 * fade})`);
          grad.addColorStop(1, `rgba(247, 247, 245, ${0.6 * fade})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(streak.x, streak.y);
          ctx.stroke();

          if (streak.life >= streak.maxLife) {
            streak = null;
          }
        }
      }

      if (!reducedMotion && !isTabHidden) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mediaQuery.removeEventListener("change", onMotionChange);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme, isQuietReadingRoute, isAILabRoute]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#080A0F]"
    >
      {/* Layer 1 & 3: Obsidian Deep Space + Route-Aware Atmospheric Nebula Glows */}
      <div
        className={`absolute -top-44 -right-32 h-[34rem] w-[34rem] rounded-full bg-[#FF6B24]/[0.06] blur-3xl animate-space-pulse transition-opacity duration-700 ${
          isQuietReadingRoute ? "opacity-45" : "opacity-100"
        }`}
      />
      <div
        className={`absolute top-[38%] -left-44 h-[30rem] w-[30rem] rounded-full bg-[#39B9EB]/[0.055] blur-3xl animate-space-pulse-delayed transition-opacity duration-700 ${
          isQuietReadingRoute ? "opacity-40" : "opacity-100"
        }`}
      />
      <div className="absolute -bottom-40 right-[16%] h-[24rem] w-[24rem] rounded-full bg-[#006EDB]/[0.055] blur-3xl" />

      {/* Layer 5A: Route-Specific Telemetry Coordinate Grid on Data Observatory (/compare) */}
      {isObservatoryRoute && (
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #39B9EB 1px, transparent 1px), linear-gradient(to bottom, #39B9EB 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      )}

      {/* Layer 4: Rotating SVG Orbital Telemetry Rings & Earth Horizon Arc */}
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isQuietReadingRoute ? "opacity-15" : "opacity-30"
        }`}
      >
        <g transform="translate(880 210)">
          <g className="animate-orbit-slow origin-center">
            <circle
              cx="0"
              cy="0"
              r="240"
              fill="none"
              stroke="#39B9EB"
              strokeOpacity="0.22"
              strokeWidth="1.1"
              strokeDasharray="8 10"
            />
            <circle cx="240" cy="0" r="3.5" fill="#39B9EB" fillOpacity="0.75" />
            <circle cx="-240" cy="0" r="3" fill="#FF6B24" fillOpacity="0.75" />
          </g>
          <g className="animate-orbit-reverse origin-center">
            <ellipse
              cx="0"
              cy="0"
              rx="370"
              ry="150"
              transform="rotate(-22)"
              fill="none"
              stroke="#006EDB"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            <circle cx="330" cy="-126" r="3" fill="#39B9EB" fillOpacity="0.7" />
          </g>
        </g>

        <g transform="translate(180 620)">
          <g className="animate-orbit-reverse origin-center">
            <circle
              cx="0"
              cy="0"
              r="190"
              fill="none"
              stroke="#39B9EB"
              strokeOpacity="0.16"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle cx="0" cy="-190" r="2.8" fill="#FFB547" fillOpacity="0.65" />
          </g>
        </g>

        {/* Subtle Orbital Earth Horizon Arc on Homepage */}
        {isHomeRoute && (
          <path
            d="M -100 790 Q 600 660 1300 790"
            fill="none"
            stroke="#39B9EB"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Layer 2: Live 3-Depth Starfield & Microgravity Ember Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
