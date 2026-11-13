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

const ACCENT_STYLES: Record<NonNullable<MetricCardProps["accentColor"]>, string> = {
  electric: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  plasma: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  flame: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor = "electric",
}) => {
  return (
    <Card className="p-4 sm:p-5 border-space-800 bg-space-900/80 hover:border-space-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-50">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-mono text-slate-400">{unit}</span>
            )}
          </div>
        </div>
        <div
          className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${ACCENT_STYLES[accentColor]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {subtitle && (
        <p className="mt-3 text-[11px] text-slate-400 border-t border-space-800/70 pt-2">
          {subtitle}
        </p>
      )}
    </Card>
  );
};
