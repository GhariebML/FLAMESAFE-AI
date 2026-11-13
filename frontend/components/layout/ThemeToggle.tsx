"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, ThemeMode } from "./ThemeProvider";
import { cn } from "@/lib/utils/cn";

const OPTIONS: { mode: ThemeMode; label: string; shortLabel: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "White Mode (Cleanroom Lab)", shortLabel: "White", Icon: Sun },
  { mode: "dark", label: "Black Mode (Mission Control)", shortLabel: "Black", Icon: Moon },
  { mode: "system", label: "System Preference", shortLabel: "Auto", Icon: Monitor },
];

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      {/* Desktop / Tablet Segmented 3-Way Pill */}
      <div
        role="group"
        aria-label="Interface theme mode selector (Alt+T)"
        className="hidden sm:inline-flex items-center gap-0.5 p-1 rounded-full border border-space-700/90 bg-space-950/90 shadow-inner"
      >
        {OPTIONS.map(({ mode, label, shortLabel, Icon }) => {
          const isActive = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              title={`${label} (Alt+T)`}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/25"
                  : "text-fg-muted hover:text-fg-primary hover:bg-space-800/70"
              )}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span>{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Mobile Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          resolvedTheme === "dark"
            ? "Switch to White (Cleanroom Lab) Mode"
            : "Switch to Black (Mission Control) Mode"
        }
        title="Toggle White / Black Mode (Alt+T)"
        className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-space-700 bg-space-900 text-xs font-semibold text-fg-primary hover:bg-space-800 transition-colors"
      >
        {resolvedTheme === "dark" ? (
          <>
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span>White</span>
          </>
        ) : (
          <>
            <Moon className="h-3.5 w-3.5 text-blue-600" />
            <span>Black</span>
          </>
        )}
      </button>
    </div>
  );
};
