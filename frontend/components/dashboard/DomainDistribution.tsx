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
import { DESIGN_TOKENS } from "@/lib/design-system/tokens";

interface DomainItem {
  domain: string;
  investigations_count: number;
  runs_count: number;
}

export const DomainDistribution: React.FC<{ items: DomainItem[] }> = ({ items }) => {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#152C47" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94A3B8", fontSize: 10 }}
            angle={-14}
            textAnchor="end"
            interval={0}
            height={52}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0D2035",
              borderColor: "#1E3A5F",
              borderRadius: "0.75rem",
              fontSize: "12px",
              color: "#F8FAFC",
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName || ""
            }
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
          <Bar
            dataKey="Programs"
            fill={DESIGN_TOKENS.colors.accent.electricBlue}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Runs"
            fill={DESIGN_TOKENS.colors.accent.scientificCyan}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
