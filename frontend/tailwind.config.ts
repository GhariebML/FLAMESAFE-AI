import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#050811",
          900: "#0a1124",
          800: "#101d3b",
          700: "#1a2c56",
          600: "#27417d",
        },
        flame: {
          500: "#f97316",
          600: "#ea580c",
          400: "#fb923c",
        },
        plasma: {
          500: "#06b6d4",
          400: "#22d3ee",
          600: "#0891b2",
        },
      },
    },
  },
  plugins: [],
};

export default config;
