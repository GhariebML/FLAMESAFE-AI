"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Sparkles, Sliders, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  const [query, setQuery] = useState("Solid polymer flammability under low ventilation in microgravity");
  const [environment, setEnvironment] = useState("Spacecraft");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string>("");

  const handleRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await apiClient.rankInvestigations({
        query,
        target_environment: environment,
      });
      setResults(res.results || []);
      setDisclaimer(res.scientific_disclaimer || "");
    } catch (err: any) {
      console.error("Failed to rank investigations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-flame-400" />
          Scientific Relevance Ranking & Gaps
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Module 4: Multi-factor weighted scoring model (R = 0.30D + 0.25F + 0.20C + 0.15M + 0.10Q) matching investigations to scientific research needs.
        </p>
      </div>

      {/* Query Form */}
      <Card className="space-y-4">
        <form onSubmit={handleRank} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Research Inquiry / Safety Focus
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Quench limits of acrylic polymers in low ventilation..."
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Exploration Regime
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-xs text-slate-200"
              >
                <option value="Spacecraft">Spacecraft (Orbital Microgravity)</option>
                <option value="Space Station">Space Station (Long-duration)</option>
                <option value="Lunar Habitat">Lunar Habitat (0.166 g)</option>
                <option value="Mars Habitat">Mars Habitat (0.38 g)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sliders className="h-3 w-3" /> Weights: Domain 30% · Fuel 25% · Conditions 20% · Mission 15% · Quality 10%
            </div>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Compute Relevance Ranking
            </Button>
          </div>
        </form>
      </Card>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Ranked Scientific Investigations</h3>
          <div className="space-y-3">
            {results.map((r, idx) => (
              <Card key={r.investigation_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-flame-400">#{idx + 1}</span>
                    <Badge variant="flame">{r.acronym}</Badge>
                    <span className="text-sm font-bold text-white">{r.title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-black text-white">{r.relevance_score}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{r.explanation}</p>

                {/* Factor Breakdown Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2.5 rounded-lg bg-space-950 border border-space-800 text-[11px]">
                  <div>
                    <span className="block text-slate-500">Domain (30%)</span>
                    <span className="font-mono font-semibold text-slate-200">{r.factor_breakdown.domain_score}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Fuel (25%)</span>
                    <span className="font-mono font-semibold text-slate-200">{r.factor_breakdown.fuel_score}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Conditions (20%)</span>
                    <span className="font-mono font-semibold text-slate-200">{r.factor_breakdown.condition_score}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Mission (15%)</span>
                    <span className="font-mono font-semibold text-slate-200">{r.factor_breakdown.mission_score}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Quality (10%)</span>
                    <span className="font-mono font-semibold text-slate-200">{r.factor_breakdown.quality_score}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {r.supporting_evidence_count} peer-reviewed research papers backing
                  </span>
                  <Link
                    href={`/investigations/${r.investigation_id}`}
                    className="text-xs font-semibold text-flame-400 hover:text-flame-300 inline-flex items-center gap-1"
                  >
                    View Investigation <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Disclaimer */}
      {disclaimer && (
        <Card className="border-amber-500/30 bg-amber-950/10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldAlert className="h-3.5 w-3.5" /> Scientific Relevance Disclaimer
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{disclaimer}</p>
        </Card>
      )}
    </div>
  );
}
