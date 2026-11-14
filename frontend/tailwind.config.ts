import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          navy: "#001030",
          "deep-navy": "#001840",
          blue: "#0050C0",
          intelligent: "#006EDB",
          cyan: "#39B9EB",
          "light-cyan": "#62C9F5",
          "flame-orange": "#FF6B24",
          "deep-orange": "#E94B16",
          "flame-red": "#E94B16",
          "flame-yellow": "#FFB547",
          canvas: "#F5F8FC",
          soft: "#EDF5FC",
          border: "#E3EAF3",
          ink: "#10233F",
          slate: "#64748B",
          success: "#15966B",
          warning: "#D99520",
          error: "#D64545",
        },
        lab: {
          bg: "#080A0F",
          secondary: "#0D1117",
          card: "#121820",
          elevated: "#191F28",
          border: "#252D38",
          text: "#F7F7F5",
          muted: "#A1A8B3",
          orange: "#FF6B24",
          "deep-orange": "#E94B16",
          gold: "#FFB547",
          blue: "#006EDB",
          cyan: "#39B9EB",
        },
        space: {
          950: "rgb(var(--space-950) / <alpha-value>)",
          900: "rgb(var(--space-900) / <alpha-value>)",
          800: "rgb(var(--space-800) / <alpha-value>)",
          700: "rgb(var(--space-700) / <alpha-value>)",
          600: "rgb(var(--space-600) / <alpha-value>)",
        },
        fg: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        electric: {
          400: "#62C9F5",
          500: "#006EDB",
          600: "#0050C0",
          700: "#003D99",
        },
        plasma: {
          400: "#62C9F5",
          500: "#00A0F0",
          600: "#007EC2",
        },
        amber: {
          400: "#FFC247",
          500: "#D99520",
          600: "#B47814",
        },
        flame: {
          400: "#FFC247",
          500: "#F08000",
          600: "#F04000",
        },
      },
      boxShadow: {
        panel: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        glow: "0 0 24px rgba(0, 160, 240, 0.18)",
        "flame-glow": "0 4px 20px rgba(240, 128, 0, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
