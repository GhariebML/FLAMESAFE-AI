"use client";

import React from "react";
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
import { ChartContainer } from "@/components/ui/ChartContainer";
import { useChartTheme } from "@/lib/design-system/useChartTheme";

interface DomainItem {
  domain: string;
  investigations_count: number;
  runs_count: number;
}

export const DomainDistribution: React.FC<{ items: DomainItem[] }> = ({ items }) => {
  const chartTheme = useChartTheme();
  const chartData = items.map((item) => ({
    name:
      item.domain.length > 22 ? `${item.domain.slice(0, 20)}...` : item.domain,
    fullName: item.domain,
    Programs: item.investigations_count,
    Runs: item.runs_count,
  }));

  return (
    <ChartContainer
      title="Combustion Research Domain Coverage"
      description="Empirical investigation programs and experimental test runs indexed per NASA microgravity research area."
      unitLabel="Count"
      badgeText="NASA PSI"
      isEmpty={items.length === 0}
      height={280}
      footerNote="Source: Live aggregation from PostgreSQL/SQLite investigations & experimental_runs tables."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 16, left: -12, bottom: 24 }}
        >
          <defs>
            <linearGradient id="domainProgramsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="domainRunsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={1} />
              <stop offset="100%" stopColor="#0891B2" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
          <XAxis
            dataKey="name"
            tick={{ fill: chartTheme.axisTickColor, fontSize: 10 }}
            angle={-14}
            textAnchor="end"
            interval={0}
            height={52}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: chartTheme.cursorFill }}
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              borderColor: chartTheme.tooltipBorder,
              borderRadius: "0.75rem",
              fontSize: "12px",
              color: chartTheme.tooltipText,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName || ""
            }
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px", color: chartTheme.axisTickColor }} />
          <Bar
            dataKey="Programs"
            fill="url(#domainProgramsGrad)"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="Runs"
            fill="url(#domainRunsGrad)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
