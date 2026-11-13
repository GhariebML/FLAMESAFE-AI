import React from "react";
import { ComparisonResponse } from "@/types/comparison";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Info, AlertTriangle } from "lucide-react";

export const ComparisonMatrix: React.FC<{ data: ComparisonResponse }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Scientific Summary Banner */}
      <Card className="border-plasma-500/30 bg-plasma-950/10 space-y-2">
        <div className="flex items-center gap-2 text-plasma-400 font-semibold text-sm">
          <Info className="h-4 w-4" /> Comparative Scientific Overview
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{data.scientific_summary}</p>
      </Card>

      {/* Structured Comparison Table */}
      <Card className="overflow-x-auto p-0 border border-space-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-space-800 bg-space-950/80">
              <th className="p-4 font-semibold text-slate-400 w-1/4">Parameter / Condition</th>
              {data.investigations.map((inv) => (
                <th key={inv.id} className="p-4 font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <Badge variant="flame">{inv.acronym}</Badge>
                    <span className="truncate">{inv.title}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800">
            {data.parameter_matrix.map((param) => (
              <tr key={param.parameter_name} className="hover:bg-space-900/40">
                <td className="p-4 font-medium text-slate-300">
                  {param.display_name}
                  {param.unit && <span className="text-[10px] text-slate-500 ml-1">({param.unit})</span>}
                </td>
                {data.investigations.map((inv) => (
                  <td key={inv.id} className="p-4 text-slate-300 font-mono">
                    {param.values_by_investigation[inv.acronym] !== undefined
                      ? String(param.values_by_investigation[inv.acronym])
                      : "Not recorded"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Limitations Advisory */}
      <Card className="border-amber-500/30 bg-amber-950/10 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4" /> Scientific Comparison Limitations
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
          {data.comparison_limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
