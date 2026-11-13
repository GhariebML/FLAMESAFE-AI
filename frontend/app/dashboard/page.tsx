"use client";

import React from "react";
import Link from "next/link";
import { useOverview } from "@/hooks/useOverview";
import { DomainDistribution } from "@/components/dashboard/DomainDistribution";
import { RecentSources } from "@/components/dashboard/RecentSources";
import {
  MetricCard,
  ChartContainer,
  UncertaintyBanner,
  LoadingSkeleton,
  Card,
  Badge,
} from "@/components/ui";
import { useChartTheme } from "@/lib/design-system";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  ShieldCheck,
  Database,
  Layers,
  Activity,
  FileText,
  ArrowRight,
  Scale,
  Compass,
  BotMessageSquare,
  Sparkles,
  Flame,
  Orbit,
} from "lucide-react";

const FALLBACK_OVERVIEW = {
  total_investigations: 5,
  total_experimental_runs: 7,
  total_measurements: 18,
  total_documents: 5,
  research_domains: [
    { domain: "Solid Fuel Flammability & Suppression", investigations_count: 1, runs_count: 2 },
    { domain: "Large-Scale Spacecraft Fire Safety", investigations_count: 1, runs_count: 2 },
    { domain: "Droplet Combustion & Cool Flame Kinetics", investigations_count: 1, runs_count: 1 },
    { domain: "Smoke Detection & Particle Morphology", investigations_count: 1, runs_count: 1 },
    { domain: "Gaseous Flame Stabilization & Soot Dynamics", investigations_count: 1, runs_count: 1 },
  ],
  fuel_categories: [
    { fuel_category: "Solid Polymer", count: 2 },
    { fuel_category: "Solid Fabric Blend", count: 2 },
    { fuel_category: "Liquid Hydrocarbon", count: 1 },
    { fuel_category: "Wire Insulation Polymer", count: 1 },
    { fuel_category: "Gaseous Hydrocarbon", count: 1 },
  ],
  investigation_groups: ["BASS", "SAFFIRE", "FLEX", "SAME", "ACME"],
  recent_sources: [],
  coverage_summary: {
    microgravity_regimes: "International Space Station (MSG, CIR) & Orbital Resupply (Cygnus)",
    primary_combustion_modes:
      "Solid flammability, droplet combustion, smoke aerosol agglomeration, gaseous diffusion flames",
    safety_focus: "Spacecraft, Lunar Habitat, and Mars Habitat exploration fire safety",
  },
};

export default function DashboardPage() {
  const { data, isLoading, error, isUsingFallback } = useOverview();
  const chartTheme = useChartTheme();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-80" />
          <LoadingSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  const overview = data || FALLBACK_OVERVIEW;
  const fuelData = (overview.fuel_categories || []).map((f: any) => ({
    name: f.fuel_category,
    value: f.count,
  }));

  const quickTools = [
    {
      title: "Investigation Explorer",
      desc: "Filter orbital campaigns by fuel, gravity, and domain.",
      href: "/investigations",
      icon: Database,
      accent: "from-blue-500/20 to-indigo-500/5 border-blue-500/30",
    },
    {
      title: "Comparison Lab",
      desc: "Inspect normalized parameters and compatible unit charts.",
      href: "/compare",
      icon: Scale,
      accent: "from-cyan-500/20 to-teal-500/5 border-cyan-500/30",
    },
    {
      title: "Mission Scenarios",
      desc: "Evaluate Lunar (0.166g) and Mars (0.38g) gap envelopes.",
      href: "/scenarios",
      icon: Compass,
      accent: "from-amber-500/20 to-orange-500/5 border-amber-500/30",
    },
    {
      title: "SI Research Assistant",
      desc: "Ask RAG-grounded questions with DOI and page citations.",
      href: "/assistant",
      icon: BotMessageSquare,
      accent: "from-orange-500/20 to-red-500/5 border-orange-500/30",
    },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-6">
      {/* Aerospace Mission Control Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-space-900 via-space-900/95 to-space-950 p-5 sm:p-7 shadow-panel">
        <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-400/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-orange-500/15 via-amber-400/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-flame-500" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/35">
                <Orbit className="h-3.5 w-3.5 text-plasma-600 dark:text-plasma-400 animate-spin" style={{ animationDuration: "14s" }} />
                NASA Space Apps 2026 · Orbital Fire Safety Intelligence
              </span>
              <Badge
                variant={isUsingFallback ? "warning" : "success"}
                className="gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {isUsingFallback ? "Offline Fallback Snapshot" : "Live PSI Database Connected"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-fg-primary leading-tight">
              Flame in Freefall:{" "}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-orange-600 dark:from-blue-400 dark:via-cyan-300 dark:to-amber-300 bg-clip-text text-transparent">
                Microgravity Combustion Intelligence
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
              Structured scientific telemetry synthesized from NASA Physical Sciences Informatics (PSI) orbital experiments (BASS, SAFFIRE, FLEX, SAME, ACME) for spacecraft, Lunar (0.166g), and Martian (0.38g) habitat fire safety.
            </p>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href="/investigations"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all"
              >
                <Database className="h-3.5 w-3.5" />
                Explore 5 NASA Campaigns
              </Link>
              <Link
                href="/scenarios"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-space-700 bg-space-950/80 hover:border-amber-500/50 text-fg-primary transition-all"
              >
                <Flame className="h-3.5 w-3.5 text-flame-500" />
                Lunar & Mars Scenario Lab
              </Link>
              <Link
                href="/assistant"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-space-700 bg-space-950/80 hover:border-cyan-500/50 text-fg-primary transition-all"
              >
                <BotMessageSquare className="h-3.5 w-3.5 text-plasma-500" />
                Ask Grounded SI Assistant
              </Link>
            </div>
          </div>

          {/* Right Telemetry Envelope Matrix */}
          <div className="grid grid-cols-2 gap-2.5 sm:w-72 shrink-0">
            <div className="p-3 rounded-xl border border-space-800 bg-space-950/85">
              <span className="block text-[10px] font-mono uppercase text-fg-muted">Orbital Baseline</span>
              <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">~0g ISS / Cygnus</span>
            </div>
            <div className="p-3 rounded-xl border border-space-800 bg-space-950/85">
              <span className="block text-[10px] font-mono uppercase text-fg-muted">Lunar Surface</span>
              <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">0.166g Regime</span>
            </div>
            <div className="p-3 rounded-xl border border-space-800 bg-space-950/85">
              <span className="block text-[10px] font-mono uppercase text-fg-muted">Martian Surface</span>
              <span className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400">0.38g Regime</span>
            </div>
            <div className="p-3 rounded-xl border border-space-800 bg-space-950/85">
              <span className="block text-[10px] font-mono uppercase text-fg-muted">Citation Grounding</span>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">100% DOI Linked</span>
            </div>
          </div>
        </div>
      </div>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Backend API Unavailable — Displaying Cached Reference Metrics"
          message={`Could not reach the FastAPI service (${error || "connection refused"}). Showing static reference values rather than live database totals.`}
        />
      )}

      {/* Key Research Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="NASA Investigations"
          value={overview.total_investigations}
          subtitle="Canonical campaigns (BASS, SAFFIRE, FLEX, SAME, ACME)"
          icon={Database}
          accentColor="electric"
        />
        <MetricCard
          label="Experimental Runs"
          value={overview.total_experimental_runs}
          subtitle="Documented microgravity test configurations"
          icon={Layers}
          accentColor="plasma"
        />
        <MetricCard
          label="Recorded Measurements"
          value={overview.total_measurements}
          subtitle="Null-safe physical telemetry points"
          icon={Activity}
          accentColor="amber"
        />
        <MetricCard
          label="Peer-Reviewed Papers"
          value={overview.total_documents}
          subtitle="DOI-verified source publications & evidence"
          icon={FileText}
          accentColor="emerald"
        />
      </div>

      {/* Interactive Recharts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomainDistribution items={overview.research_domains || []} />

        <ChartContainer
          title="Fuel & Material Category Distribution"
          description="Experimental runs grouped by tested solid polymer, fabric, droplet, wire insulation, and gaseous fuel class."
          unitLabel="Runs"
          badgeText="Material Coverage"
          isEmpty={fuelData.length === 0}
          height={280}
          footerNote="Materials cannot be assumed equivalent across distinct combustion phases."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fuelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={54}
                outerRadius={88}
                paddingAngle={4}
                strokeWidth={2}
                stroke={chartTheme.tooltipBg}
              >
                {fuelData.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      chartTheme.palette[
                        index % chartTheme.palette.length
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  borderColor: chartTheme.tooltipBorder,
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: chartTheme.tooltipText,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", color: chartTheme.axisTickColor }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Coverage & Regimes */}
      {overview.coverage_summary && (
        <Card className="border-space-800 bg-space-900/90 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-plasma-600 dark:text-plasma-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Orbital Microgravity Test Regimes & Coverage
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(overview.investigation_groups || ["BASS", "SAFFIRE", "FLEX", "SAME", "ACME"]).map(
                (grp: string) => (
                  <Link key={grp} href={`/investigations?query=${grp}`}>
                    <Badge variant="outline" className="hover:border-blue-500/60 cursor-pointer">
                      {grp}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-fg-secondary">
            <div className="p-3.5 rounded-xl bg-space-950/80 border border-space-800">
              <span className="block text-[11px] font-bold uppercase text-fg-muted mb-1">
                Flight Test Facilities
              </span>
              {overview.coverage_summary.microgravity_regimes}
            </div>
            <div className="p-3.5 rounded-xl bg-space-950/80 border border-space-800">
              <span className="block text-[11px] font-bold uppercase text-fg-muted mb-1">
                Combustion Modes
              </span>
              {overview.coverage_summary.primary_combustion_modes}
            </div>
            <div className="p-3.5 rounded-xl bg-space-950/80 border border-space-800">
              <span className="block text-[11px] font-bold uppercase text-fg-muted mb-1">
                Exploration Safety Scope
              </span>
              {overview.coverage_summary.safety_focus ||
                "Spacecraft, Lunar Habitat, and Mars Habitat fire safety intelligence"}
            </div>
          </div>
        </Card>
      )}

      {/* Provenance & Quick Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSources sources={overview.recent_sources || []} />

        <Card className="space-y-4 border-space-800 bg-space-900/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-fg-primary">Core Analytical Modules</h3>
            <Badge variant="plasma">Quick Launch</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`p-4 rounded-xl bg-gradient-to-br ${tool.accent} border hover:border-blue-500/60 hover:-translate-y-0.5 transition-all group flex flex-col justify-between gap-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-space-900/90 border border-space-700 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-plasma-600 dark:text-plasma-400" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-fg-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-fg-primary group-hover:text-blue-600 dark:group-hover:text-blue-300">
                      {tool.title}
                    </div>
                    <p className="text-[11px] text-fg-muted mt-0.5 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
