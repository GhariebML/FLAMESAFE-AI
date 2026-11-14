"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  Flame,
  FlaskConical,
  Lightbulb,
  Scale,
  ShieldAlert,
  Sparkles,
  BookOpenCheck,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

const MISSION_CHAPTERS = [
  {
    step: "Chapter 01",
    title: "Microgravity vs Earth",
    subtitle: "See how fire behaves differently in space — 1G teardrop vs 0G sphere.",
    href: "/compare",
    cta: "Open Data Observatory",
    image: "/images/story/flame-in-space.png",
    badge: "Physics Lab",
    icon: Scale,
    accent: "from-[#39B9EB] to-[#006EDB]",
  },
  {
    step: "Chapter 02",
    title: "Investigation Explorer",
    subtitle: "Dive into NASA's groundbreaking BASS, SAFFIRE, FLEX, SAME & ACME studies.",
    href: "/investigations",
    cta: "Explore Experiments",
    image: "/images/story/inv-bass.png",
    badge: "NASA Archive",
    icon: FlaskConical,
    accent: "from-[#FF7A18] to-[#E94B16]",
  },
  {
    step: "Chapter 03",
    title: "AI Agents Mission Room",
    subtitle: "11 specialized autonomous agents orchestrating literature & telemetry.",
    href: "/research",
    cta: "Enter AI Mission Room",
    image: "/images/story/mascot-agents.png",
    badge: "11 AI Agents",
    icon: Cpu,
    accent: "from-[#00B8FF] to-[#006EDB]",
  },
  {
    step: "Chapter 04",
    title: "Oxygen Control Room",
    subtitle: "Simulate oxygen concentration, cabin pressure, and airflow fire risk.",
    href: "/scenarios",
    cta: "Launch Oxygen Simulator",
    image: "/images/story/oxygen-chamber.png",
    badge: "Cabin Telemetry",
    icon: ShieldAlert,
    accent: "from-[#FF7A18] to-[#FFB547]",
  },
  {
    step: "Chapter 05",
    title: "Fire Safety Decision Lab",
    subtitle: "Make informed prevention, detection, suppression & material decisions.",
    href: "/insights",
    cta: "Open Decision Lab",
    image: "/images/story/mascot-shield.png",
    badge: "Safety Protocols",
    icon: Lightbulb,
    accent: "from-[#FFB547] to-[#FF7A18]",
  },
  {
    step: "Chapter 06",
    title: "Your Research Journey",
    subtitle: "Track your astronaut explorer level, mission telemetry & achievements.",
    href: "/dashboard",
    cta: "View Mission Control",
    image: "/images/story/mascot-journey.png",
    badge: "Explorer Level 1",
    icon: Compass,
    accent: "from-[#39B9EB] to-[#00B8FF]",
  },
];

export default function StoryboardHomePage() {
  const [totalStudies, setTotalStudies] = useState<number>(5);
  const [totalRuns, setTotalRuns] = useState<number>(7);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getOverview()
      .then((res: any) => {
        if (!mounted || !res) return;
        const studies =
          res?.total_investigations ?? res?.counts?.investigations ?? 5;
        const runs =
          res?.total_experimental_runs ?? res?.counts?.runs ?? 7;
        setTotalStudies(Number(studies) || 5);
        setTotalRuns(Number(runs) || 7);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-[#F7F7F5] selection:bg-[#FF7A18] selection:text-white pb-16">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {/* =====================================================================
            1. FULL-VIEWPORT HERO SHOWCASE (REALISTIC ASTRO-FLAME BOT OVER EARTH)
        ===================================================================== */}
        <section className="relative rounded-3xl bg-[#050C1D] border-2 border-[#254B8C]/90 shadow-[0_28px_80px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(57,185,235,0.4)] overflow-hidden">
          <div className="relative min-h-[540px] lg:min-h-[620px] w-full flex items-center">
            {/* Full-Bleed Realistic 3D Astro-Flame Bot Hero Masterpiece */}
            <div className="absolute inset-0">
              <img
                src="/images/story/hero-mascot-earth.png"
                alt="Realistic Astro-Flame Bot floating above Earth horizon"
                className="h-full w-full object-cover object-center lg:object-[68%_center] brightness-105 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#040918]/95 via-[#050D22]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040918]/90 via-transparent to-[#040918]/30" />
            </div>

            {/* Hero Foreground Content */}
            <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headline, Story Hook & Primary CTAs */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1C3D]/90 border border-[#39B9EB]/55 text-xs font-bold text-[#39B9EB] shadow-[0_0_24px_rgba(57,185,235,0.3)] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF7A18]" />
                  <span>
                    {totalStudies} NASA PSI STUDIES • {totalRuns} EXPERIMENTAL RUNS • 11 AI AGENTS
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.04] text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)]">
                  Explore. Discover.
                  <span className="block mt-2 bg-gradient-to-r from-[#FF7A18] via-[#FF9A3C] to-[#FFB547] bg-clip-text text-transparent">
                    Stay Safe.
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-[#D6E4FF] font-medium max-w-xl leading-relaxed drop-shadow">
                  AI-Powered Research for Fire Safety in Space.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/compare"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#E94B16] hover:from-[#FF8B33] hover:to-[#FF6B24] text-white keep-white font-bold text-base shadow-[0_12px_34px_rgba(255,122,24,0.5)] transition-all hover:-translate-y-0.5"
                  >
                    <span>Start Your Mission</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  <Link
                    href="/investigations"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-[#0A1936]/90 hover:bg-[#112854] border border-[#39B9EB]/55 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all"
                  >
                    <Compass className="h-4 w-4 text-[#39B9EB]" />
                    <span>Explore Investigations</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Floating Story Speech Bubble beside the Realistic Mascot */}
              <div className="lg:col-span-6 flex flex-col items-end justify-end h-full min-h-[260px] lg:min-h-[460px]">
                <div className="mt-auto w-full sm:w-[320px] rounded-2xl bg-[#071530]/90 border border-[#39B9EB]/70 p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(57,185,235,0.28)]">
                  <div className="flex items-center gap-3 mb-2.5">
                    <img
                      src="/images/story/mascot-avatar.png"
                      alt="Astro-Flame Bot"
                      className="h-10 w-10 rounded-full border-2 border-[#39B9EB] object-cover"
                    />
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        Welcome aboard, Researcher!
                      </p>
                      <p className="text-[10px] font-mono text-[#39B9EB]">
                        ASTRO-FLAME COMMANDER
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D6E4FF] leading-relaxed">
                    Let&apos;s explore how fire behaves in space. Choose any
                    mission station below to begin!
                  </p>
                  <div className="mt-3.5 pt-3 border-t border-[#1E3A6E] flex items-center justify-between gap-2">
                    <div className="flex items-end gap-1 h-4">
                      {[45, 95, 60, 100, 50, 85, 65, 40].map((bar, idx) => (
                        <span
                          key={idx}
                          style={{ height: `${bar}%` }}
                          className="w-1 rounded-full bg-[#39B9EB] animate-pulse"
                        />
                      ))}
                    </div>
                    <Link
                      href="/assistant"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FFB547] hover:text-white transition-colors"
                    >
                      <span>Ask AI Companion</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. MISSION STATIONS LAUNCHPAD (EACH SECTION OPENS ITS DEDICATED PAGE)
        ===================================================================== */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF7A18]">
                INTERACTIVE SPACE RESEARCH STATIONS
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Choose Your Mission Station
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#9EB2D0]">
              Every station is a dedicated interactive laboratory page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MISSION_CHAPTERS.map((ch) => {
              const Icon = ch.icon;
              return (
                <Link
                  key={ch.href}
                  href={ch.href}
                  className="group relative rounded-3xl bg-gradient-to-br from-[#060E20] via-[#09152E] to-[#050A18] border border-[#1E3A6E]/90 hover:border-[#39B9EB] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-[#254B8C] bg-black mb-4">
                      <img
                        src={ch.image}
                        alt={ch.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040918]/90 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#050C1D]/90 border border-[#39B9EB]/50 text-[10px] font-mono font-bold text-[#39B9EB] backdrop-blur-md">
                          {ch.step}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#050C1D]/90 border border-white/15 text-[11px] font-bold text-white backdrop-blur-md">
                          <Icon className="h-3.5 w-3.5 text-[#FF7A18]" />
                          {ch.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-white group-hover:text-[#39B9EB] transition-colors">
                      {ch.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#B4C6E4] leading-relaxed">
                      {ch.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#1E3A6E]/70 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FFB547] group-hover:text-white transition-colors">
                      {ch.cta}
                    </span>
                    <span
                      className={`h-8 w-8 rounded-full bg-gradient-to-r ${ch.accent} flex items-center justify-center text-white shadow-md group-hover:translate-x-1 transition-transform`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            3. CLOSING STORY BANNER & REPORT ACCESS
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <Link
            href="/evidence"
            className="lg:col-span-4 group relative rounded-3xl bg-gradient-to-br from-[#060E20] via-[#0A1836] to-[#050A18] border border-[#1E3A6E]/90 hover:border-[#FF7A18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden flex items-center justify-between gap-4 transition-all"
          >
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Evidence & Reports</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Research <span className="text-[#FF7A18]">Reports</span>
              </h2>
              <p className="text-xs text-[#B4C6E4] leading-relaxed">
                Audit verified NASA PSI publications, DOIs, and scientific summaries.
              </p>
              <span className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-[#FFB547] group-hover:underline">
                <BookOpenCheck className="h-4 w-4" />
                <span>Open Evidence Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="w-28 sm:w-32 h-28 rounded-2xl overflow-hidden border border-[#254B8C] shrink-0">
              <img
                src="/images/story/report-docs.png"
                alt="NASA Research Report Dossier"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          <section className="lg:col-span-8 relative rounded-3xl bg-[#040916] border border-[#1E3A6E]/90 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.75)] min-h-[168px] flex items-center">
            <img
              src="/images/story/footer-sunrise.png"
              alt="Orbital sunrise over Earth with Astro-Flame Bot"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#040814]/90 via-[#040814]/45 to-[#040814]/85" />

            <div className="relative z-10 w-full px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#FF7A18]/20 border border-[#FF7A18]/50 flex items-center justify-center shadow-[0_0_24px_rgba(255,122,24,0.35)]">
                  <Flame className="h-7 w-7 text-[#FF7A18]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    FlameSafe <span className="text-[#FF7A18]">AI</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D6E4FF]">
                    Smarter Research. Safer Tomorrow.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm italic font-medium text-[#E2ECFF] text-center sm:text-right max-w-[260px] drop-shadow">
                &ldquo;Because in Space...
                <span className="block not-italic font-bold text-[#FFB547]">
                  Every Flame Tells a Story.&rdquo;
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
