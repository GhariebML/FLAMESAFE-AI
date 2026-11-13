import React from "react";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AlertTriangle, BarChart3 } from "lucide-react";

interface ChartContainerProps {
  title: string;
  description?: string;
  unitLabel?: string;
  badgeText?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  error?: string | null;
  height?: number;
  children: React.ReactNode;
  footerNote?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  unitLabel,
  badgeText,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No empirical records available for this visualization.",
  error = null,
  height = 280,
  children,
  footerNote,
}) => {
  return (
    <Card className="flex flex-col justify-between space-y-4 border-space-800 bg-space-900/80 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-space-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-electric-400 shrink-0" />
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {unitLabel && (
            <span className="px-2 py-0.5 rounded bg-space-950 border border-space-800 font-mono text-[11px] text-plasma-400">
              Unit: {unitLabel}
            </span>
          )}
          {badgeText && <Badge variant="plasma">{badgeText}</Badge>}
        </div>
      </div>

      <div className="w-full" style={{ minHeight: `${height}px` }}>
        {isLoading ? (
          <LoadingSkeleton className="w-full h-full rounded-xl" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
            <AlertTriangle className="h-6 w-6 text-red-400 mb-2" />
            <p className="text-xs font-medium text-red-300">{error}</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] p-4 rounded-xl bg-space-950/50 border border-space-800 text-center">
            <p className="text-xs text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="w-full" style={{ height: `${height}px` }}>
            {children}
          </div>
        )}
      </div>

      {footerNote && (
        <div className="pt-2 border-t border-space-800/60 text-[11px] text-slate-400 font-mono">
          {footerNote}
        </div>
      )}
    </Card>
  );
};
