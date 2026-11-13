import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: "rgb(var(--space-950) / <alpha-value>)", // #071525 (Dark) | #F8FAFC (Light)
          900: "rgb(var(--space-900) / <alpha-value>)", // #0D2035 (Dark) | #FFFFFF (Light)
          800: "rgb(var(--space-800) / <alpha-value>)", // #152C47 (Dark) | #E2E8F0 (Light)
          700: "rgb(var(--space-700) / <alpha-value>)", // #1E3A5F (Dark) | #CBD5E1 (Light)
          600: "rgb(var(--space-600) / <alpha-value>)", // #2B5282 (Dark) | #94A3B8 (Light)
        },
        fg: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        electric: {
          500: "#3B82F6", // Primary Accent — Electric Blue
          400: "#60A5FA",
          600: "#2563EB",
        },
        plasma: {
          500: "#06B6D4",
          400: "#22D3EE", // Secondary Accent — Scientific Cyan
          600: "#0891B2",
        },
        amber: {
          500: "#F59E0B", // Controlled Amber — Combustion & Relevance
          400: "#FBBF24",
          600: "#D97706",
        },
        flame: {
          500: "#F97316", // Coral / Orange — Flame & Warning
          600: "#EA580C",
          400: "#FB923C",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
