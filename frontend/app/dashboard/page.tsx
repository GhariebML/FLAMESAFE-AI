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
import { DESIGN_TOKENS } from "@/lib/design-system/tokens";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton className="h-10 w-72" />
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
    },
    {
      title: "Comparison Lab",
      desc: "Inspect normalized parameters and compatible unit charts.",
      href: "/compare",
      icon: Scale,
    },
    {
      title: "Mission Scenarios",
      desc: "Evaluate Lunar (0.166g) and Mars (0.38g) gap envelopes.",
      href: "/scenarios",
      icon: Compass,
    },
    {
      title: "SI Research Assistant",
      desc: "Ask RAG-grounded questions with DOI and page citations.",
      href: "/assistant",
      icon: BotMessageSquare,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-electric-400 shrink-0" />
            <span>Mission Intelligence Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live scientific telemetry synthesized from indexed NASA Physical Sciences Informatics (PSI) microgravity combustion datasets.
          </p>
        </div>
        <Badge
          variant={isUsingFallback ? "warning" : "success"}
          className="gap-1.5 self-start sm:self-auto"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {isUsingFallback ? "Offline Fallback Snapshot" : "Live PSI Database Connected"}
        </Badge>
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
                innerRadius={52}
                outerRadius={86}
                paddingAngle={3}
              >
                {fuelData.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      DESIGN_TOKENS.colors.chartPalette[
                        index % DESIGN_TOKENS.colors.chartPalette.length
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D2035",
                  borderColor: "#1E3A5F",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#F8FAFC",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Coverage & Regimes */}
      {overview.coverage_summary && (
        <Card className="border-space-800 bg-space-900/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-plasma-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Orbital Microgravity Test Regimes & Coverage
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {(overview.investigation_groups || ["BASS", "SAFFIRE", "FLEX", "SAME", "ACME"]).map(
                (grp: string) => (
                  <Link key={grp} href={`/investigations?query=${grp}`}>
                    <Badge variant="outline" className="hover:border-blue-500/50 cursor-pointer">
                      {grp}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-space-950/70 border border-space-800">
              <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Flight Test Facilities
              </span>
              {overview.coverage_summary.microgravity_regimes}
            </div>
            <div className="p-3 rounded-lg bg-space-950/70 border border-space-800">
              <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Combustion Modes
              </span>
              {overview.coverage_summary.primary_combustion_modes}
            </div>
            <div className="p-3 rounded-lg bg-space-950/70 border border-space-800">
              <span className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
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

        <Card className="space-y-4 border-space-800 bg-space-900/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Core Analytical Modules</h3>
            <Badge variant="outline">Quick Access</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="p-3.5 rounded-xl bg-space-950/70 border border-space-800 hover:border-blue-500/50 transition-all group flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-plasma-400" />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-300">
                      {tool.title}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
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
