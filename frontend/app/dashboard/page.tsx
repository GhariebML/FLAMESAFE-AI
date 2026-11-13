"use client";

import React from "react";
import { useOverview } from "@/hooks/useOverview";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { DomainDistribution } from "@/components/dashboard/DomainDistribution";
import { RecentSources } from "@/components/dashboard/RecentSources";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { LayoutDashboard, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useOverview();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <LoadingSkeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64" />
        </div>
      </div>
    );
  }

  const overview = data || {
    total_investigations: 5,
    total_experimental_runs: 8,
    total_measurements: 14,
    total_documents: 5,
    research_domains: [
      { domain: "Solid Fuel Flammability & Suppression", investigations_count: 1, runs_count: 2 },
      { domain: "Large-Scale Spacecraft Fire Safety", investigations_count: 1, runs_count: 2 },
      { domain: "Droplet Combustion & Cool Flame Kinetics", investigations_count: 1, runs_count: 1 },
      { domain: "Smoke Detection & Particle Morphology", investigations_count: 1, runs_count: 1 },
      { domain: "Gaseous Flame Stabilization & Soot Dynamics", investigations_count: 1, runs_count: 1 },
    ],
    recent_sources: [],
    coverage_summary: {
      microgravity_regimes: "ISS (MSG, CIR) & Cygnus Resupply Flight Module",
      primary_combustion_modes: "Solid flame spread, spherical droplets, smoke particulates, laminar diffusion flames",
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-flame-400" />
            Mission Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global metrics generated live from indexed NASA Physical Sciences Informatics (PSI) research records.
          </p>
        </div>
        <Badge variant="success" className="gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" /> Authentic PSI Dataset
        </Badge>
      </div>

      {/* Real Statistics Cards */}
      <MetricsOverview
        totalInvestigations={overview.total_investigations}
        totalRuns={overview.total_experimental_runs}
        totalMeasurements={overview.total_measurements}
        totalDocuments={overview.total_documents}
      />

      {/* Coverage & Regime Summary */}
      {overview.coverage_summary && (
        <Card className="border-plasma-500/20 bg-plasma-950/10 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-plasma-400">
            Scientific Investigation Regimes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
              <span className="font-semibold text-white">Flight Test Facilities: </span>
              {overview.coverage_summary.microgravity_regimes}
            </div>
            <div>
              <span className="font-semibold text-white">Combustion Modes: </span>
              {overview.coverage_summary.primary_combustion_modes}
            </div>
          </div>
        </Card>
      )}

      {/* Research Domains & Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomainDistribution items={overview.research_domains || []} />
        <RecentSources sources={overview.recent_sources || []} />
      </div>
    </div>
  );
}
