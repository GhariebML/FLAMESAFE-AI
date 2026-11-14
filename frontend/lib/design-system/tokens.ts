/**
 * FlameSafe AI Official Design System Tokens
 * Programmatic token definitions for JS/TS modules, Recharts themes, and UI components.
 */
export const DESIGN_TOKENS = {
  brand: {
    navyPrimary: "#001030",
    navyDeep: "#001840",
    bluePrimary: "#0050C0",
    blueIntelligent: "#006EDB",
    cyanScientific: "#00A0F0",
    cyanLight: "#62C9F5",
    flameOrange: "#F08000",
    flameRed: "#F04000",
    flameYellow: "#FFC247",
    white: "#FFFFFF",
    lightBackground: "#F5F8FC",
    softBlueSurface: "#EDF5FC",
    borderSubtle: "#E3EAF3",
    textPrimary: "#10233F",
    textSecondary: "#64748B",
    success: "#15966B",
    warning: "#D99520",
    error: "#D64545",
  },
  blackFireLab: {
    primaryBackground: "#080A0F",
    secondaryBackground: "#0D1117",
    cardSurface: "#121820",
    elevatedSurface: "#191F28",
    primaryText: "#F7F7F5",
    secondaryText: "#A1A8B3",
    flameOrange: "#FF6B24",
    deepOrange: "#E94B16",
    goldenFlame: "#FFB547",
    brandBlue: "#006EDB",
    scientificCyan: "#39B9EB",
    border: "#252D38",
  },
  light: {
    bgCanvas: "#F5F8FC",
    bgCanonical: "#F8FAFC",
    bgSurface: "#FFFFFF",
    bgSurfaceSoft: "#EDF5FC",
    bgSurfaceElevated: "#FFFFFF",
    borderSubtle: "#E3EAF3",
    borderStrong: "#CBD7E6",
    textPrimary: "#10233F",
    textCanonical: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    accentBlue: "#0050C0",
    accentIntelligent: "#006EDB",
    accentCanonicalBlue: "#2563EB",
    accentCyan: "#00A0F0",
    accentLightCyan: "#62C9F5",
    accentAmber: "#D99520",
    accentFlame: "#F08000",
    accentFlameRed: "#F04000",
    gridLine: "rgba(0, 80, 192, 0.08)",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#CBD7E6",
    tooltipText: "#10233F",
  },
  dark: {
    bgCanvas: "#071525",
    bgSurface: "#0D2035",
    bgSurfaceSoft: "#112842",
    bgSurfaceElevated: "#132B47",
    borderSubtle: "#1A3350",
    borderStrong: "#27476B",
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    accentBlue: "#3B82F6",
    accentIntelligent: "#00A0F0",
    accentCyan: "#22D3EE",
    accentAmber: "#F59E0B",
    accentFlame: "#F97316",
    accentFlameRed: "#F04000",
    gridLine: "rgba(98, 201, 245, 0.14)",
    tooltipBg: "#0D2035",
    tooltipBorder: "#27476B",
    tooltipText: "#F8FAFC",
  },
  lightChartPalette: [
    "#0050C0", // Primary Blue
    "#00A0F0", // Scientific Cyan
    "#006EDB", // Intelligent Blue
    "#15966B", // Verified Emerald
    "#F08000", // Flame Orange (strategic highlights)
    "#62C9F5", // Light Cyan
    "#D99520", // Caution Amber
  ],
  chartPalette: [
    "#3B82F6", // Electric Blue
    "#22D3EE", // Cyan Telemetry
    "#62C9F5", // Light Cyan
    "#15966B", // Verified Emerald
    "#F97316", // Flame Orange
    "#F59E0B", // Caution Amber
    "#00A0F0", // Scientific Cyan
  ],
  typography: {
    fontSans: "var(--font-inter), Inter, system-ui, -apple-system, sans-serif",
    fontMono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  layout: {
    sidebarWidth: "16.5rem",
    headerHeight: "4rem",
    containerMax: "84rem",
  },
  animation: {
    fast: "150ms",
    base: "220ms",
    slow: "350ms",
  },
} as const;
