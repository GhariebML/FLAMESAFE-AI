"use client";

import React from "react";

interface FlameSafeMascotFallbackProps {
  className?: string;
  label?: string;
}

/**
 * High-craft 2.5D SVG + image fallback of the Astro-Flame Bot mascot
 * (white rounded helmet, dark visor screen, glowing cyan LED eyes & smile,
 * dual orange-gold & cyan-plasma flame crown, floating over Earth horizon).
 */
export const FlameSafeMascotFallback: React.FC<FlameSafeMascotFallbackProps> = ({
  className = "",
  label = "FlameSafe AI Astro-Flame Bot Mascot",
}) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 600 500"
        className="w-full h-full max-h-[500px] select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="afbHalo" cx="50%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#00B8FF" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#FF7A18" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#050914" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="afbFlameDual" x1="0%" y1="100%" x2="35%" y2="0%">
            <stop offset="0%" stopColor="#FF7A18" />
            <stop offset="45%" stopColor="#FFB547" />
            <stop offset="78%" stopColor="#39B9EB" />
            <stop offset="100%" stopColor="#00B8FF" />
          </linearGradient>
          <linearGradient id="afbSuit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#DCE6F5" />
            <stop offset="100%" stopColor="#9DB2CE" />
          </linearGradient>
          <radialGradient id="afbEarth" cx="50%" cy="18%" r="75%">
            <stop offset="0%" stopColor="#39B9EB" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#0050C0" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#06122B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#040814" stopOpacity="1" />
          </radialGradient>
        </defs>

        <circle cx="300" cy="240" r="240" fill="url(#afbHalo)" />

        {/* Golden Orbital Light Arcs */}
        <ellipse
          cx="305"
          cy="215"
          rx="220"
          ry="68"
          transform="rotate(-22 305 215)"
          fill="none"
          stroke="#FF7A18"
          strokeOpacity="0.55"
          strokeWidth="1.8"
        />
        <ellipse
          cx="305"
          cy="215"
          rx="185"
          ry="52"
          transform="rotate(14 305 215)"
          fill="none"
          stroke="#00B8FF"
          strokeOpacity="0.45"
          strokeWidth="1.4"
        />

        {/* Earth Horizon Below */}
        <ellipse cx="290" cy="495" rx="310" ry="120" fill="url(#afbEarth)" />
        <ellipse
          cx="290"
          cy="495"
          rx="312"
          ry="122"
          fill="none"
          stroke="#39B9EB"
          strokeOpacity="0.65"
          strokeWidth="2"
        />

        {/* Astro-Flame Bot Character (Floating & Waving) */}
        <g transform="translate(295 245) rotate(-8)">
          {/* Dual Orange-Gold + Cyan-Blue Flame Crown */}
          <path
            d="M-42 -74 C-52 -118 -20 -148 -6 -172 C8 -144 16 -136 28 -168 C46 -134 56 -104 42 -72 Z"
            fill="url(#afbFlameDual)"
          />
          <path
            d="M-18 -76 C-22 -106 -4 -128 8 -148 C20 -124 30 -102 22 -76 Z"
            fill="#FFB547"
            opacity="0.9"
          />

          {/* Legs & Boots */}
          <rect x="-34" y="102" width="26" height="44" rx="12" fill="url(#afbSuit)" />
          <rect x="8" y="98" width="26" height="44" rx="12" fill="url(#afbSuit)" />
          <ellipse cx="-21" cy="150" rx="17" ry="9" fill="#1E293B" stroke="#00B8FF" strokeWidth="1.5" />
          <ellipse cx="21" cy="146" rx="17" ry="9" fill="#1E293B" stroke="#00B8FF" strokeWidth="1.5" />

          {/* Suit Torso */}
          <rect x="-46" y="24" width="92" height="84" rx="28" fill="url(#afbSuit)" stroke="#94A3B8" strokeWidth="1.2" />
          <rect x="-44" y="80" width="88" height="12" rx="6" fill="#0F172A" stroke="#00B8FF" strokeOpacity="0.6" strokeWidth="1.2" />
          {/* Glowing Cyan Chest Ring Emblem */}
          <circle cx="0" cy="54" r="14" fill="#061329" stroke="#00B8FF" strokeWidth="2.5" />
          <circle cx="0" cy="54" r="6" fill="#39B9EB" />

          {/* Arms (Waving) */}
          <path d="M-44 42 C-74 34 -88 14 -94 -6" fill="none" stroke="url(#afbSuit)" strokeWidth="20" strokeLinecap="round" />
          <circle cx="-95" cy="-10" r="10" fill="#1E293B" stroke="#00B8FF" strokeWidth="1.5" />
          <path d="M44 42 C72 36 92 18 102 -2" fill="none" stroke="url(#afbSuit)" strokeWidth="20" strokeLinecap="round" />
          <circle cx="104" cy="-6" r="10" fill="#1E293B" stroke="#00B8FF" strokeWidth="1.5" />

          {/* Rounded White Astronaut Helmet */}
          <rect x="-74" y="-82" width="148" height="112" rx="54" fill="url(#afbSuit)" stroke="#94A3B8" strokeWidth="1.8" />
          {/* Ear Pod Comms */}
          <rect x="-86" y="-44" width="14" height="34" rx="7" fill="#1E293B" stroke="#00B8FF" strokeWidth="1.6" />
          <rect x="72" y="-44" width="14" height="34" rx="7" fill="#1E293B" stroke="#00B8FF" strokeWidth="1.6" />

          {/* Dark Glossy Visor Screen Face */}
          <rect x="-56" y="-64" width="112" height="76" rx="36" fill="#040814" stroke="#00B8FF" strokeOpacity="0.65" strokeWidth="2" />

          {/* Glowing Cyan LED Pill Eyes & Curved LED Smile */}
          <rect x="-32" y="-42" width="16" height="26" rx="8" fill="#00B8FF" />
          <rect x="16" y="-42" width="16" height="26" rx="8" fill="#00B8FF" />
          <circle cx="-26" cy="-34" r="3.5" fill="#FFFFFF" />
          <circle cx="22" cy="-34" r="3.5" fill="#FFFFFF" />
          <path d="M-11 -4 Q0 6 11 -4" fill="none" stroke="#00B8FF" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
