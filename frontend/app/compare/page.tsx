"use client";

import React, { useState, useEffect } from "react";
import { useInvestigations } from "@/hooks/useInvestigations";
import { useCompare } from "@/hooks/useCompare";
import { ComparisonMatrix } from "@/components/comparison/ComparisonMatrix";
import { UncertaintyBanner } from "@/components/ui/UncertaintyBanner";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Scale, Download } from "lucide-react";

export default function ComparePage() {
  const { investigations, isLoading: isInvLoading, isUsingFallback } = useInvestigations();
  const { data: comparisonData, isLoading: isComparing, executeCompare, error } = useCompare();

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <Scale className="h-6 w-6 text-electric-400 shrink-0" />
            <span>Scientific Investigation Comparison Lab</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Select 2 to 4 NASA combustion programs to compare oxygen envelopes, airflow regimes, sensors, and compatible metrics.
          </p>
        </div>

        {comparisonData && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportJSON} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> JSON
            </Button>
          </div>
        )}
      </div>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Backend API Unavailable"
          message="Comparison calculations require the live FastAPI comparison engine. Please verify the backend service on port 8000."
        />
      )}

      {/* Investigation Selector */}
      <Card className="space-y-3 border-space-800 bg-space-900/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Select 2–4 Investigations to Compare (Selected: {selectedIds.length})
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
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                    isSelected
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm"
                      : "bg-space-950 text-slate-400 border-space-800 hover:border-space-700 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono font-bold text-amber-400 mr-1.5">[{inv.acronym}]</span>
                  <span>{inv.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Comparison View */}
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
