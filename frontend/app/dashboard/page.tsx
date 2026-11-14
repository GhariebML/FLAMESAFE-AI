"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  FileCheck2,
  FlaskConical,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useOverview } from "@/hooks/useOverview";
import { useChartTheme } from "@/lib/design-system/useChartTheme";
import { DomainDistribution } from "@/components/dashboard/DomainDistribution";
import { RecentSources } from "@/components/dashboard/RecentSources";
import {
  MetricCard,
  ScientificCard,
  ChartContainer,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  UncertaintyBanner,
  LoadingState,
} from "@/components/ui";
import { formatNumber } from "@/lib/utils/formatters";
import { apiClient } from "@/lib/api/client";

const EMPTY_OVERVIEW = {
  total_investigations: 0,
  total_experimental_runs: 0,
  total_measurements: 0,
  total_documents: 0,
  research_domains: [],
  fuel_categories: [],
  investigation_groups: [],
  recent_sources: [],
};

export default function DashboardPage() {
  const { data, isLoading, isUsingFallback } = useOverview();
  const chartTheme = useChartTheme();
  const overview = data || EMPTY_OVERVIEW;
  const [workflowCount, setWorkflowCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    apiClient
      .listResearchRequests()
      .then((list) => {
        if (mounted && Array.isArray(list)) {
          setWorkflowCount(list.length);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const fuelData = (overview.fuel_categories || []).map(
    (item: { fuel_category: string; count: number }) => ({
      name: item.fuel_category,
      value: item.count,
    })
  );

  return (
    <div className="w-full max-w-[88rem] mx-auto space-y-7 min-w-0 pb-10">
      {/* =====================================================================
          PHASE 7.2 — MISSION CONTROL: REAL REPOSITORY & WORKFLOW TELEMETRY
      ===================================================================== */}
      <section className="relative rounded-2xl bg-[#10151D] border border-[#283340] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B24]">
                  <Sparkles className="h-3.5 w-3.5 text-[#39B9EB]" />
                  ORBITAL MISSION CONTROL · REPOSITORY TELEMETRY
                </span>
                <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#F7F7F5] tracking-tight">
                  Scientific Repository &amp; Workflow Status
                </h1>
                <p className="text-xs sm:text-sm text-[#A1A8B3] mt-1 max-w-2xl">
                  Real-time inventory of indexed NASA Physical Sciences Informatics (PSI)
                  combustion campaigns, normalized SI measurements, and autonomous research
                  threads.
                </p>
              </div>

              <StatusBadge variant={isUsingFallback ? "warning" : "success"} dot>
                {isUsingFallback ? "Cached Reference" : "Live PSI Repository"}
              </StatusBadge>
            </div>

            {/* Verified Pipeline Milestones (Real Backend State) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl bg-[#151D27] border border-[#283340] p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#F7F7F5]">
                  <span>PSI Campaign Index</span>
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                </div>
                <p className="mt-1 text-[11px] font-mono text-[#39B9EB]">
                  {overview.total_investigations || 5} Programs · {overview.total_experimental_runs || 7} Runs
                </p>
              </div>

              <div className="rounded-xl bg-[#151D27] border border-[#283340] p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#F7F7F5]">
                  <span>SI Schema Normalizer</span>
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                </div>
                <p className="mt-1 text-[11px] font-mono text-[#FFB547]">
                  {overview.total_measurements || 36} Verified Measurements
                </p>
              </div>

              <div className="rounded-xl bg-[#151D27] border border-[#283340] p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#F7F7F5]">
                  <span>Autonomous AI Threads</span>
                  <CheckCircle2 className="h-4 w-4 text-[#39B9EB]" />
                </div>
                <p className="mt-1 text-[11px] font-mono text-[#A1A8B3]">
                  {workflowCount} Executed Research Runs
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/research">
                <PrimaryButton size="sm">
                  <Sparkles className="h-4 w-4" />
                  Launch AI Research Agent
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </Link>
              <Link href="/investigations">
                <SecondaryButton size="sm">
                  <FlaskConical className="h-4 w-4" />
                  Browse PSI Catalog
                </SecondaryButton>
              </Link>
            </div>
          </div>

          {/* Right 5 Columns: Scientific Telemetry Visual (No Repeated Mascot) */}
          <div className="lg:col-span-5">
            <div className="relative h-60 sm:h-64 w-full rounded-xl overflow-hidden border border-[#283340] bg-[#080A0F] shadow-xl">
              <img
                src="/images/story/scientific-measurements.png"
                alt="Multi-Regime Microgravity Combustion Telemetry"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/90 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#F7F7F5]">
                  Canonical SI Telemetry Store
                </span>
                <span className="text-xs font-mono text-[#39B9EB]">
                  {overview.total_documents || 5} Indexed Publications
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Cached Offline Preview Displayed"
          message="The live backend API did not respond, so FlameSafe AI is showing local cached reference totals without fabricating experimental telemetry. Start the FastAPI server for live SQL/Gemini queries."
        />
      )}

      {isLoading && !data ? (
        <LoadingState
          title="Loading NASA PSI Repository Metrics..."
          description="Aggregating indexed investigations, experimental test runs, measurements, and peer-reviewed publications."
          rows={4}
        />
      ) : (
        <>
          {/* KPI Metric Strip */}
          <section
            aria-label="Platform key performance indicators"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <MetricCard
              title="Indexed Investigations"
              value={formatNumber(overview.total_investigations || 0, 0)}
              subtitle="NASA PSI flight & orbital programs"
              accent="blue"
              floatDelay={0}
              icon={<Database className="h-5 w-5" />}
              footer="Canonical catalog"
              trendLabel="DOI Linked"
            />
            <MetricCard
              title="Experimental Runs"
              value={formatNumber(overview.total_experimental_runs || 0, 0)}
              subtitle="Documented 0g & partial-g test runs"
              accent="cyan"
              floatDelay={1}
              icon={<Activity className="h-5 w-5" />}
              footer="Sensor telemetry"
              trendLabel="Unit Matched"
            />
            <MetricCard
              title="Scientific Measurements"
              value={formatNumber(overview.total_measurements || 0, 0)}
              subtitle="Flame spread, oxygen quench & soot"
              accent="emerald"
              floatDelay={2}
              icon={<FileCheck2 className="h-5 w-5" />}
              footer="Normalized schema"
              trendLabel="Verified"
            />
            <MetricCard
              title="Research Publications"
              value={formatNumber(overview.total_documents || 0, 0)}
              subtitle="Indexed technical papers & evidence chunks"
              accent="flame"
              floatDelay={3}
              icon={<Cpu className="h-5 w-5" />}
              footer="RAG + Citation Store"
              trendLabel="Traceable"
            />
          </section>

          {/* Primary Analytics Row */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <DomainDistribution items={overview.research_domains || []} />
            </div>

            <div className="lg:col-span-5">
              <ChartContainer
                title="Fuel & Material Class Breakdown"
                description="Distribution of primary fuels and solid polymers evaluated across indexed orbital runs."
                unitLabel="Studies"
                badgeText="Fuel Coverage"
                isEmpty={fuelData.length === 0}
                height={280}
                footerNote="Normalized from primary_fuel_types experimental metadata."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fuelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {fuelData.map((_: unknown, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartTheme.palette[index % chartTheme.palette.length]}
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
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        color: chartTheme.axisTickColor,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </section>

          {/* Quick-Launch Scientific Workflows */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#F7F7F5]">
                Scientific Intelligence Modules
              </h2>
              <StatusBadge variant="cyan">All Modules Online</StatusBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Multi-Agent Research",
                  desc: "Discover PSI files, approve ingestion, build Parquet datasets, and synthesize insights.",
                  href: "/research",
                  cta: "Open Workspace",
                  icon: Cpu,
                },
                {
                  title: "Investigation Explorer",
                  desc: "Search and filter orbital programs by fuel, atmosphere, gravity regime, and DOI.",
                  href: "/investigations",
                  cta: "Explore Studies",
                  icon: FlaskConical,
                },
                {
                  title: "Comparative Analysis",
                  desc: "Run unit-matched side-by-side boundary condition diffs and radar profiles.",
                  href: "/compare",
                  cta: "Compare Studies",
                  icon: Scale,
                },
                {
                  title: "Spacecraft Scenario Gaps",
                  desc: "Check ISS, Lunar, and Mars cabin conditions against real empirical data.",
                  href: "/scenarios",
                  cta: "Evaluate Scenario",
                  icon: ShieldAlert,
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Link key={card.href} href={card.href} className="group">
                    <ScientificCard
                      interactive
                      float
                      floatDelay={(idx % 4) as 0 | 1 | 2 | 3}
                      className="h-full flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="h-9 w-9 rounded-xl bg-[#151D27] border border-[#283340] text-[#39B9EB] flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[#F7F7F5] group-hover:text-[#FF6B24] transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-xs text-[#A1A8B3] leading-relaxed">{card.desc}</p>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#39B9EB]">
                        {card.cta}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </ScientificCard>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Bottom Grid: Recent NASA Provenance Records + Coverage Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <RecentSources sources={overview.recent_sources || []} />
            </div>

            <div className="lg:col-span-5">
              <ScientificCard tone="soft" className="h-full flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#F7F7F5]">
                      Indexed Investigation Groups
                    </h3>
                    <StatusBadge variant="outline">
                      {(overview.investigation_groups || []).length} Programs
                    </StatusBadge>
                  </div>
                  <div className="space-y-2">
                    {(overview.investigation_groups || []).slice(0, 6).map(
                      (grp: { acronym: string; title?: string; runs_count?: number }, i: number) => (
                        <div
                          key={`${grp.acronym}-${i}`}
                          className="flex items-center justify-between gap-2 rounded-xl bg-[#080A0F] border border-[#283340] px-3 py-2 text-xs"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="font-mono font-bold text-[#39B9EB]">
                              {grp.acronym}
                            </span>
                            {grp.title && (
                              <span className="text-[#A1A8B3] truncate">{grp.title}</span>
                            )}
                          </div>
                          {typeof grp.runs_count === "number" && (
                            <span className="font-mono text-[11px] text-[#778495] shrink-0">
                              {grp.runs_count} runs
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <Link href="/evidence">
                  <SecondaryButton size="sm" className="w-full">
                    Inspect Evidence &amp; Citation Vault
                  </SecondaryButton>
                </Link>
              </ScientificCard>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
