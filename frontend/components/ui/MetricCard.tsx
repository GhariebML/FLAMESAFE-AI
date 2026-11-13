import React from "react";
import { Card } from "@/components/shared/Card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: "electric" | "plasma" | "amber" | "flame" | "emerald";
}

const ACCENT_CONFIG: Record<
  NonNullable<MetricCardProps["accentColor"]>,
  { iconBox: string; topBar: string; glowOrb: string }
> = {
  electric: {
    iconBox:
      "text-blue-600 dark:text-blue-300 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-blue-500/35 shadow-sm shadow-blue-500/15",
    topBar: "from-blue-600 via-indigo-500 to-cyan-400",
    glowOrb: "bg-blue-500/15 dark:bg-blue-500/20",
  },
  plasma: {
    iconBox:
      "text-cyan-700 dark:text-cyan-300 bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border-cyan-500/35 shadow-sm shadow-cyan-500/15",
    topBar: "from-cyan-500 via-teal-400 to-blue-500",
    glowOrb: "bg-cyan-500/15 dark:bg-cyan-400/20",
  },
  amber: {
    iconBox:
      "text-amber-700 dark:text-amber-300 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/35 shadow-sm shadow-amber-500/15",
    topBar: "from-amber-500 via-orange-500 to-yellow-400",
    glowOrb: "bg-amber-500/15 dark:bg-amber-400/20",
  },
  flame: {
    iconBox:
      "text-orange-700 dark:text-orange-300 bg-gradient-to-br from-orange-500/20 to-red-500/10 border-orange-500/35 shadow-sm shadow-orange-500/15",
    topBar: "from-orange-600 via-red-500 to-amber-400",
    glowOrb: "bg-orange-500/15 dark:bg-orange-500/20",
  },
  emerald: {
    iconBox:
      "text-emerald-700 dark:text-emerald-300 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/35 shadow-sm shadow-emerald-500/15",
    topBar: "from-emerald-500 via-teal-400 to-cyan-500",
    glowOrb: "bg-emerald-500/15 dark:bg-emerald-400/20",
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor = "electric",
}) => {
  const cfg = ACCENT_CONFIG[accentColor];

  return (
    <Card className="group relative p-4 sm:p-5 border-space-800 bg-space-900/95 hover:border-blue-500/45 hover:-translate-y-0.5 transition-all duration-200">
      {/* Luminous Top Accent Strip */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cfg.topBar}`}
      />
      {/* Subtle Corner Glow */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${cfg.glowOrb} opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-fg-muted">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight text-fg-primary">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-mono font-semibold text-fg-muted">{unit}</span>
            )}
          </div>
        </div>
        <div
          className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${cfg.iconBox}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {subtitle && (
        <p className="relative mt-3 text-[11px] text-fg-muted border-t border-space-800/80 pt-2.5">
          {subtitle}
        </p>
      )}
    </Card>
  );
};
