"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { FUEL_CATEGORIES } from "@/lib/constants/domains";
import { SPACE_ENVIRONMENTS } from "@/lib/constants/environments";
import { ChartContainer, UncertaintyBanner, Card, Button, Badge } from "@/components/ui";
import { useChartTheme } from "@/lib/design-system";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Sparkles, Sliders, ArrowRight, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export default function InsightsPage() {
  const chartTheme = useChartTheme();
  const [query, setQuery] = useState(
    "Solid polymer flammability and airflow quench limits in microgravity"
  );
  const [environment, setEnvironment] = useState("Spacecraft");
  const [fuelCategory, setFuelCategory] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>("");

  const executeRanking = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.rankInvestigations({
        query,
        target_environment: environment || undefined,
        fuel_category: fuelCategory || undefined,
      });
      setResults(res.results || []);
      setDisclaimer(res.scientific_disclaimer || "");
    } catch (err: any) {
      setError(err.message || "Failed to compute scientific relevance ranking.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRank = (e: React.FormEvent) => {
    e.preventDefault();
    executeRanking();
  };

  const chartData = results.map((r) => ({
    name: r.acronym,
    "Relevance Score": r.relevance_score,
    "Measurement Completeness (%)": r.measurement_completeness ?? 100,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-400 shrink-0" />
          <span>Scientific Relevance Ranking & Coverage Insights</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Transparent multi-factor scoring model (R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q) with separate Measurement Completeness telemetry.
        </p>
      </div>

      {/* Query Form */}
      <Card className="space-y-4 border-space-800 bg-space-900/80">
        <form onSubmit={handleRank} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Research Inquiry / Fire Safety Focus
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Quench limits of acrylic polymers in low ventilation..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs sm:text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Mission Regime
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200"
              >
                {SPACE_ENVIRONMENTS.map((env) => (
                  <option key={env.id} value={env.name}>
                    {env.name} ({env.gravityLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Fuel Category (Optional)
              </label>
              <select
                value={fuelCategory}
                onChange={(e) => setFuelCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200"
              >
                <option value="">All Fuel Categories</option>
                {FUEL_CATEGORIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-plasma-400" />
              <span>Weights: 0.30 Domain · 0.25 Fuel · 0.20 Conditions · 0.15 Mission · 0.10 Quality</span>
            </div>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Compute Relevance Ranking
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <UncertaintyBanner
          variant="warning"
          title="Ranking Service Unavailable"
          message={error}
        />
      )}

      {/* Visual Score Comparison Chart */}
      {results.length > 0 && (
        <ChartContainer
          title="Research Relevance vs. Measurement Completeness"
          description="Compares weighted topic alignment (R) against recorded empirical measurement completeness."
          unitLabel="0 - 100 Scale"
          badgeText="Explainable Scoring"
          height={250}
          footerNote="Scores measure literature & metadata alignment only — NEVER physical fire-risk probability."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
              <XAxis dataKey="name" tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: chartTheme.cursorFill }}
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  borderColor: chartTheme.tooltipBorder,
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: chartTheme.tooltipText,
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", color: chartTheme.axisTickColor }} />
              <Bar
                dataKey="Relevance Score"
                fill={chartTheme.palette[2]}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Measurement Completeness (%)"
                fill={chartTheme.palette[1]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Ranked Results Cards */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, idx) => (
            <Card key={r.investigation_id} className="space-y-3 border-space-800 bg-space-900/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">#{idx + 1}</span>
                  <Badge variant="flame">{r.acronym}</Badge>
                  <span className="text-sm sm:text-base font-bold text-white">{r.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase">Completeness</span>
                    <span className="font-mono text-xs font-semibold text-plasma-400">
                      {r.measurement_completeness ?? 100}%
                    </span>
                  </div>
                  <div className="text-right pl-3 border-l border-space-800">
                    <span className="text-xl font-mono font-black text-white">
                      {r.relevance_score}
                    </span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{r.explanation}</p>

              {/* Factor Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-space-950 border border-space-800 text-[11px]">
                <div>
                  <span className="block text-slate-500">Domain (30%)</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {r.factor_breakdown.domain_score}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Fuel (25%)</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {r.factor_breakdown.fuel_score}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Conditions (20%)</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {r.factor_breakdown.condition_score}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Mission (15%)</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {r.factor_breakdown.mission_score}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Quality (10%)</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {r.factor_breakdown.quality_score}
                  </span>
                </div>
              </div>

              {/* Matched & Missing Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Matched Factors
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    {(r.matched_factors || []).map((f: string, i: number) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Missing / Unmatched Factors
                  </span>
                  <ul className="space-y-0.5 text-slate-400">
                    {(r.missing_factors || []).length > 0 ? (
                      r.missing_factors.map((f: string, i: number) => <li key={i}>• {f}</li>)
                    ) : (
                      <li>• All queried factors covered in metadata</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-space-800/70">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{r.supporting_evidence_count} indexed paper(s)</span>
                  {r.doi && (
                    <a
                      href={`https://doi.org/${r.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-plasma-400 hover:underline inline-flex items-center gap-1"
                    >
                      DOI: {r.doi} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <Link
                  href={`/investigations/${r.investigation_id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  Open Full Profile <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {disclaimer && (
        <UncertaintyBanner
          variant="extrapolation"
          title="Scientific Relevance Disclaimer"
          message={disclaimer}
        />
      )}
    </div>
  );
}
