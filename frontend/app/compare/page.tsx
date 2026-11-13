"use client";

import React, { useState, useEffect } from "react";
import { useInvestigations } from "@/hooks/useInvestigations";
import { useCompare } from "@/hooks/useCompare";
import { ComparisonMatrix } from "@/components/comparison/ComparisonMatrix";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Scale, Layers } from "lucide-react";

export default function ComparePage() {
  const { investigations, isLoading: isInvLoading } = useInvestigations();
  const { data: comparisonData, isLoading: isComparing, executeCompare, error } = useCompare();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Automatically select first two investigations by default
  useEffect(() => {
    if (investigations.length >= 2 && selectedIds.length === 0) {
      const initial = [investigations[0].id, investigations[1].id];
      setSelectedIds(initial);
      executeCompare({ investigation_ids: initial });
    }
  }, [investigations]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // Keep at least 2
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) return prev; // Maximum 4 for readable matrix
        return [...prev, id];
      }
    });
  };

  const handleRunComparison = () => {
    if (selectedIds.length >= 2) {
      executeCompare({ investigation_ids: selectedIds });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Scale className="h-6 w-6 text-flame-400" />
          Scientific Investigation Comparison
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select 2 to 4 NASA combustion investigations to compare experimental geometries, airflow regimes, and sensor setups.
        </p>
      </div>

      {/* Investigation Selector */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Select Investigations to Compare (Selected: {selectedIds.length})
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
                  onClick={() => toggleSelect(inv.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-flame-500/20 text-flame-400 border-flame-500/50 shadow-sm"
                      : "bg-space-950 text-slate-400 border-space-800 hover:border-space-700 hover:text-slate-200"
                  }`}
                >
                  [{inv.acronym}] {inv.title}
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
