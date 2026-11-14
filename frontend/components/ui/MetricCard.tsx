import React from "react";
import { Card } from "@/components/shared/Card";
import { cn } from "@/lib/utils/cn";

type LegacyAccent = "electric" | "plasma" | "flame" | "emerald";
type BrandAccent = "blue" | "cyan" | "amber" | "flame" | "emerald";

export interface MetricCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  accent?: BrandAccent;
  accentColor?: LegacyAccent;
  footer?: React.ReactNode;
  trendLabel?: string;
  isLoading?: boolean;
  float?: boolean;
  floatDelay?: 0 | 1 | 2 | 3;
}

const ACCENT_MAP: Record<BrandAccent, { borderTop: string; iconBox: string; badge: string }> = {
  blue: {
    borderTop: "border-t-brand-blue",
    iconBox: "bg-brand-soft dark:bg-blue-500/15 border-brand-blue/25 text-brand-blue dark:text-brand-light-cyan",
    badge: "text-brand-blue bg-brand-soft dark:text-brand-light-cyan dark:bg-blue-500/10 border-brand-blue/25",
  },
  cyan: {
    borderTop: "border-t-brand-cyan",
    iconBox: "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan",
    badge: "text-sky-700 bg-brand-cyan/10 dark:text-brand-light-cyan border-brand-cyan/30",
  },
  amber: {
    borderTop: "border-t-brand-warning",
    iconBox: "bg-amber-500/10 border-amber-500/30 text-brand-warning",
    badge: "text-amber-800 bg-amber-500/10 dark:text-amber-300 border-amber-500/30",
  },
  flame: {
    borderTop: "border-t-brand-flame-orange",
    iconBox: "bg-brand-flame-orange/10 border-brand-flame-orange/30 text-brand-flame-orange",
    badge: "text-amber-900 bg-brand-flame-orange/10 dark:text-brand-flame-yellow border-brand-flame-orange/30",
  },
  emerald: {
    borderTop: "border-t-brand-success",
    iconBox: "bg-emerald-500/10 border-emerald-500/30 text-brand-success",
    badge: "text-emerald-800 bg-emerald-500/10 dark:text-emerald-300 border-emerald-500/30",
  },
};

function resolveAccent(accent?: BrandAccent, accentColor?: LegacyAccent): BrandAccent {
  if (accent) return accent;
  if (accentColor === "electric") return "blue";
  if (accentColor === "plasma") return "cyan";
  if (accentColor === "flame") return "flame";
  if (accentColor === "emerald") return "emerald";
  return "blue";
}

function renderIcon(icon?: MetricCardProps["icon"]): React.ReactNode {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
    const IconComp = icon as React.ComponentType<{ className?: string }>;
    return <IconComp className="h-5 w-5" />;
  }
  return icon as React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  label,
  value,
  subtitle,
  icon,
  accent,
  accentColor,
  footer,
  trendLabel,
  isLoading = false,
  float = true,
  floatDelay = 0,
}) => {
  const styles = ACCENT_MAP[resolveAccent(accent, accentColor)];
  const heading = title ?? label ?? "";
  const iconNode = renderIcon(icon);

  return (
    <Card
      float={float}
      floatDelay={floatDelay}
      className={cn(
        "group relative flex flex-col justify-between border-t-4 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300",
        styles.borderTop
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-fg-muted truncate">
            {heading}
          </div>
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-brand-soft dark:bg-space-800" />
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-navy dark:text-fg-primary tabular-nums tracking-tight">
              {value}
            </div>
          )}
          {subtitle && (
            <div className="text-xs text-fg-muted leading-snug">{subtitle}</div>
          )}
        </div>

        {iconNode && (
          <div
            className={cn(
              "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0",
              styles.iconBox
            )}
          >
            {iconNode}
          </div>
        )}
      </div>

      {(footer || trendLabel) && (
        <div className="mt-4 pt-3 border-t border-space-800 flex items-center justify-between gap-2 text-[11px]">
          <div className="text-fg-muted">{footer}</div>
          {trendLabel && (
            <span className={cn("px-2 py-0.5 rounded-full border font-mono font-semibold", styles.badge)}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
