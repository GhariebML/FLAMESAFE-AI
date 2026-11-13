"use client";

import React from "react";
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
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
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 text-xs text-slate-500"
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
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
  if (isLiveGemini) {
    badgeLabel = "Gemini Live Connected";
    badgeClass =
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  } else if (isUnconfigured) {
    badgeLabel = "AI Key Not Configured";
    badgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";
  } else if (status.last_error) {
    badgeLabel = "Gemini Unavailable (Fallback Active)";
    badgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
  }

  return (
    <div
      data-testid="ai-runtime-status-card"
      className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/85 p-4 shadow-sm space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Verify Connection
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Provider
          </div>
          <div data-testid="ai-provider-value" className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">
            {status.provider.toUpperCase()} {status.is_mock_provider ? "(MOCK)" : "(REAL)"}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Generation Model
          </div>
          <div data-testid="ai-generation-model" className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
            {status.generation_model}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Embedding Model
          </div>
          <div data-testid="ai-embedding-model" className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
            {status.embedding_model} ({status.embedding_dimensions}d)
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Connection State
          </div>
          <div data-testid="ai-connection-state" className="font-semibold text-slate-900 dark:text-white mt-0.5">
            {status.connected ? "Verified Live" : status.configured ? "Offline / Fallback" : "Not Configured"}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Last Successful AI Call
          </div>
          <div data-testid="ai-last-success" className="font-mono text-slate-900 dark:text-white mt-0.5 truncate">
            {status.last_successful_request_at
              ? new Date(status.last_successful_request_at).toLocaleTimeString()
              : "None recorded"}
          </div>
        </div>
      </div>

      {status.last_error && (
        <div
          data-testid="ai-error-banner"
          className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <span className="font-semibold">AI Diagnostic Notice: </span>
            <span>{status.last_error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
