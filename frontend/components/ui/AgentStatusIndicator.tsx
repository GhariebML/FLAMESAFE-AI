import React from "react";
import { CheckCircle2, Clock, Cpu, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type AgentExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "awaiting_approval"
  | "warning"
  | "failed";

export interface AgentStatusIndicatorProps {
  status: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Normalizes multi-agent status tokens into the official FlameSafe AI semantic colors:
 * - Blue / Cyan: running / AI processing
 * - Emerald Green: completed / verified
 * - Orange / Amber: awaiting human review / warning
 * - Red: failed / error
 */
export function normalizeAgentStatus(raw: string): AgentExecutionStatus {
  const s = (raw || "").toLowerCase();
  if (s.includes("fail") || s.includes("error")) return "failed";
  if (s.includes("await") || s.includes("review") || s.includes("revision"))
    return "awaiting_approval";
  if (s.includes("warn") || s.includes("partial")) return "warning";
  if (s.includes("run") || s.includes("active") || s.includes("progress"))
    return "running";
  if (s.includes("comp") || s.includes("done") || s.includes("approv") || s.includes("ready"))
    return "completed";
  return "pending";
}

const STATUS_STYLE_MAP: Record<
  AgentExecutionStatus,
  {
    badge: string;
    dot: string;
    label: string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  pending: {
    badge: "bg-brand-soft dark:bg-space-800 text-fg-muted border-space-800",
    dot: "bg-slate-400",
    label: "Queued",
    Icon: Clock,
  },
  running: {
    badge:
      "bg-brand-cyan/15 text-brand-blue dark:text-brand-light-cyan border-brand-cyan/35",
    dot: "bg-brand-cyan animate-pulse",
    label: "Running",
    Icon: Cpu,
  },
  completed: {
    badge:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-brand-success",
    label: "Completed",
    Icon: CheckCircle2,
  },
  awaiting_approval: {
    badge:
      "bg-brand-flame-orange/15 text-amber-800 dark:text-brand-flame-yellow border-brand-flame-orange/35",
    dot: "bg-brand-flame-orange animate-pulse",
    label: "Human Review",
    Icon: AlertTriangle,
  },
  warning: {
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    dot: "bg-brand-warning",
    label: "Warning",
    Icon: AlertTriangle,
  },
  failed: {
    badge: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
    dot: "bg-brand-error",
    label: "Failed",
    Icon: XCircle,
  },
};

export const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({
  status,
  label,
  compact = false,
  className,
}) => {
  const normalized = normalizeAgentStatus(status);
  const cfg = STATUS_STYLE_MAP[normalized];
  const Icon = cfg.Icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-tight",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        cfg.badge,
        className
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {!compact && <Icon className="h-3 w-3 shrink-0" />}
      <span>{label || cfg.label}</span>
    </span>
  );
};
