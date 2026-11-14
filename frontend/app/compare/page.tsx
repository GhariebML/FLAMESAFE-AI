"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useInvestigations } from "@/hooks/useInvestigations";
import { useCompare } from "@/hooks/useCompare";
import { ComparisonMatrix } from "@/components/comparison/ComparisonMatrix";
import { UncertaintyBanner } from "@/components/ui/UncertaintyBanner";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Download, ArrowRight, Scale, CheckCircle2, AlertTriangle } from "lucide-react";

type GravityMode = "earth" | "microgravity" | "lunar";

export default function ComparePage() {
  const { investigations, isLoading: isInvLoading, isUsingFallback } = useInvestigations();
  const { data: comparisonData, isLoading: isComparing, executeCompare, error } = useCompare();

  const [gravityMode, setGravityMode] = useState<GravityMode>("microgravity");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (investigations.length >= 2 && selectedIds.length === 0) {
      const initial = [investigations[0].id, investigations[1].id];
      setSelectedIds(initial);
      executeCompare({ investigation_ids: initial });
    }
  }, [investigations, selectedIds.length, executeCompare]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, id];
      }
    });
  };

  const handleRunComparison = () => {
    if (selectedIds.length >= 2) {
      executeCompare({ investigation_ids: selectedIds });
    }
  };

  const handleExportJSON = () => {
    if (!comparisonData) return;
    const blob = new Blob([JSON.stringify(comparisonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flamesafe-comparison-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!comparisonData) return;
    const headers = ["Parameter", "Unit", ...comparisonData.investigations.map((i) => i.acronym)];
    const rows = comparisonData.parameter_matrix.map((p) => [
      `"${p.display_name}"`,
      `"${p.unit || ""}"`,
      ...comparisonData.investigations.map(
        (i) => `"${String(p.values_by_investigation[i.acronym] ?? "Not recorded").replace(/"/g, '""')}"`
      ),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flamesafe-comparison-matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const gravityMeta =
    gravityMode === "earth"
      ? {
          status: "Measured 1g Terrestrial Baseline",
          isExtrapolated: false,
          insight:
            "On Earth (1.0g), natural buoyant convection accelerates hot combustion products upward, drawing fresh oxidizer into the base and forming a yellow teardrop flame.",
        }
      : gravityMode === "lunar"
      ? {
          status: "Extrapolated Partial-g Scenario (Research Gap)",
          isExtrapolated: true,
          insight:
            "In Lunar partial gravity (0.16g), weak buoyancy combines with reduced-pressure elevated-O₂ cabin atmospheres; direct flight measurements remain sparse across NASA PSI.",
        }
      : {
          status: "Measured ISS Flight Data (NASA PSI)",
          isExtrapolated: false,
          insight:
            "In orbital microgravity (~0g), buoyant convection vanishes; oxygen transport is governed by molecular diffusion and low-velocity HVAC flow, forming a spherical diffusion flame.",
        };

  return (
    <div className="w-full max-w-[88rem] mx-auto space-y-8 min-w-0 pb-10">
      {/* =====================================================================
          PHASE 7.5 — DATA OBSERVATORY: MEASURED vs EXTRAPOLATED GRAVITY REGIMES
      ===================================================================== */}
      <section className="relative rounded-2xl bg-[#10151D] border border-[#283340] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Left 8 Columns: Title, Regime Pills & 3 Provenance-Labeled Flame Cards */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#39B9EB]">
                  <Scale className="h-3.5 w-3.5 text-[#FF6B24]" />
                  DATA OBSERVATORY · GRAVITY REGIME COMPARISON
                </span>
                <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#F7F7F5] tracking-tight">
                  Microgravity vs. Terrestrial &amp; Lunar Regimes
                </h1>
                <p className="text-xs sm:text-sm text-[#A1A8B3] mt-1">
                  Compare measured ISS microgravity (`~0g`) and terrestrial (`1g`) baselines
                  against extrapolated partial-gravity (`0.16g`) scenarios.
                </p>
              </div>

              {/* Gravity Regime Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "earth", label: "1.0g Earth" },
                    { id: "microgravity", label: "~0g Microgravity" },
                    { id: "lunar", label: "0.16g Lunar (Gap)" },
                  ] as const
                ).map((tab) => {
                  const active = gravityMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setGravityMode(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        active
                          ? "bg-[#FF6B24] text-white keep-white shadow-[0_0_16px_rgba(255,107,36,0.35)]"
                          : "bg-[#151D27] text-[#A1A8B3] border border-[#283340] hover:text-[#F7F7F5]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Flame Regime Cards with Explicit Provenance Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setGravityMode("earth")}
                className={`cursor-pointer rounded-xl bg-[#080A0F] border p-3.5 text-center transition-all ${
                  gravityMode === "earth"
                    ? "border-[#FF6B24] ring-1 ring-[#FF6B24]/40"
                    : "border-[#283340] hover:border-[#39B9EB]/50"
                }`}
              >
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black">
                  <img
                    src="/images/story/flame-on-earth.webp"
                    alt="On Earth 1G Buoyant Teardrop Flame"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-[#10151D]/90 border border-[#22C55E]/40 px-2 py-0.5 text-[10px] font-mono text-[#22C55E]">
                    Measured 1g Baseline
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-bold text-[#F7F7F5]">On Earth (1.0g)</p>
                <p className="text-[11px] font-mono text-[#FFB547]">Buoyancy-Driven Teardrop</p>
              </div>

              <div
                onClick={() => setGravityMode("microgravity")}
                className={`cursor-pointer rounded-xl bg-[#080A0F] border p-3.5 text-center transition-all ${
                  gravityMode === "microgravity"
                    ? "border-[#39B9EB] ring-1 ring-[#39B9EB]/40"
                    : "border-[#283340] hover:border-[#39B9EB]/50"
                }`}
              >
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black">
                  <img
                    src="/images/story/flame-in-space.webp"
                    alt="In Space 0G Spherical Diffusion Flame"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-[#10151D]/90 border border-[#39B9EB]/50 px-2 py-0.5 text-[10px] font-mono text-[#39B9EB]">
                    Measured ISS Flight Data
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-bold text-[#F7F7F5]">In Space (~0g)</p>
                <p className="text-[11px] font-mono text-[#39B9EB]">Spherical Diffusion Shell</p>
              </div>

              <div
                onClick={() => setGravityMode("lunar")}
                className={`cursor-pointer rounded-xl bg-[#080A0F] border p-3.5 text-center transition-all ${
                  gravityMode === "lunar"
                    ? "border-[#FFB547] ring-1 ring-[#FFB547]/40"
                    : "border-[#283340] hover:border-[#39B9EB]/50"
                }`}
              >
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black">
                  <img
                    src="/images/story/flame-lunar.webp"
                    alt="Lunar Gravity 0.16G Partial Buoyancy Concept"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-[#10151D]/90 border border-[#FFB547]/50 px-2 py-0.5 text-[10px] font-mono text-[#FFB547]">
                    Extrapolated Scenario
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-bold text-[#F7F7F5]">Lunar Gravity (0.16g)</p>
                <p className="text-[11px] font-mono text-[#FFB547]">Partial Buoyancy (Gap Area)</p>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Scientific Telemetry Visual + Provenance Insight */}
          <div className="lg:col-span-4">
            <div className="rounded-xl bg-[#151D27] border border-[#283340] p-5 space-y-4">
              <div className="relative h-44 w-full rounded-lg overflow-hidden border border-[#283340] bg-[#080A0F]">
                <img
                  src="/images/story/scientific-measurements.webp"
                  alt="Multi-Regime Flame Front Telemetry"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/85 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold ${
                      gravityMeta.isExtrapolated ? "text-[#FFB547]" : "text-[#22C55E]"
                    }`}
                  >
                    {gravityMeta.isExtrapolated ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {gravityMeta.status}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#A1A8B3] leading-relaxed">
                {gravityMeta.insight}
              </p>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/investigations"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#10151D] hover:bg-[#1C2633] border border-[#283340] text-xs font-semibold text-[#F7F7F5] transition-all"
                >
                  <span>Inspect PSI Studies</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#39B9EB]" />
                </Link>

                {comparisonData && (
                  <div className="flex items-center gap-1.5">
                    <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                      <Download className="h-3.5 w-3.5" /> CSV
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleExportJSON}>
                      <Download className="h-3.5 w-3.5" /> JSON
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Demo Comparison Mode"
          message="Using local reference data because the backend API was unreachable."
        />
      )}

      {/* Investigation Selector Panel */}
      <Card className="space-y-4 border-[#283340] bg-[#10151D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#F7F7F5]">
              Select 2 to 4 Investigations to Compare ({selectedIds.length} selected)
            </h3>
            <p className="text-xs text-[#A1A8B3]">
              Click cards below to toggle selection, then update the comparison matrix.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunComparison}
            disabled={selectedIds.length < 2 || isComparing}
          >
            {isComparing ? "Computing Matrix..." : "Update Comparison"}
          </Button>
        </div>

        {isInvLoading ? (
          <LoadingSkeleton className="h-24" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {investigations.map((inv) => {
              const isSelected = selectedIds.includes(inv.id);
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => toggleSelect(inv.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#151D27] border-[#39B9EB] ring-1 ring-[#39B9EB]/35"
                      : "bg-[#080A0F] border-[#283340] hover:border-[#778495]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#39B9EB]">
                      {inv.acronym}
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? "bg-[#39B9EB] border-[#39B9EB] text-[#080A0F] font-bold"
                          : "border-[#778495]"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#F7F7F5] line-clamp-1">
                    {inv.title}
                  </div>
                  <div className="text-[11px] text-[#778495] mt-1">
                    {inv.experimental_runs_count} runs · {inv.research_area}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {error && (
        <UncertaintyBanner variant="warning" title="Comparison Notice" message={error} />
      )}

      {isComparing ? (
        <LoadingSkeleton className="h-96" />
      ) : comparisonData ? (
        <ComparisonMatrix data={comparisonData} />
      ) : null}
    </div>
  );
}
