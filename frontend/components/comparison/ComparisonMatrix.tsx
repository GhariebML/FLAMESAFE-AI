"use client";

import React from "react";
import { ComparisonResponse } from "@/types/comparison";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { useChartTheme } from "@/lib/design-system/useChartTheme";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Info, AlertTriangle, ExternalLink } from "lucide-react";

export const ComparisonMatrix: React.FC<{ data: ComparisonResponse }> = ({ data }) => {
  const chartTheme = useChartTheme();
  // Compatible quantitative chart data (only unit-matched averages)
  const quantData = data.investigations.map((inv) => ({
    name: inv.acronym,
    "Mean O2 (% O2)": inv.numeric_metrics?.avg_oxygen_pct ?? null,
    "Mean Airflow (cm/s)": inv.numeric_metrics?.avg_airflow_cm_s ?? null,
    "Max Spread Rate (cm/s * 10)":
      inv.numeric_metrics?.max_flame_spread_cm_s !== null &&
      inv.numeric_metrics?.max_flame_spread_cm_s !== undefined
        ? Number((inv.numeric_metrics.max_flame_spread_cm_s * 10).toFixed(2))
        : null,
  }));

  // Normalized coverage RadarChart (experimental runs, measurements, sensor diversity)
  const maxRuns = Math.max(
    1,
    ...data.investigations.map((i) => i.numeric_metrics?.runs_count || 1)
  );
  const maxMeas = Math.max(
    1,
    ...data.investigations.map((i) => i.numeric_metrics?.measurements_count || 1)
  );
  const maxSens = Math.max(
    1,
    ...data.investigations.map((i) => i.numeric_metrics?.sensor_diversity || 1)
  );

  const radarSubjects = [
    {
      metric: "Experimental Runs",
      values: data.investigations.map((i) =>
        Math.round(((i.numeric_metrics?.runs_count || 0) / maxRuns) * 100)
      ),
    },
    {
      metric: "Measurements Recorded",
      values: data.investigations.map((i) =>
        Math.round(((i.numeric_metrics?.measurements_count || 0) / maxMeas) * 100)
      ),
    },
    {
      metric: "Sensor Diversity",
      values: data.investigations.map((i) =>
        Math.round(((i.numeric_metrics?.sensor_diversity || 0) / maxSens) * 100)
      ),
    },
  ];

  const radarData = radarSubjects.map((row) => {
    const entry: Record<string, string | number> = { subject: row.metric };
    data.investigations.forEach((inv, idx) => {
      entry[inv.acronym] = row.values[idx];
    });
    return entry;
  });

  return (
    <div className="space-y-6">
      {/* Scientific Summary Banner */}
      <Card className="border-plasma-500/30 bg-space-900/80 space-y-2">
        <div className="flex items-center gap-2 text-plasma-400 font-semibold text-sm">
          <Info className="h-4 w-4" /> Comparative Scientific Overview
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {data.scientific_summary}
        </p>
      </Card>

      {/* Visual Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Unit-Compatible Boundary Regimes"
          description="Mean ambient oxygen (% O2) and forced airflow velocity (cm/s) across selected orbital runs."
          unitLabel="% O2 | cm/s"
          badgeText="Direct Unit Match"
          isEmpty={quantData.length === 0}
          height={270}
          footerNote="Null/unrecorded parameters are omitted rather than coerced to zero."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quantData} margin={{ top: 10, right: 16, left: -12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
              <XAxis dataKey="name" tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }} />
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
                dataKey="Mean O2 (% O2)"
                fill={chartTheme.palette[0]}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Mean Airflow (cm/s)"
                fill={chartTheme.palette[1]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Normalized Experimental Coverage Profile"
          description="Relative telemetry richness normalized (0-100%) across runs, recorded metrics, and diagnostic sensors."
          unitLabel="% Normalized"
          badgeText="Coverage Radar"
          isEmpty={radarData.length === 0}
          height={270}
          footerNote="Represents dataset instrumentation breadth, NOT physical fire severity."
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke={chartTheme.axisLineColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: chartTheme.axisTickColor, fontSize: 10 }} />
              {data.investigations.map((inv, idx) => (
                <Radar
                  key={inv.id}
                  name={inv.acronym}
                  dataKey={inv.acronym}
                  stroke={chartTheme.palette[idx % chartTheme.palette.length]}
                  fill={chartTheme.palette[idx % chartTheme.palette.length]}
                  fillOpacity={0.22}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: "11px", color: chartTheme.axisTickColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  borderColor: chartTheme.tooltipBorder,
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: chartTheme.tooltipText,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Structured Comparison Table */}
      <Card className="overflow-x-auto p-0 border border-space-800 bg-space-900/80">
        <table className="w-full text-left text-xs border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-space-800 bg-space-950/90">
              <th className="p-4 font-semibold text-slate-400 w-1/4">Parameter / Condition</th>
              {data.investigations.map((inv) => (
                <th key={inv.id} className="p-4 font-bold text-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="flame">{inv.acronym}</Badge>
                    <span className="truncate">{inv.title}</span>
                    {inv.doi && (
                      <a
                        href={`https://doi.org/${inv.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-plasma-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        DOI <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800">
            {data.parameter_matrix.map((param) => (
              <tr key={param.parameter_name} className="hover:bg-space-950/50">
                <td className="p-4 font-medium text-slate-200 align-top">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>{param.display_name}</span>
                    {param.unit && (
                      <span className="text-[10px] font-mono text-plasma-400">
                        ({param.unit})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {param.is_compatible_for_direct_diff
                      ? "Direct unit-compatible comparison"
                      : "Categorical / non-equivalent phases"}
                  </div>
                </td>
                {data.investigations.map((inv) => {
                  const val = param.values_by_investigation[inv.acronym];
                  const isMissing = val === undefined || val === null || val === "Not recorded";
                  return (
                    <td
                      key={inv.id}
                      className={`p-4 font-mono align-top ${
                        isMissing ? "text-slate-500 italic" : "text-slate-200"
                      }`}
                    >
                      {val !== undefined && val !== null ? String(val) : "Not recorded"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Limitations Advisory */}
      <Card className="border-amber-500/30 bg-amber-950/15 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4" /> Scientific Comparison Limitations
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
          {data.comparison_limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
