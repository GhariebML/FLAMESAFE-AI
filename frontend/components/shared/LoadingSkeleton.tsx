import React from "react";
import { cn } from "@/lib/utils/cn";

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-brand-soft dark:bg-space-800/80 border border-space-800",
        className
      )}
    />
  );
};

export interface LoadingStateProps {
  title?: string;
  description?: string;
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Synchronizing Scientific Telemetry...",
  description = "Fetching indexed NASA PSI datasets, run parameters, and research evidence.",
  rows = 3,
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-2xl border border-space-800 bg-space-900 p-6 sm:p-8 shadow-panel space-y-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-intelligent" />
        </span>
        <div>
          <p className="text-sm font-bold text-fg-primary">{title}</p>
          <p className="text-xs text-fg-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className={i === 0 ? "h-10 w-full" : i === rows - 1 ? "h-8 w-3/4" : "h-9 w-5/6"}
          />
        ))}
      </div>
    </div>
  );
};
