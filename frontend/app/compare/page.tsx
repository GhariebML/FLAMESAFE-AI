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
import { Download, ArrowRight, Sparkles } from "lucide-react";

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

  const gravityInsight =
    gravityMode === "earth"
      ? "On Earth (1g), buoyant convection pulls hot gases upward into a classic yellow teardrop flame."
      : gravityMode === "lunar"
      ? "In Lunar gravity (0.16g), partial buoyancy accelerates flame spread under reduced-pressure cabin oxygen."
      : "In microgravity (0g), flames form a spherical diffusion shell instead of a teardrop.";

  return (
    <div className="w-full max-w-[88rem] mx-auto space-y-8 min-w-0 pb-10">
      {/* =====================================================================
          DEDICATED STORYBOARD SHOWCASE: MICROGRAVITY VS EARTH
      ===================================================================== */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#060E20] via-[#09152E] to-[#050A18] border-2 border-[#254B8C]/90 p-6 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Left 8 Columns: Title, Regime Pills & 3 Ultra-HD Flame Cards */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#39B9EB]">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF7A18]" />
                  DATA OBSERVATORY • GRAVITY REGIMES
                </span>
                <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Microgravity vs Earth
                </h1>
                <p className="text-sm text-[#B4C6E4] mt-1">
                  See how fire behaves differently in space!
                </p>
              </div>

              {/* Gravity Regime Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "earth", label: "Earth Gravity" },
                    { id: "microgravity", label: "Microgravity" },
                    { id: "lunar", label: "Lunar Gravity" },
                  ] as const
                ).map((tab) => {
                  const active = gravityMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setGravityMode(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        active
                          ? "bg-gradient-to-r from-[#FF7A18] to-[#E94B16] text-white border border-[#FFB547]/60 shadow-[0_0_18px_rgba(255,122,24,0.45)]"
                          : "bg-[#0A162E] text-[#9BB0CD] border border-[#1E3A6E] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Ultra-HD Flame Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setGravityMode("earth")}
                className={`cursor-pointer rounded-2xl bg-[#040914] border p-3.5 text-center transition-all ${
                  gravityMode === "earth"
                    ? "border-[#FF7A18] ring-2 ring-[#FF7A18]/35 shadow-[0_0_28px_rgba(255,122,24,0.28)]"
                    : "border-[#1E3A6E] hover:border-[#39B9EB]/60"
                }`}
              >
                <div className="h-52 w-full rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/story/flame-on-earth.png"
                    alt="On Earth 1G Teardrop Flame"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-3 text-sm font-extrabold text-white">On Earth</p>
                <p className="text-[11px] font-mono text-[#FFB547]">1.0G Buoyant Teardrop</p>
              </div>

              <div
                onClick={() => setGravityMode("microgravity")}
                className={`cursor-pointer rounded-2xl bg-[#040914] border p-3.5 text-center transition-all ${
                  gravityMode === "microgravity"
                    ? "border-[#39B9EB] ring-2 ring-[#39B9EB]/35 shadow-[0_0_28px_rgba(57,185,235,0.3)]"
                    : "border-[#1E3A6E] hover:border-[#39B9EB]/60"
                }`}
              >
                <div className="h-52 w-full rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/story/flame-in-space.png"
                    alt="In Space 0G Spherical Flame"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-3 text-sm font-extrabold text-white">In Space</p>
                <p className="text-[11px] font-mono text-[#39B9EB]">0G Spherical Diffusion</p>
              </div>

              <div
                onClick={() => setGravityMode("lunar")}
                className={`cursor-pointer rounded-2xl bg-[#040914] border p-3.5 text-center transition-all ${
                  gravityMode === "lunar"
                    ? "border-[#FFB547] ring-2 ring-[#FFB547]/35 shadow-[0_0_28px_rgba(255,181,71,0.3)]"
                    : "border-[#1E3A6E] hover:border-[#39B9EB]/60"
                }`}
              >
                <div className="h-52 w-full rounded-xl overflow-hidden bg-black">
                  <img
                    src="/images/story/flame-lunar.png"
                    alt="Lunar Gravity 0.16G Dome Flame"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-3 text-sm font-extrabold text-white">Lunar Gravity</p>
                <p className="text-[11px] font-mono text-[#FFB547]">0.16G Partial Buoyancy</p>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Realistic Astro-Flame Bot Window + Key Insight Card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[#081632]/95 border border-[#254B8C] p-5 shadow-2xl space-y-4">
              <div className="relative h-56 w-full rounded-xl overflow-hidden border border-[#1E3A6E]">
                <img
                  src="/images/story/mascot-window.png"
                  alt="Realistic Astro-Flame Bot observing microgravity flame"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060E20]/85 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3.5 text-sm font-extrabold text-[#FFB547]">
                  Key Insight:
                </span>
              </div>

              <p className="text-sm text-[#D6E4FF] leading-relaxed">
                {gravityInsight}
              </p>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/investigations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10244A] hover:bg-[#FF7A18] border border-[#39B9EB]/50 text-xs font-bold text-white transition-all"
                >
                  <span>Explore More</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {comparisonData && (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1">
                      <Download className="h-3.5 w-3.5" /> CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExportJSON} className="gap-1">
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
          title="Backend API Unavailable"
          message="Comparison calculations require the live FastAPI comparison engine."
        />
      )}

      {/* Multi-Study Comparison Selector */}
      <Card className="space-y-3 border-[#1E3A6E] bg-[#071226]/90">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-white">
            Select 2–4 NASA PSI Investigations to Compare Side-by-Side (Selected: {selectedIds.length})
          </span>
          <Button
            size="sm"
            variant="primary"
            isLoading={isComparing}
            disabled={selectedIds.length < 2}
            onClick={handleRunComparison}
          >
            Update Comparison
          </Button>
        </div>

        {isInvLoading ? (
          <LoadingSkeleton className="h-14 w-full" />
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {investigations.map((inv) => {
              const isSelected = selectedIds.includes(inv.id);
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => toggleSelect(inv.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isSelected
                      ? "bg-[#11264E] text-white border-[#39B9EB] shadow-[0_0_14px_rgba(57,185,235,0.25)]"
                      : "bg-[#050C1D] text-[#9BB0CD] border-[#1E3A6E] hover:border-[#39B9EB]/50 hover:text-white"
                  }`}
                >
                  <span className="font-mono font-bold text-[#FFB547] mr-1.5">[{inv.acronym}]</span>
                  <span>{inv.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Comparison Matrix View */}
      {isComparing ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-80 w-full" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      ) : comparisonData ? (
        <ComparisonMatrix data={comparisonData} />
      ) : null}
    </div>
  );
}
