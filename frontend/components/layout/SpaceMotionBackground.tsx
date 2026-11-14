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
  kind: "star" | "cyan" | "ember" | "gold";
  hasFlare: boolean;
}

/**
 * PHASE 3 & 5 — LIVING ORBITAL SPACE ENVIRONMENT (ENHANCED STARFIELD MOTION GRAPHICS)
 * 5-Layer GPU-lightweight orbital research backdrop:
 * - Layer 1: Deep Space Obsidian Base (#080A0F)
 * - Layer 2: Multi-Depth Twinkling Starfield with Diffraction Spikes & Zero-G Drift
 * - Layer 3: Distant Nebula & Earth Horizon Atmospheric Glow
 * - Layer 4: Rotating Orbital Telemetry Rings & Satellites
 * - Layer 5: Periodic Shooting Stars & Neural-Orbital Constellation Links
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

    interface OrbitalStreak {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      life: number;
      maxLife: number;
      color: "cyan" | "amber";
    }

    const streaks: OrbitalStreak[] = [];
    let nextStreakAt = performance.now() + 1400;

    const initParticles = () => {
      particles.length = 0;
      const isMobile = width < 768;
      const baseCount = isMobile ? 96 : 165;
      const count = isQuietReadingRoute ? Math.floor(baseCount * 0.72) : baseCount;

      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const kind: StarParticle["kind"] =
          roll < 0.11
            ? "ember"
            : roll < 0.24
            ? "gold"
            : roll < 0.52
            ? "cyan"
            : "star";

        const depthRoll = Math.random();
        const depth: 1 | 2 | 3 = depthRoll < 0.42 ? 1 : depthRoll < 0.78 ? 2 : 3;
        const speedMultiplier = depth === 1 ? 0.65 : depth === 2 ? 1.15 : 1.75;

        const radius =
          kind === "ember" || kind === "gold"
            ? (Math.random() * 1.55 + 0.95) * (depth * 0.42)
            : (Math.random() * 1.45 + 0.65) * (depth * 0.4);

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.32) * 0.28 * speedMultiplier,
          vy: -(Math.random() * 0.24 + 0.06) * speedMultiplier,
          radius,
          alpha: (Math.random() * 0.52 + 0.38) * (isQuietReadingRoute ? 0.8 : 1),
          twinkleSpeed: Math.random() * 0.032 + 0.012,
          phase: Math.random() * Math.PI * 2,
          depth,
          kind,
          hasFlare: depth === 3 && ( radius > 1.25 || i % 7 === 0 ),
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
      initParticles();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion || width === 0 || height === 0) return;
      const nx = (e.clientX / width - 0.5) * 2;
      const ny = (e.clientY / height - 0.5) * 2;
      targetParallaxX = nx * 18;
      targetParallaxY = ny * 12;
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
    const LINK_DISTANCE = isAILabRoute ? 135 : 118;
    const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;

    const drawStarFlare = (
      cx: number,
      cy: number,
      armLength: number,
      colorRgb: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.strokeStyle = `rgba(${colorRgb}, ${alpha})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - armLength, cy);
      ctx.lineTo(cx + armLength, cy);
      ctx.moveTo(cx, cy - armLength);
      ctx.lineTo(cx, cy + armLength);
      ctx.stroke();
      ctx.restore();
    };

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

          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        }

        const parallaxFactor = p.depth === 1 ? 0.35 : p.depth === 2 ? 0.75 : 1.25;
        const drawX = p.x + currentParallaxX * parallaxFactor;
        const drawY = p.y + currentParallaxY * parallaxFactor;

        const twinkle = reducedMotion
          ? 1
          : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(p.phase + time * 0.0012));
        const opacity = Math.max(0.14, Math.min(1, p.alpha * twinkle));

        let rgb = "247, 247, 245";
        if (isDark) {
          if (p.kind === "ember") rgb = "255, 107, 36";
          else if (p.kind === "gold") rgb = "255, 181, 71";
          else if (p.kind === "cyan") rgb = "57, 185, 235";
          else rgb = "247, 247, 245";
        } else {
          if (p.kind === "ember") rgb = "233, 75, 22";
          else if (p.kind === "gold") rgb = "217, 119, 6";
          else if (p.kind === "cyan") rgb = "0, 110, 219";
          else rgb = "24, 52, 94";
        }

        const drawRadius = isDark ? p.radius : p.radius + 0.3;

        // Soft outer halo for brighter stars and embers
        if (p.depth >= 2) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, drawRadius * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${opacity * 0.18})`;
          ctx.fill();
        }

        // Core star point
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${opacity * 0.95})`;
        ctx.fill();

        // 4-point diffraction starlight flare on prime stars
        if (p.hasFlare && twinkle > 0.62) {
          const flareLen = drawRadius * (3.6 + twinkle * 2.4);
          drawStarFlare(drawX, drawY, flareLen, rgb, opacity * 0.52);
        }
      }

      // Micro-Constellation / Neural-Orbital Links
      if (!isQuietReadingRoute) {
        ctx.lineWidth = 0.75;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          if (a.depth === 1) continue;
          let links = 0;
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            if (b.depth === 1) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < LINK_DISTANCE_SQ) {
              const falloff = 1 - Math.sqrt(distSq) / LINK_DISTANCE;
              const baseLinkAlpha = isAILabRoute ? 0.18 : 0.12;
              ctx.strokeStyle = isDark
                ? `rgba(57, 185, 235, ${baseLinkAlpha * falloff})`
                : `rgba(0, 110, 219, ${0.15 * falloff})`;
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

      // Periodic Shooting Stars / Orbital Telemetry Streaks
      if (!reducedMotion && !isQuietReadingRoute) {
        if (streaks.length < 2 && time >= nextStreakAt && width > 300) {
          streaks.push({
            x: width * (0.08 + Math.random() * 0.65),
            y: height * (0.04 + Math.random() * 0.38),
            vx: 5.5 + Math.random() * 3.0,
            vy: 1.8 + Math.random() * 1.4,
            length: 95 + Math.random() * 65,
            life: 0,
            maxLife: 54,
            color: Math.random() < 0.35 ? "amber" : "cyan",
          });
          nextStreakAt = time + 2800 + Math.random() * 3200;
        }

        for (let sIdx = streaks.length - 1; sIdx >= 0; sIdx--) {
          const st = streaks[sIdx];
          st.x += st.vx;
          st.y += st.vy;
          st.life += 1;

          const progress = st.life / st.maxLife;
          const fade = Math.sin(progress * Math.PI);
          const mag = Math.hypot(st.vx, st.vy) || 1;
          const tailX = st.x - (st.vx / mag) * st.length;
          const tailY = st.y - (st.vy / mag) * st.length;

          const grad = ctx.createLinearGradient(tailX, tailY, st.x, st.y);
          const tailRgb = st.color === "amber" ? "255, 181, 71" : "57, 185, 235";
          grad.addColorStop(0, `rgba(${tailRgb}, 0)`);
          grad.addColorStop(0.7, `rgba(${tailRgb}, ${0.42 * fade})`);
          grad.addColorStop(1, `rgba(247, 247, 245, ${0.85 * fade})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(st.x, st.y);
          ctx.stroke();

          // Glowing head of the shooting star
          ctx.beginPath();
          ctx.arc(st.x, st.y, 2.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(247, 247, 245, ${0.9 * fade})`;
          ctx.fill();

          if (st.life >= st.maxLife) {
            streaks.splice(sIdx, 1);
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
        className={`absolute -top-40 -right-28 h-[36rem] w-[36rem] rounded-full bg-[#FF6B24]/[0.08] blur-3xl animate-space-pulse transition-opacity duration-700 ${
          isQuietReadingRoute ? "opacity-50" : "opacity-100"
        }`}
      />
      <div
        className={`absolute top-[34%] -left-40 h-[32rem] w-[32rem] rounded-full bg-[#39B9EB]/[0.075] blur-3xl animate-space-pulse-delayed transition-opacity duration-700 ${
          isQuietReadingRoute ? "opacity-45" : "opacity-100"
        }`}
      />
      <div className="absolute -bottom-36 right-[14%] h-[28rem] w-[28rem] rounded-full bg-[#006EDB]/[0.07] blur-3xl" />

      {/* Layer 5A: Route-Specific Telemetry Coordinate Grid on Data Observatory (/compare) */}
      {isObservatoryRoute && (
        <div
          className="absolute inset-0 opacity-[0.055]"
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
          isQuietReadingRoute ? "opacity-25" : "opacity-45"
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
              strokeOpacity="0.28"
              strokeWidth="1.2"
              strokeDasharray="8 10"
            />
            <circle cx="240" cy="0" r="4" fill="#39B9EB" fillOpacity="0.85" />
            <circle cx="-240" cy="0" r="3.5" fill="#FF6B24" fillOpacity="0.85" />
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
              strokeOpacity="0.26"
              strokeWidth="1.1"
            />
            <circle cx="330" cy="-126" r="3.5" fill="#39B9EB" fillOpacity="0.8" />
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
              strokeOpacity="0.22"
              strokeWidth="1.1"
              strokeDasharray="4 8"
            />
            <circle cx="0" cy="-190" r="3.2" fill="#FFB547" fillOpacity="0.8" />
          </g>
        </g>

        {/* Subtle Orbital Earth Horizon Arc on Homepage */}
        {isHomeRoute && (
          <path
            d="M -100 790 Q 600 660 1300 790"
            fill="none"
            stroke="#39B9EB"
            strokeOpacity="0.24"
            strokeWidth="1.6"
          />
        )}
      </svg>

      {/* Layer 2: Live 3-Depth Starfield, Diffraction Spikes & Shooting Stars Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
