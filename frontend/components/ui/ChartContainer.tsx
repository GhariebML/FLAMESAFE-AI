"use client";

import React from "react";
import { Card } from "@/components/shared/Card";
import { StatusBadge } from "@/components/shared/Badge";

export interface ChartContainerProps {
  title: string;
  description?: string;
  unitLabel?: string;
  badgeText?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  footerNote?: string;
  height?: number;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  unitLabel,
  badgeText,
  isEmpty = false,
  emptyMessage = "Insufficient experimental data to display this visualization.",
  footerNote,
  height = 280,
  children,
}) => {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-brand-navy dark:text-fg-primary">
              {title}
            </h3>
            {unitLabel && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-soft dark:bg-space-950 border border-space-800 text-fg-secondary">
                Unit: {unitLabel}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-fg-muted leading-relaxed">{description}</p>
          )}
        </div>

        {badgeText && <StatusBadge variant="brand">{badgeText}</StatusBadge>}
      </div>

      {isEmpty ? (
        <div
          style={{ height }}
          className="flex items-center justify-center rounded-xl border border-dashed border-space-800 bg-brand-soft/40 dark:bg-space-950/60 text-xs text-fg-muted text-center px-6"
        >
          {emptyMessage}
        </div>
      ) : (
        <div style={{ height }} className="w-full min-w-0">
          {children}
        </div>
      )}

      {footerNote && (
        <div className="pt-2.5 border-t border-space-800 text-[11px] text-fg-muted">
          {footerNote}
        </div>
      )}
    </Card>
  );
};
