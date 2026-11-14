import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ResearchMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "navy" | "blue" | "cyan" | "flame" | "success";
  className?: string;
}

const TONE_VALUE_STYLES: Record<NonNullable<ResearchMetricProps["tone"]>, string> = {
  navy: "text-brand-navy dark:text-white",
  blue: "text-brand-blue dark:text-brand-light-cyan",
  cyan: "text-brand-cyan",
  flame: "text-brand-flame-orange dark:text-brand-flame-yellow",
  success: "text-brand-success",
};

export const ResearchMetric: React.FC<ResearchMetricProps> = ({
  label,
  value,
  unit,
  hint,
  tone = "navy",
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-space-800 bg-space-950/70 dark:bg-space-950 px-3.5 py-2.5 space-y-0.5",
        className
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-lg font-extrabold font-mono tabular-nums", TONE_VALUE_STYLES[tone])}>
          {value}
        </span>
        {unit && <span className="text-[11px] font-mono text-fg-muted">{unit}</span>}
      </div>
      {hint && <div className="text-[11px] text-fg-muted leading-tight">{hint}</div>}
    </div>
  );
};
