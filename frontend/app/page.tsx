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
  Globe2,
  AlertTriangle,
  MessageSquare,
  Radio,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

const MISSION_STATIONS = [
  {
    step: "Station 01",
    title: "NASA PSI Research Catalog",
    subtitle: "Inspect BASS, SAFFIRE, FLEX, SAME & ACME flight experiments, fuels, and DOIs.",
    href: "/investigations",
    cta: "Explore Investigations",
    image: "/images/story/inv-bass.webp",
    badge: "NASA PSI Archive",
    icon: FlaskConical,
  },
  {
    step: "Station 02",
    title: "Multi-Agent AI Lab",
    subtitle: "11 LangGraph agents orchestrating PSI discovery, schema normalization & RAG synthesis.",
    href: "/research",
    cta: "Launch AI Lab",
    image: "/images/story/scientific-measurements.webp",
    badge: "11 LangGraph Agents",
    icon: Cpu,
  },
  {
    step: "Station 03",
    title: "Data Observatory",
    subtitle: "Compare 1g Earth buoyant flames, 0g ISS spherical diffusion & 0.16g lunar regimes.",
    href: "/compare",
    cta: "Open Data Observatory",
    image: "/images/story/flame-in-space.webp",
    badge: "Multi-Regime Telemetry",
    icon: Scale,
  },
  {
    step: "Station 04",
    title: "Atmospheric Decision Lab",
    subtitle: "Evaluate cabin O₂ concentration, pressure & airflow boundaries against empirical runs.",
    href: "/scenarios",
    cta: "Evaluate Cabin Conditions",
    image: "/images/story/oxygen-chamber.webp",
    badge: "Boundary Coverage",
    icon: ShieldAlert,
  },
  {
    step: "Station 05",
    title: "Fire Safety Insights",
    subtitle: "Rank NASA investigations by explainable multi-factor relevance (R = 0.30D + 0.25F...).",
    href: "/insights",
    cta: "Inspect Safety Rankings",
    image: "/images/story/inv-saffire.webp",
    badge: "Explainable Scoring",
    icon: Lightbulb,
  },
  {
    step: "Station 06",
    title: "Traceable Evidence Vault",
    subtitle: "Audit primary NASA PSI publications, page-level excerpts, and SHA-256 provenance.",
    href: "/evidence",
    cta: "Open Evidence Vault",
    image: "/images/story/report-docs.webp",
    badge: "DOI & Page Citations",
    icon: BookOpenCheck,
  },
];

const HERO_ANIMATED_STARS = [
  { top: "12%", left: "8%", size: "h-1.5 w-1.5", color: "bg-[#F7F7F5]", delay: "0s" },
  { top: "24%", left: "19%", size: "h-1 w-1", color: "bg-[#39B9EB]", delay: "0.7s" },
  { top: "15%", left: "34%", size: "h-1.5 w-1.5", color: "bg-[#FFB547]", delay: "1.3s" },
  { top: "38%", left: "42%", size: "h-1 w-1", color: "bg-[#F7F7F5]", delay: "0.4s" },
  { top: "64%", left: "46%", size: "h-1.5 w-1.5", color: "bg-[#39B9EB]", delay: "1.8s" },
  { top: "18%", left: "54%", size: "h-2 w-2", color: "bg-[#39B9EB]", delay: "0.9s" },
  { top: "48%", left: "52%", size: "h-1 w-1", color: "bg-[#FF6B24]", delay: "1.5s" },
  { top: "10%", left: "88%", size: "h-1.5 w-1.5", color: "bg-[#F7F7F5]", delay: "0.2s" },
  { top: "28%", left: "92%", size: "h-1.5 w-1.5", color: "bg-[#FFB547]", delay: "1.1s" },
  { top: "55%", left: "94%", size: "h-1 w-1", color: "bg-[#39B9EB]", delay: "0.6s" },
];

export default function OrbitalHomePage() {
  const [metrics, setMetrics] = useState({
    investigations: 5,
    runs: 7,
    measurements: 36,
    documents: 5,
  });

  useEffect(() => {
    let mounted = true;
    apiClient
      .getOverview()
      .then((res: any) => {
        if (!mounted || !res) return;
        setMetrics({
          investigations: Number(res?.total_investigations ?? res?.counts?.investigations ?? 5) || 5,
          runs: Number(res?.total_experimental_runs ?? res?.counts?.runs ?? 7) || 7,
          measurements: Number(res?.total_measurements ?? res?.counts?.measurements ?? 36) || 36,
          documents: Number(res?.total_documents ?? res?.counts?.documents ?? 5) || 5,
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const openCompanion = () => {
    window.dispatchEvent(new CustomEvent("flamesafe:open-companion"));
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F7F7F5] selection:bg-[#FF6B24] selection:text-white pb-24 sm:pb-20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-10 sm:space-y-12">
        {/* =====================================================================
            1. ORBITAL HERO SHOWCASE
            - Mobile/Tablet (< lg): Dedicated unobstructed Mascot Visual Stage on top,
              followed cleanly by typography, CTAs, and 2x2 metrics below (ZERO overlap).
            - Desktop (lg+): Strict 48% left text zone over deep space + 52% right
              unobstructed 3D Astro-Flame character stage (ZERO text-on-mascot overlap).
        ===================================================================== */}
        <section className="relative rounded-3xl bg-[#0B1017]/90 border border-[#283340] shadow-[0_28px_80px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(57,185,235,0.22)] overflow-hidden backdrop-blur-md">
          {/* Mobile & Tablet Dedicated Mascot Showcase (< lg) — 100% Unobstructed Character */}
          <div className="relative lg:hidden h-72 sm:h-96 w-full overflow-hidden bg-[#080A0F] border-b border-[#283340]/80">
            <img
              src="/images/story/hero-mascot-mobile.webp"
              alt="Astro-Flame 3D Mascot overlooking Earth in Orbit"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1017] via-transparent to-[#080A0F]/25" />

            {/* Top-left Orbital Telemetry Pill on Mobile */}
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#080A0F]/85 border border-[#39B9EB]/40 px-2.5 py-1 text-[10px] font-mono font-semibold text-[#39B9EB] backdrop-blur-md">
              <Radio className="h-3 w-3 text-[#FF6B24] animate-pulse" />
              <span>ISS ORBITAL LAB · 0g</span>
            </div>
          </div>

          {/* Desktop Hero Stage (lg+) & Unified Content Container */}
          <div className="relative lg:min-h-[560px] xl:min-h-[590px] w-full flex items-center">
            {/* Desktop Wide Right-Aligned Mascot Backdrop (hidden on < lg) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
              <img
                src="/images/story/hero-mascot-earth.webp"
                alt="Astro-Flame 3D Mascot overlooking Earth in the Orbital Research Lab"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-right"
              />
              {/* Left reading zone gradient guarantee so text never competes with background */}
              <div className="absolute inset-y-0 left-0 w-[54%] bg-gradient-to-r from-[#080A0F]/95 via-[#080A0F]/82 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/75 via-transparent to-[#080A0F]/25" />
            </div>

            {/* Live Twinkling Starlight & Orbital Ring Motion Overlay inside Hero */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
              {HERO_ANIMATED_STARS.map((star, idx) => (
                <span
                  key={idx}
                  style={{ top: star.top, left: star.left, animationDelay: star.delay }}
                  className={`absolute rounded-full ${star.size} ${star.color} animate-pulse opacity-80 shadow-[0_0_10px_rgba(57,185,235,0.8)]`}
                />
              ))}
              <svg
                viewBox="0 0 1200 600"
                className="hidden lg:block absolute inset-0 w-full h-full opacity-35"
              >
                <g transform="translate(910 280)">
                  <circle
                    cx="0"
                    cy="0"
                    r="235"
                    fill="none"
                    stroke="#39B9EB"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    strokeDasharray="6 10"
                    className="animate-orbit-slow origin-center"
                  />
                </g>
              </svg>
            </div>

            {/* Desktop Top-Right Non-Intrusive Orbital Telemetry Badge */}
            <div className="hidden lg:inline-flex items-center gap-2 absolute top-6 right-7 z-20 rounded-full bg-[#080A0F]/85 border border-[#283340] px-3.5 py-1.5 text-[11px] font-mono font-semibold text-[#F7F7F5] backdrop-blur-md shadow-lg">
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>ISS 0g COMBUSTION TELEMETRY</span>
              <span className="text-[#39B9EB]">·</span>
              <button
                type="button"
                onClick={openCompanion}
                className="text-[#FFB547] hover:text-[#F7F7F5] underline-offset-2 hover:underline transition-colors"
              >
                Ask Astro-Flame
              </button>
            </div>

            {/* Strictly Constrained Left Text Column (Never overlaps right-half Mascot) */}
            <div className="relative z-10 w-full p-5 sm:p-8 lg:py-12 lg:px-12 xl:px-14">
              <div className="w-full lg:w-[48%] xl:w-[46%] max-w-[520px] space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151D27]/95 border border-[#283340] text-[10px] sm:text-xs font-mono font-semibold text-[#39B9EB] backdrop-blur-md max-w-full">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF6B24] shrink-0" />
                  <span className="leading-snug">
                    {metrics.investigations} PSI STUDIES · {metrics.runs} RUNS ·{" "}
                    {metrics.measurements} SI METRICS
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-extrabold tracking-tight leading-[1.08] text-[#F7F7F5]">
                  Explore. Discover.
                  <span className="block mt-1.5 bg-gradient-to-r from-[#FF6B24] via-[#FF8547] to-[#FFB547] bg-clip-text text-transparent">
                    Stay Safe in Orbit.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#A1A8B3] leading-relaxed max-w-[490px]">
                  Microgravity combustion intelligence powered by NASA Physical Sciences
                  Informatics (PSI) flight data and an 11-agent scientific research workflow.
                </p>

                {/* Responsive CTA Bar: Stacked on small mobile, inline on sm+ */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    href="/investigations"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF6B24] to-[#E94B16] hover:from-[#FF8040] hover:to-[#FF6B24] text-white keep-white font-bold text-sm shadow-[0_12px_32px_rgba(255,107,36,0.42)] transition-all hover:-translate-y-0.5"
                  >
                    <span>Explore Research</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>

                  <Link
                    href="/research"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#151D27]/95 hover:bg-[#1C2633] border border-[#283340] hover:border-[#39B9EB]/60 text-[#F7F7F5] font-semibold text-sm backdrop-blur-md transition-all"
                  >
                    <Cpu className="h-4 w-4 text-[#39B9EB] shrink-0" />
                    <span>Launch AI Lab</span>
                  </Link>

                  <button
                    type="button"
                    onClick={openCompanion}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#10151D]/90 hover:bg-[#151D27] border border-[#283340] hover:border-[#FFB547]/60 text-xs font-semibold text-[#FFB547] transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#FF6B24] shrink-0" />
                    <span>Ask Astro-Flame</span>
                  </button>
                </div>

                {/* Live Verified Repository Strip — Strictly inside Left 48% Column */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: "PSI Studies", value: metrics.investigations, unit: "Indexed" },
                    { label: "Flight Runs", value: metrics.runs, unit: "0g & 1g" },
                    { label: "Measurements", value: metrics.measurements, unit: "SI Normalized" },
                    { label: "Publications", value: metrics.documents, unit: "DOI Traceable" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-[#10151D]/90 border border-[#283340] px-3 py-2.5 backdrop-blur-md shadow-sm"
                    >
                      <div className="text-base sm:text-lg font-mono font-extrabold text-[#F7F7F5]">
                        {stat.value}
                      </div>
                      <div className="text-[11px] font-medium text-[#A1A8B3] truncate">
                        {stat.label}
                      </div>
                      <div className="text-[10px] font-mono text-[#39B9EB] truncate">
                        {stat.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. SIX SCIENTIFIC WORKSPACE STATIONS (DISTINCT SCIENTIFIC VISUALS)
        ===================================================================== */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B24]">
                ORBITAL RESEARCH WORKSPACE
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#F7F7F5] tracking-tight">
                Scientific Intelligence Modules
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#39B9EB] hover:text-[#F7F7F5] transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Open Mission Control Overview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {MISSION_STATIONS.map((st) => {
              const Icon = st.icon;
              return (
                <Link
                  key={st.href}
                  href={st.href}
                  className="group relative rounded-2xl bg-[#10151D]/88 hover:bg-[#151D27]/95 border border-[#283340] hover:border-[#39B9EB]/60 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border border-[#283340] bg-[#080A0F] mb-4">
                      <img
                        src={st.image}
                        alt={st.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/85 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#10151D]/90 border border-[#283340] text-[10px] font-mono font-semibold text-[#A1A8B3]">
                          {st.step}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10151D]/90 border border-[#283340] text-[11px] font-semibold text-[#F7F7F5]">
                          <Icon className="h-3.5 w-3.5 text-[#FF6B24]" />
                          {st.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#F7F7F5] group-hover:text-[#39B9EB] transition-colors">
                      {st.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#A1A8B3] leading-relaxed">
                      {st.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#283340] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FFB547] group-hover:text-[#F7F7F5] transition-colors">
                      {st.cta}
                    </span>
                    <span className="h-7 w-7 rounded-full bg-[#151D27] border border-[#283340] group-hover:border-[#FF6B24] flex items-center justify-center text-[#F7F7F5] group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="h-3.5 w-3.5 text-[#FF6B24]" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            3. EARTH APPLICATIONS & PARTIAL-GRAVITY RESEARCH GAPS
        ===================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Earth Applications Module */}
          <div className="lg:col-span-6 rounded-2xl bg-[#10151D]/88 border border-[#283340] p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-md">
            <div className="space-y-4">
              <div className="relative h-48 sm:h-52 w-full rounded-xl overflow-hidden border border-[#283340] bg-[#080A0F]">
                <img
                  src="/images/story/earth-applications.webp"
                  alt="Earth combustion efficiency and fire sensor calibration transfer"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#10151D]/90 border border-[#22C55E]/40 px-3 py-1 text-[11px] font-semibold text-[#22C55E]">
                  <Globe2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Orbital-to-Earth Technology Transfer</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#F7F7F5]">
                  How Microgravity Combustion Helps Earth
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#A1A8B3] leading-relaxed">
                  Removing buoyant convection on the ISS isolates fundamental diffusion, soot
                  nucleation, and low-temperature cool-flame chemistry (`FLEX / FLEX-2`), directly
                  informing cleaner terrestrial engine combustion and lower-false-alarm smoke
                  detectors (`SAME / SAME-R`).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#283340] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[#778495]">
                Verified in FLEX-2 &amp; SAME-R Corpora
              </span>
              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39B9EB] hover:text-[#F7F7F5]"
              >
                <span>Explore Safety Insights</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Research Gaps Module */}
          <div className="lg:col-span-6 rounded-2xl bg-[#10151D]/88 border border-[#283340] p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-md">
            <div className="space-y-4">
              <div className="relative h-48 sm:h-52 w-full rounded-xl overflow-hidden border border-[#283340] bg-[#080A0F]">
                <img
                  src="/images/story/research-gaps.webp"
                  alt="Partial gravity flammability research gaps between 0g ISS and 0.16g Lunar regimes"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#10151D]/90 border border-[#FFB547]/40 px-3 py-1 text-[11px] font-semibold text-[#FFB547]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#FF6B24] shrink-0" />
                  <span>Scientific Gap Identification</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#F7F7F5]">
                  Partial-Gravity Research Gaps (0.16g Lunar &amp; 0.38g Mars)
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#A1A8B3] leading-relaxed">
                  While `0g` ISS microgravity and `1g` Earth baselines are well-instrumented,
                  empirical solid flammability data at lunar partial gravity (`0.16g`) under
                  elevated cabin oxygen (`30–34% O₂`) remains sparse and requires targeted
                  interpolation and new flight campaigns.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#283340] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[#778495]">
                BASS-II / SOFIE Boundary Analysis
              </span>
              <Link
                href="/scenarios"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB547] hover:text-[#F7F7F5]"
              >
                <span>Open Atmospheric Gap Simulator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. CLOSING SCIENTIFIC DOSSIER & ORBITAL HORIZON BANNER
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          <Link
            href="/evidence"
            className="lg:col-span-4 group relative rounded-2xl bg-[#10151D]/88 hover:bg-[#151D27] border border-[#283340] hover:border-[#FF6B24]/60 p-5 sm:p-6 shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-md overflow-hidden flex items-center justify-between gap-4 transition-all"
          >
            <div className="space-y-2 z-10 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[#22C55E] text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Traceable Evidence</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#F7F7F5]">
                NASA PSI <span className="text-[#FF6B24]">Citations</span>
              </h2>
              <p className="text-xs text-[#A1A8B3] leading-relaxed">
                Audit verified NASA PSI publications, DOIs, and page-level evidence excerpts.
              </p>
              <span className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-[#FFB547] group-hover:underline">
                <BookOpenCheck className="h-4 w-4 shrink-0" />
                <span>Open Evidence Center</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </span>
            </div>

            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#283340] shrink-0">
              <img
                src="/images/story/report-docs.webp"
                alt="NASA Research Report Dossier"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          <section className="lg:col-span-8 relative rounded-2xl bg-[#10151D]/88 border border-[#283340] overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-md min-h-[160px] flex items-center">
            <img
              src="/images/story/footer-sunrise.webp"
              alt="Orbital horizon over Earth"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080A0F]/92 via-[#080A0F]/65 to-[#080A0F]/90" />

            <div className="relative z-10 w-full px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-[#FF6B24]/20 border border-[#FF6B24]/50 flex items-center justify-center shrink-0">
                  <Flame className="h-6 w-6 text-[#FF6B24]" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F7F7F5]">
                    FlameSafe <span className="text-[#FF6B24]">AI</span>
                  </div>
                  <p className="text-xs text-[#A1A8B3]">
                    Orbital Microgravity Combustion &amp; Fire Safety Intelligence
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm italic font-medium text-[#F7F7F5] text-center sm:text-right max-w-[260px]">
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
