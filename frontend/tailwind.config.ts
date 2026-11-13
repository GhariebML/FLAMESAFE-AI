import type { Config } from "tailwindcss";

const config: Config = {
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
          950: "#071525", // Deep Space Navy (Primary Background)
          900: "#0D2035", // Midnight Blue (Secondary Elevated Surface)
          800: "#152C47", // Orbital Slate Border / Input Surface
          700: "#1E3A5F", // Hover / Active Border
          600: "#2B5282", // Muted Accent Surface
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
        panel: "0 4px 20px -2px rgba(3, 10, 22, 0.65)",
        glow: "0 0 24px -4px rgba(59, 130, 246, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
