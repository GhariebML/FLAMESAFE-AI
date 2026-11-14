"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { AIRuntimeStatus } from "@/types/research";

interface AIRuntimeStatusCardProps {
  status: AIRuntimeStatus | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function AIRuntimeStatusCard({
  status,
  onRefresh,
  refreshing = false,
}: AIRuntimeStatusCardProps) {
  if (!status) {
    return (
      <div
        data-testid="ai-status-loading"
        className="rounded-2xl border border-space-800 bg-space-900 p-4 text-xs text-fg-muted shadow-panel"
      >
        Checking AI provider runtime status...
      </div>
    );
  }

  const isLiveGemini =
    status.provider === "gemini" && status.configured && status.connected && !status.is_mock_provider;
  const isUnconfigured = !status.configured;

  let badgeLabel = "Mock / Offline Mode";
  let badgeClass =
    "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30";
  if (isLiveGemini) {
    badgeLabel = "Gemini Live Connected";
    badgeClass =
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
  } else if (isUnconfigured) {
    badgeLabel = "AI Key Not Configured";
    badgeClass = "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";
  } else if (status.last_error) {
    badgeLabel = "Gemini Unavailable (Fallback Active)";
    badgeClass = "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30";
  }

  return (
    <div
      data-testid="ai-runtime-status-card"
      className="rounded-2xl border border-space-800 bg-space-900 p-4 sm:p-5 shadow-panel space-y-3.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-brand-soft dark:bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center text-brand-blue dark:text-brand-light-cyan">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-navy dark:text-fg-primary">
            AI Infrastructure &amp; Provider Telemetry
          </span>
          <span
            data-testid="ai-status-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}
          >
            {isLiveGemini ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            {badgeLabel}
          </span>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-space-800 bg-space-950 text-fg-primary hover:border-brand-intelligent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-intelligent ${refreshing ? "animate-spin" : ""}`} />
            Verify Connection
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="rounded-xl bg-brand-soft/65 dark:bg-space-950 border border-space-800 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Active Provider
          </div>
          <div
            data-testid="ai-provider-value"
            className="font-mono font-bold text-brand-navy dark:text-white mt-0.5"
          >
            {status.provider.toUpperCase()} {status.is_mock_provider ? "(MOCK)" : "(REAL)"}
          </div>
        </div>

        <div className="rounded-xl bg-brand-soft/65 dark:bg-space-950 border border-space-800 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Generation Model
          </div>
          <div
            data-testid="ai-generation-model"
            className="font-mono font-bold text-brand-navy dark:text-white mt-0.5 truncate"
          >
            {status.generation_model}
          </div>
        </div>

        <div className="rounded-xl bg-brand-soft/65 dark:bg-space-950 border border-space-800 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Embedding Model
          </div>
          <div
            data-testid="ai-embedding-model"
            className="font-mono font-bold text-brand-navy dark:text-white mt-0.5 truncate"
          >
            {status.embedding_model} ({status.embedding_dimensions}d)
          </div>
        </div>

        <div className="rounded-xl bg-brand-soft/65 dark:bg-space-950 border border-space-800 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Connection State
          </div>
          <div
            data-testid="ai-connection-state"
            className="font-bold text-brand-navy dark:text-white mt-0.5"
          >
            {status.connected ? "Verified Live" : status.configured ? "Offline / Fallback" : "Not Configured"}
          </div>
        </div>

        <div className="rounded-xl bg-brand-soft/65 dark:bg-space-950 border border-space-800 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
            Last Successful AI Call
          </div>
          <div
            data-testid="ai-last-success"
            className="font-mono text-brand-navy dark:text-white mt-0.5 truncate"
          >
            {status.last_successful_request_at
              ? new Date(status.last_successful_request_at).toLocaleTimeString()
              : "None recorded"}
          </div>
        </div>
      </div>

      {status.last_error && (
        <div
          data-testid="ai-error-banner"
          className="flex items-start gap-2 rounded-xl border border-brand-warning/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-brand-warning" />
          <div>
            <span className="font-bold">AI Diagnostic Notice: </span>
            <span>{status.last_error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
