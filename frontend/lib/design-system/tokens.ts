/**
 * FlameSafe AI — Aerospace Scientific Design System Tokens
 * Central registry for colors, chart palettes, spacing, breakpoints, and elevation.
 */

export const DESIGN_TOKENS = {
  colors: {
    background: {
      primary: "#071525", // Deep Space Navy
      secondary: "#0D2035", // Midnight Blue
      tertiary: "#152C47", // Orbital Slate
    },
    accent: {
      electricBlue: "#3B82F6",
      scientificCyan: "#22D3EE",
      controlledAmber: "#F59E0B",
      coralWarning: "#F97316",
      telemetryEmerald: "#10B981",
      crimsonAlert: "#EF4444",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      muted: "#94A3B8",
      subtle: "#64748B",
    },
    chartPalette: [
      "#3B82F6", // Electric Blue
      "#22D3EE", // Scientific Cyan
      "#F59E0B", // Controlled Amber
      "#F97316", // Coral Warning
      "#10B981", // Telemetry Emerald
      "#A855F7", // Plasma Violet
    ],
  },
  breakpoints: {
    xs: 360,
    sm: 390,
    md: 768,
    lg: 1024,
    xl: 1440,
    xxl: 1920,
  },
  layout: {
    maxContentWidth: "1280px",
    sidebarWidth: "256px",
    headerHeight: "64px",
  },
  animation: {
    fast: "150ms",
    normal: "220ms",
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
