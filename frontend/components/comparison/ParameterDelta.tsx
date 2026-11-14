import React from "react";
import { ScientificCard } from "@/components/shared/Card";

interface DeltaProps {
  label: string;
  unit?: string;
  valA: number | null | undefined;
  valB: number | null | undefined;
  nameA: string;
  nameB: string;
}

export const ParameterDelta: React.FC<DeltaProps> = ({
  label,
  unit = "",
  valA,
  valB,
  nameA,
  nameB,
}) => {
  const hasBoth = valA !== null && valA !== undefined && valB !== null && valB !== undefined;
  const delta = hasBoth ? valB! - valA! : null;

  return (
    <ScientificCard className="p-3.5 text-xs flex items-center justify-between gap-3">
      <div>
        <span className="font-bold text-brand-navy dark:text-fg-primary">{label}</span>
        <div className="text-[11px] text-fg-muted mt-0.5">
          {nameA}: {valA !== null && valA !== undefined ? `${valA} ${unit}` : "N/A"} vs{" "}
          {nameB}: {valB !== null && valB !== undefined ? `${valB} ${unit}` : "N/A"}
        </div>
      </div>
      {delta !== null ? (
        <span
          className={`font-mono font-bold shrink-0 ${
            delta > 0
              ? "text-brand-flame-orange"
              : delta < 0
                ? "text-brand-cyan"
                : "text-fg-muted"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta} {unit}
        </span>
      ) : (
        <span className="text-[10px] text-fg-muted italic shrink-0">No numerical diff</span>
      )}
    </ScientificCard>
  );
};
