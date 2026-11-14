"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { DESIGN_TOKENS } from "./tokens";

export interface ChartThemeConfig {
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

/**
 * Returns theme-aware Recharts styling synchronized with Official Brand Light & Dark modes.
 */
export function useChartTheme(): ChartThemeConfig {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const mode = isLight ? DESIGN_TOKENS.light : DESIGN_TOKENS.dark;

  return {
    isLight,
    gridStroke: mode.gridLine,
    axisTickColor: isLight ? DESIGN_TOKENS.brand.textSecondary : mode.textMuted,
    axisLineColor: mode.borderStrong,
    tooltipBg: mode.tooltipBg,
    tooltipBorder: mode.tooltipBorder,
    tooltipText: mode.tooltipText,
    cursorFill: isLight ? "rgba(0, 110, 219, 0.07)" : "rgba(0, 160, 240, 0.10)",
    palette: isLight ? DESIGN_TOKENS.lightChartPalette : DESIGN_TOKENS.chartPalette,
  };
}
