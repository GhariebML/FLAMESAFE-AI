"use client";

import React from "react";

export interface StoryPageHeaderProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  hook: string;
  mascotSrc?: string;
  actions?: React.ReactNode;
}

/**
 * Shared Storyboard Hero Banner for all interior pages, matching the
 * visual storytelling aesthetic of the FlameSafe AI Storyboard.
 */
export const StoryPageHeader: React.FC<StoryPageHeaderProps> = ({
  eyebrow,
  title,
  highlight,
  hook,
  mascotSrc = "/images/story/mascot-explorer.webp",
  actions,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#1E3A6E] bg-gradient-to-r from-[#060E20] via-[#0A1836] to-[#081228] p-5 sm:p-7 shadow-[0_14px_44px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(57,185,235,0.22)]">
      {/* Subtle Golden & Cyan Orbital Accent Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-12 h-56 w-56 rounded-full bg-[#FF7A18]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#00B8FF]/15 blur-3xl"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-[#00B8FF]/40 bg-[#050B18] overflow-hidden shrink-0 shadow-[0_0_24px_rgba(0,184,255,0.22)]">
            <img
              src={mascotSrc}
              alt="Astro-Flame Bot"
              className="h-full w-full object-cover object-top"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#39B9EB]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A18]" />
              <span>{eyebrow}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white keep-white">
              {title}{" "}
              {highlight && <span className="text-[#FF7A18]">{highlight}</span>}
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A8B3] max-w-2xl leading-relaxed">
              {hook}
            </p>
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
