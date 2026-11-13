import React from "react";
import { Card } from "@/components/shared/Card";

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
  const delta = hasBoth ? (valB! - valA!) : null;

  return (
    <Card className="p-3 text-xs flex items-center justify-between">
      <div>
        <span className="font-semibold text-slate-200">{label}</span>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {nameA}: {valA !== null && valA !== undefined ? `${valA} ${unit}` : "N/A"} vs{" "}
          {nameB}: {valB !== null && valB !== undefined ? `${valB} ${unit}` : "N/A"}
        </div>
      </div>
      {delta !== null ? (
        <span
          className={`font-mono font-bold ${
            delta > 0 ? "text-flame-400" : delta < 0 ? "text-plasma-400" : "text-slate-400"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta} {unit}
        </span>
      ) : (
        <span className="text-[10px] text-slate-500 italic">No direct numerical diff</span>
      )}
    </Card>
  );
};
