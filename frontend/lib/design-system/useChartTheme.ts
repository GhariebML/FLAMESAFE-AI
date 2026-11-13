"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { DESIGN_TOKENS } from "./tokens";

export interface ChartTheme {
  isLight: boolean;
  gridStroke: string;
  axisTickColor: string;
  axisLineColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  cursorFill: string;
  palette: readonly string[];
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  if (isLight) {
    return {
      isLight: true,
      gridStroke: "#E2E8F0",
      axisTickColor: "#334155",
      axisLineColor: "#CBD5E1",
      tooltipBg: "#FFFFFF",
      tooltipBorder: "#CBD5E1",
      tooltipText: "#0F172A",
      cursorFill: "rgba(37, 99, 235, 0.06)",
      palette: DESIGN_TOKENS.colors.lightChartPalette,
    };
  }

  return {
    isLight: false,
    gridStroke: "#152C47",
    axisTickColor: "#CBD5E1",
    axisLineColor: "#1E3A5F",
    tooltipBg: "#0D2035",
    tooltipBorder: "#1E3A5F",
    tooltipText: "#F8FAFC",
    cursorFill: "rgba(59, 130, 246, 0.08)",
    palette: DESIGN_TOKENS.colors.chartPalette,
  };
}
