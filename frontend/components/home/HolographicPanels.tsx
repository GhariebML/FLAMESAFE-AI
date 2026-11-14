"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Cpu,
  Database,
  Globe2,
  Radar,
  SearchCode,
} from "lucide-react";

export interface OverviewMetrics {
  total_investigations?: number;
  total_experimental_runs?: number;
  total_measurements?: number;
  total_documents?: number;
}

interface HolographicPanelsProps {
  overview: OverviewMetrics | null;
}

/**
 * Six holographic scientific interface panels communicating real FlameSafe AI
 * capabilities. Uses live backend metrics when available and abstract visual
 * representations without fabricated numbers otherwise.
 */
export const HolographicPanels: React.FC<HolographicPanelsProps> = ({ overview }) => {
  const hasLive = Boolean(
    overview &&
      (overview.total_investigations !== undefined ||
        overview.total_experimental_runs !== undefined ||
        overview.total_documents !== undefined)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
      {/* Panel 1 — NASA PSI RESEARCH */}
      <Link
        href="/investigations"
        className="group rounded-2xl border border-brand-cyan/30 bg-[#061830]/85 dark:bg-[#061830]/80 backdrop-blur-md p-4 text-white keep-white shadow-panel hover:border-brand-cyan/70 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-brand-cyan/15 border border-brand-cyan/35 flex items-center justify-center text-brand-light-cyan">
              <Radar className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-light-cyan">
              NASA PSI Research
            </span>
          </div>
          <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-200 keep-white">
            <span>PSI Investigations</span>
            <span className="font-mono font-bold text-white keep-white">
              {hasLive ? overview?.total_investigations ?? "—" : "Live Catalog"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300 keep-white">
            <span>Experimental Runs</span>
            <span className="font-mono font-bold text-brand-light-cyan">
              {hasLive ? overview?.total_experimental_runs ?? "—" : "Telemetry"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300 keep-white">
            <span>Research Documents</span>
            <span className="font-mono font-bold text-brand-flame-yellow">
              {hasLive ? overview?.total_documents ?? "—" : "Indexed PDF"}
            </span>
          </div>
        </div>
      </Link>

      {/* Panel 2 — MULTI-AGENT AI */}
      <Link
        href="/research"
        className="group rounded-2xl border border-brand-blue/35 bg-[#061830]/85 dark:bg-[#061830]/80 backdrop-blur-md p-4 text-white keep-white shadow-panel hover:border-brand-cyan/70 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-brand-intelligent/20 border border-brand-cyan/35 flex items-center justify-center text-brand-light-cyan">
              <Cpu className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-light-cyan">
              Multi-Agent AI
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-300 keep-white">11 Nodes</span>
        </div>
        <div className="flex items-center justify-between gap-1 pt-1">
          {["Plan", "PSI", "HITL", "Vault", "RAG"].map((node, i) => (
            <React.Fragment key={node}>
              <div className="px-1.5 py-1 rounded-md bg-white/10 border border-brand-cyan/30 text-[10px] font-mono font-semibold text-white keep-white">
                {node}
              </div>
              {i < 4 && <div className="h-[1px] flex-1 bg-brand-cyan/45" />}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-2.5 text-[11px] text-slate-300 keep-white">
          LangGraph orchestration with human-approval gates.
        </p>
      </Link>

      {/* Panel 3 — SCIENTIFIC DATASETS */}
      <Link
        href="/research"
        className="group rounded-2xl border border-brand-cyan/30 bg-[#061830]/85 dark:bg-[#061830]/80 backdrop-blur-md p-4 text-white keep-white shadow-panel hover:border-brand-cyan/70 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-brand-cyan/15 border border-brand-cyan/35 flex items-center justify-center text-brand-light-cyan">
              <Database className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-light-cyan">
              Scientific Datasets
            </span>
          </div>
          <Activity className="h-3.5 w-3.5 text-brand-flame-yellow" />
        </div>
        {/* Abstract signal waveform */}
        <div className="flex items-end gap-1 h-7 mb-2" aria-hidden="true">
          {[35, 62, 48, 86, 54, 92, 68, 76, 44, 80, 60, 72].map((h, idx) => (
            <span
              key={idx}
              style={{ height: `${h}%` }}
              className="flex-1 rounded-sm bg-gradient-to-t from-brand-blue to-brand-light-cyan opacity-85"
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-300 keep-white">
          <span>Normalized SI Parquet / CSV</span>
          <span className="font-mono text-white keep-white">
            {hasLive && overview?.total_measurements !== undefined
              ? `${overview.total_measurements} metrics`
              : "6-Hop Lineage"}
          </span>
        </div>
      </Link>

      {/* Panel 4 — EARTH APPLICATIONS */}
      <a
        href="#earth-applications"
        className="group rounded-2xl border border-brand-cyan/30 bg-[#061830]/85 dark:bg-[#061830]/80 backdrop-blur-md p-4 text-white keep-white shadow-panel hover:border-brand-cyan/70 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300">
              <Globe2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Earth Applications
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Smoke Sensors", "Water Mist", "Flammability", "Aerosols"].map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-medium text-slate-200 keep-white"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-300 keep-white">
          Space combustion insights informing terrestrial safety.
        </p>
      </a>

      {/* Panel 5 — RESEARCH GAP INTELLIGENCE */}
      <Link
        href="/scenarios"
        className="group rounded-2xl border border-brand-flame-orange/35 bg-[#061830]/85 dark:bg-[#061830]/80 backdrop-blur-md p-4 text-white keep-white shadow-panel hover:border-brand-flame-orange/75 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-brand-flame-orange/15 border border-brand-flame-orange/35 flex items-center justify-center text-brand-flame-yellow">
              <SearchCode className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-flame-yellow">
              Research Gap Matrix
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
          <div className="rounded py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
            0g ISS
          </div>
          <div className="rounded py-1 bg-brand-cyan/20 border border-brand-cyan/40 text-brand-light-cyan">
            34% O2
          </div>
          <div className="rounded py-1 bg-brand-flame-orange/20 border border-brand-flame-orange/45 text-amber-200">
            0.16g Gap
          </div>
          <div className="rounded py-1 bg-brand-flame-orange/20 border border-brand-flame-orange/45 text-amber-200">
            0.38g Gap
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-300 keep-white">
          Covered orbital vs. partial-g habitat gaps.
        </p>
      </Link>

      {/* Panel 6 — EVIDENCE-BASED ANALYSIS */}
      <Link
        href="/evidence"
        className="group rounded-2xl border border-brand-cyan/30 bg-[#061830]/85 dark:bg-[#061830]/80 backdrop-blur-md p-4 text-white keep-white shadow-panel hover:border-brand-cyan/70 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-brand-cyan/15 border border-brand-cyan/35 flex items-center justify-center text-brand-light-cyan">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-light-cyan">
              Evidence-Based Analysis
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-11/12 rounded bg-white/15" />
          <div className="h-2 w-4/5 rounded bg-brand-cyan/35" />
          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-300 keep-white">
            <span>DOI &amp; Page Citations</span>
            <span className="text-emerald-300">Abstention Safe</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
