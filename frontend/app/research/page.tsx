"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  Database,
  FileCheck2,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldCheck,
  Download,
  Sparkles,
  Layers,
  GitBranch,
  Search,
  RefreshCw,
  FileSpreadsheet,
  SlidersHorizontal,
  ExternalLink,
  BookOpen,
  Clock,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import {
  ResearchRequestDetail,
  DatasetDetail,
  PSIFileManifestItem,
  AIRuntimeStatus,
} from "@/types/research";
import { AIRuntimeStatusCard } from "@/components/research/AIRuntimeStatusCard";
import {
  AgentStatusIndicator,
  normalizeAgentStatus,
} from "@/components/ui/AgentStatusIndicator";

const SAMPLE_PROMPTS = [
  "Compare opposed and concurrent flame spread rates and oxygen extinction limits for PMMA and SIBAL fabric across BASS and SAFFIRE.",
  "Build a validated microgravity droplet combustion dataset from FLEX for n-Heptane and Methanol burning rate constants.",
  "Analyze spacecraft wire insulation smoke particle size distributions in SAME for photoelectric vs ionization fire detectors.",
  "Evaluate lunar partial-gravity (0.166g) solid flammability bounds and identify experimental gaps across BASS-II and SOFIE.",
];

const ALL_11_AGENTS = [
  { id: "AGENT_01", name: "Chief Intelligence Orchestrator", role: "LangGraph Supervisor & State Router" },
  { id: "AGENT_02", name: "Query Understanding Agent", role: "Scientific Intent & Entity Decomposition" },
  { id: "AGENT_03", name: "Existing Knowledge & Reuse Agent", role: "Local DB & Dataset Coverage Audit" },
  { id: "AGENT_04", name: "NASA PSI Discovery Agent", role: "11-Campaign PSI Catalog Search" },
  { id: "AGENT_05", name: "File Intelligence & Selection Agent", role: "Priority Scoring F=0.35Q+0.25T+0.20C+0.10P+0.10A" },
  { id: "AGENT_06", name: "Scientific Acquisition Agent", role: "Allowlist, SSRF Guard & SHA-256 Vault" },
  { id: "AGENT_07", name: "Scientific Extraction Agent", role: "Tabular & Relational Run Extraction" },
  { id: "AGENT_08", name: "Scientific Schema Mapping Agent", role: "Canonical Schema & SI Unit Normalizer" },
  { id: "AGENT_09", name: "Validation & Quality Agent", role: "Deterministic Physical Bounds & Null Guard" },
  { id: "AGENT_10", name: "Dynamic Dataset Builder Agent", role: "Fingerprinting, Versioning & Export" },
  { id: "AGENT_11", name: "Research Intelligence Agent", role: "RAG Synthesis & Citation Verification" },
];

export default function ResearchIntelligenceWorkspacePage() {
  const [question, setQuestion] = useState<string>(SAMPLE_PROMPTS[0]);
  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [forcePsiDiscovery, setForcePsiDiscovery] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeRequest, setActiveRequest] = useState<ResearchRequestDetail | null>(null);
  const [recentRequests, setRecentRequests] = useState<ResearchRequestDetail[]>([]);
  const [aiStatus, setAiStatus] = useState<AIRuntimeStatus | null>(null);
  const [verifyingAI, setVerifyingAI] = useState<boolean>(false);
  const [datasetDetail, setDatasetDetail] = useState<DatasetDetail | null>(null);
  const [datasetAnalysis, setDatasetAnalysis] = useState<Record<string, any> | null>(null);
  const [datasetCoverage, setDatasetCoverage] = useState<Record<string, any> | null>(null);
  const [datasetLineage, setDatasetLineage] = useState<Record<string, any> | null>(null);
  const [datasetDiff, setDatasetDiff] = useState<Record<string, any> | null>(null);
  const [pandasAnalytics, setPandasAnalytics] = useState<Record<string, any> | null>(null);
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<string>("investigation_acronym");
  const [analyticsFilterParam, setAnalyticsFilterParam] = useState<string>("");
  const [activeDatasetTab, setActiveDatasetTab] = useState<"records" | "coverage" | "lineage" | "analytics" | "diff">("records");

  // Editable intent fields for Panel B
  const [editFuel, setEditFuel] = useState<string>("Solid Polymer (PMMA)");
  const [editGravity, setEditGravity] = useState<string>("Microgravity (~0g)");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [approvalNotes, setApprovalNotes] = useState<string>(
    "Verified tabular & publication provenance; excluded raw high-speed video archive."
  );

  const loadDatasetForRequest = useCallback(async (datasetId: string) => {
    try {
      const [detail, analysis, coverage, lineage, diff, pandasRes] = await Promise.all([
        apiClient.getDatasetDetail(datasetId),
        apiClient.analyzeDataset(datasetId),
        apiClient.getDatasetCoverage(datasetId).catch(() => null),
        apiClient.getDatasetLineage(datasetId).catch(() => null),
        apiClient.getDatasetDiff(datasetId).catch(() => null),
        apiClient.runDatasetAnalytics(datasetId, { group_by_column: "investigation_acronym" }).catch(() => null),
      ]);
      setDatasetDetail(detail);
      setDatasetAnalysis(analysis);
      setDatasetCoverage(coverage);
      setDatasetLineage(lineage);
      setDatasetDiff(diff);
      setPandasAnalytics(pandasRes);
    } catch {
      // Non-fatal if dataset not yet constructed (e.g., AWAITING_APPROVAL)
    }
  }, []);

  const syncRequestState = useCallback(
    async (req: ResearchRequestDetail) => {
      setActiveRequest(req);
      if (req.research_intent) {
        setEditFuel(req.research_intent.fuel_type || "Solid Polymer");
        setEditGravity(req.research_intent.gravity_regime || "Microgravity (~0g)");
      }
      const selIds = (req.selected_files || []).map((f) => f.file_identifier);
      setSelectedFileIds(selIds);
      if (req.dataset_id) {
        await loadDatasetForRequest(req.dataset_id);
      } else {
        setDatasetDetail(null);
        setDatasetAnalysis(null);
      }
    },
    [loadDatasetForRequest]
  );

  // Load initial recent requests on mount; if none exist yet, auto-run a default baseline request
  useEffect(() => {
    let mounted = true;
    async function initWorkspace() {
      try {
        const [list, statusInfo] = await Promise.all([
          apiClient.listResearchRequests(),
          apiClient.getAIStatus(false).catch(() => null),
        ]);
        if (!mounted) return;
        if (statusInfo) setAiStatus(statusInfo);
        setRecentRequests(list);
        if (list.length > 0) {
          await syncRequestState(list[0]);
        } else {
          setLoading(true);
          const created = await apiClient.createResearchRequest({
            question: SAMPLE_PROMPTS[0],
            require_approval: false,
            force_psi_discovery: true,
          });
          if (!mounted) return;
          setRecentRequests([created]);
          await syncRequestState(created);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Could not connect to Multi-Agent Orchestrator API.");
          setLoading(false);
        }
      }
    }
    initWorkspace();
    return () => {
      mounted = false;
    };
  }, [syncRequestState]);

  const handleVerifyAIStatus = async () => {
    setVerifyingAI(true);
    try {
      const updatedStatus = await apiClient.getAIStatus(true);
      setAiStatus(updatedStatus);
    } catch {
      // Keep previous status if network fails
    } finally {
      setVerifyingAI(false);
    }
  };

  const handleLaunchWorkflow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await apiClient.createResearchRequest({
        question: question.trim(),
        require_approval: requireApproval,
        force_psi_discovery: forcePsiDiscovery,
      });
      setRecentRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      await syncRequestState(created);
      const updatedStatus = await apiClient.getAIStatus(false).catch(() => null);
      if (updatedStatus) setAiStatus(updatedStatus);
    } catch (err: any) {
      setError(err?.message || "Failed to execute multi-agent workflow.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalDecision = async (
    decision: "APPROVE" | "REJECT" | "MODIFY_PLAN"
  ) => {
    if (!activeRequest) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await apiClient.approveResearchRequest(activeRequest.id, {
        decision,
        selected_file_identifiers: selectedFileIds,
        decided_by: "Principal Fire Safety Researcher",
        reason: approvalNotes,
      });
      setRecentRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      await syncRequestState(updated);
    } catch (err: any) {
      setError(err?.message || "Approval action failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviseIntent = async () => {
    if (!activeRequest) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await apiClient.reviseResearchIntent(activeRequest.id, {
        updated_question: question,
        fuel_type: editFuel,
        gravity_regime: editGravity,
        require_approval: requireApproval,
      });
      setRecentRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      await syncRequestState(updated);
    } catch (err: any) {
      setError(err?.message || "Intent revision failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFileCheckbox = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const completedAgentIds = new Set(
    (activeRequest?.agent_runs || []).map((r) => r.agent_id)
  );
  if (activeRequest) {
    completedAgentIds.add("AGENT_01");
  }

  return (
    <div className="max-w-[84rem] mx-auto space-y-6 pb-16">
      {/* DEDICATED STORYBOARD SHOWCASE: AI AGENTS MISSION ROOM */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-[#254B8C]/90 bg-gradient-to-br from-[#060E20] via-[#09152E] to-[#050A18] p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Left 4 Columns: Realistic Astro-Flame Bot Mission Commander */}
          <div className="lg:col-span-4">
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#254B8C] bg-black shadow-2xl">
              <img
                src="/images/story/mascot-agents.png"
                alt="Realistic Astro-Flame Bot Mission Commander"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040918]/90 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">
                  Mission Commander
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0088FF]/25 border border-[#39B9EB]/50 text-[10px] font-mono font-bold text-[#39B9EB]">
                  11 Agents Online
                </span>
              </div>
            </div>
          </div>

          {/* Right 8 Columns: Title + 11 Agents Orbital Diagram */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#39B9EB]">
                  <Cpu className="w-3.5 h-3.5 text-[#FF7A18]" />
                  <span>AUTONOMOUS MULTI-AGENT ORCHESTRATOR</span>
                </div>
                <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white keep-white">
                  AI Agents Mission Room
                </h1>
                <p className="text-sm text-[#B4C6E4] mt-1">
                  11 Specialized Agents. One Mission.
                </p>
              </div>

              {activeRequest && (
                <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                  <AgentStatusIndicator
                    status={activeRequest.status}
                    label={`Workflow: ${activeRequest.status}`}
                  />
                  <span className="text-[11px] font-mono text-[#9EB2D0]">
                    Thread: {activeRequest.thread_id.slice(0, 12)}...
                  </span>
                </div>
              )}
            </div>

            {/* 11 Agents Hub Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center bg-[#07132A]/90 border border-[#1E3A6E] rounded-2xl p-4">
              {/* Left 6 Agents */}
              <div className="sm:col-span-4 space-y-1.5">
                {[
                  "01 Mission Commander",
                  "02 Research Navigator",
                  "03 Memory Specialist",
                  "04 Data Explorer",
                  "05 Research Analyst",
                  "06 Data Collector",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A1A3A] border border-[#254B8C] text-xs font-semibold text-white"
                  >
                    <Cpu className="h-3.5 w-3.5 text-[#39B9EB] shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>

              {/* Center Glowing 11 Agents Core */}
              <div className="sm:col-span-3 flex flex-col items-center justify-center py-2">
                <div className="relative h-28 w-28 rounded-full bg-gradient-to-b from-[#0A2558] to-[#041028] border-2 border-[#00C8FF] shadow-[0_0_40px_rgba(0,200,255,0.55)] flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-white leading-none">
                    11
                  </span>
                  <span className="text-xs font-bold text-[#7CE0FF] mt-1">
                    Agents
                  </span>
                </div>
              </div>

              {/* Right 5 Agents */}
              <div className="sm:col-span-4 space-y-1.5">
                {[
                  "07 Science Scanner",
                  "08 Data Architect",
                  "09 Quality Inspector",
                  "10 Dataset Engineer",
                  "11 Intelligence Core",
                ].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A1A3A] border border-[#254B8C] text-xs font-semibold text-white"
                  >
                    <Cpu className="h-3.5 w-3.5 text-[#FFB547] shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI INFRASTRUCTURE & PROVIDER TELEMETRY */}
      <AIRuntimeStatusCard
        status={aiStatus}
        onRefresh={handleVerifyAIStatus}
        refreshing={verifyingAI}
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PANEL A: RESEARCH REQUEST INPUT & WORKFLOW CONTROLS */}
      <section className="rounded-2xl border border-space-800 bg-space-900 p-5 sm:p-6 shadow-panel space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-brand-intelligent dark:text-brand-light-cyan" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Panel A — Natural-Language Scientific Research Request
            </h2>
          </div>
          {recentRequests.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Recent Runs:</span>
              <select
                aria-label="Select recent research request"
                value={activeRequest?.id || ""}
                onChange={(e) => {
                  const found = recentRequests.find((r) => r.id === e.target.value);
                  if (found) syncRequestState(found);
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-200"
              >
                {recentRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.status}] {r.user_question.slice(0, 55)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleLaunchWorkflow} className="space-y-4">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a scientific question about NASA microgravity combustion, material flammability, or dataset construction..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/70 p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-intelligent"
          />

          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(sample)}
                className="text-left text-xs px-3 py-1.5 rounded-xl border border-space-800 bg-brand-soft/60 dark:bg-space-950 text-fg-secondary hover:border-brand-intelligent/50 hover:text-brand-blue dark:hover:text-brand-light-cyan transition"
              >
                Sample #{idx + 1}: {sample.slice(0, 68)}...
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-space-800">
            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-fg-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="rounded border-space-700 text-brand-blue focus:ring-brand-intelligent"
                />
                Pause for Human-in-the-Loop File Approval (AWAITING_APPROVAL Gate)
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-fg-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={forcePsiDiscovery}
                  onChange={(e) => setForcePsiDiscovery(e.target.checked)}
                  className="rounded border-space-700 text-brand-blue focus:ring-brand-intelligent"
                />
                Force Full NASA PSI Catalog Discovery
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="keep-white inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-blue hover:bg-brand-intelligent shadow-md disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing 11-Agent Graph...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Autonomous Research Workflow
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* PANEL B & PANEL C: INTENT PREVIEW + 11-AGENT MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL B: INTENT & COVERAGE */}
        <section className="lg:col-span-5 rounded-2xl border border-space-800 bg-space-900 p-5 sm:p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Panel B — Parsed Intent &amp; Local Coverage
              </h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
              AGENT 02 &amp; 03
            </span>
          </div>

          {activeRequest?.research_intent ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Scientific Domain</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeRequest.research_intent.research_domain}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Target Campaigns</div>
                  <div className="font-semibold text-brand-blue dark:text-brand-light-cyan mt-0.5">
                    {(activeRequest.research_intent.target_investigations || []).join(", ")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Fuel Material Filter (Editable)
                  </label>
                  <input
                    type="text"
                    value={editFuel}
                    onChange={(e) => setEditFuel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Gravity Regime (Editable)
                  </label>
                  <input
                    type="text"
                    value={editGravity}
                    onChange={(e) => setEditGravity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="text-slate-500 dark:text-slate-400 mb-1">Variables of Interest</div>
                <div className="flex flex-wrap gap-1.5">
                  {(activeRequest.research_intent.variables_of_interest || []).map((v) => (
                    <span
                      key={v}
                      className="px-2.5 py-1 rounded-md font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {activeRequest.existing_data_coverage && (
                <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Coverage Status: {activeRequest.existing_data_coverage.classification}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {activeRequest.existing_data_coverage.evidence_chunks_count} RAG chunks ready
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeRequest.existing_data_coverage.reuse_recommendation}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleReviseIntent}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold transition cursor-pointer"
              >
                Revise Scientific Intent &amp; Re-Run Workflow
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Submit a research request to inspect intent.</p>
          )}
        </section>

        {/* PANEL C: 11-AGENT ACTIVITY MONITOR */}
        <section className="lg:col-span-7 rounded-2xl border border-space-800 bg-space-900 p-6 shadow-panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-brand-soft dark:bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center text-brand-blue dark:text-brand-light-cyan">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-brand-navy dark:text-white">
                  Panel C — 11-Agent LangGraph Execution &amp; Audit Trace
                </h2>
                <p className="text-[11px] text-fg-muted">
                  Live agent status pipeline with timestamps and expandable tool telemetry
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-soft dark:bg-space-950 border border-space-800 text-xs font-mono font-semibold text-brand-blue dark:text-brand-light-cyan">
              {completedAgentIds.size} / 11 Agents Executed
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {ALL_11_AGENTS.map((ag) => {
              const runRecord = (activeRequest?.agent_runs || []).find(
                (r) => r.agent_id === ag.id
              );
              const isDone = completedAgentIds.has(ag.id);
              const rawStatus = runRecord?.status || (isDone ? "completed" : "pending");
              const normalized = normalizeAgentStatus(rawStatus);
              const cardBorder =
                normalized === "completed"
                  ? "border-brand-success/35 bg-emerald-500/5"
                  : normalized === "running"
                    ? "border-brand-cyan/45 bg-brand-cyan/5"
                    : normalized === "awaiting_approval" || normalized === "warning"
                      ? "border-brand-flame-orange/45 bg-brand-flame-orange/5"
                      : normalized === "failed"
                        ? "border-brand-error/45 bg-red-500/5"
                        : "border-space-800 bg-space-950/60";

              return (
                <div
                  key={ag.id}
                  className={`p-3 rounded-xl border text-xs transition-colors ${cardBorder}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-brand-soft dark:bg-space-900 border border-space-800 text-brand-blue dark:text-brand-light-cyan shrink-0">
                        {ag.id}
                      </span>
                      <span className="font-bold text-brand-navy dark:text-white truncate">
                        {ag.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {runRecord?.started_at && (
                        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-fg-muted">
                          <Clock className="h-3 w-3" />
                          {new Date(runRecord.started_at).toLocaleTimeString()}
                          {runRecord.completed_at
                            ? ` → ${new Date(runRecord.completed_at).toLocaleTimeString()}`
                            : ""}
                        </span>
                      )}
                      <AgentStatusIndicator
                        status={rawStatus}
                        label={runRecord ? runRecord.status.toUpperCase() : isDone ? "COMPLETED" : "QUEUED"}
                        compact
                      />
                    </div>
                  </div>

                  <div className="text-fg-muted text-[11px] mt-1">{ag.role}</div>

                  {runRecord &&
                    (runRecord.tools_invoked?.length > 0 ||
                      runRecord.error_message ||
                      runRecord.output_summary) && (
                      <details className="mt-2 pt-2 border-t border-space-800/80 group">
                        <summary className="cursor-pointer list-none inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue dark:text-brand-light-cyan hover:underline">
                          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                          Technical Trace &amp; Tool Telemetry
                        </summary>
                        <div className="mt-2 space-y-1.5 text-[11px] font-mono bg-space-950 rounded-lg p-2.5 border border-space-800">
                          {runRecord.tools_invoked?.length > 0 && (
                            <div className="text-brand-cyan break-words">
                              Tools: {runRecord.tools_invoked.join(", ")}
                            </div>
                          )}
                          {runRecord.started_at && (
                            <div className="text-fg-muted">
                              Window: {new Date(runRecord.started_at).toLocaleTimeString()}
                              {runRecord.completed_at
                                ? ` to ${new Date(runRecord.completed_at).toLocaleTimeString()}`
                                : " (active)"}
                            </div>
                          )}
                          {runRecord.error_message && (
                            <div className="text-brand-error">
                              Error: {runRecord.error_message}
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* PANEL E: HUMAN-IN-THE-LOOP APPROVAL BANNER (ACTIVE WHEN AWAITING_APPROVAL) */}
      {activeRequest?.status === "AWAITING_APPROVAL" && (
        <section className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
                <ShieldCheck className="w-5 h-5" />
                Human-in-the-Loop Governance Gate — Action Required
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                Agent 05 (File Intelligence &amp; Selection) has scored the NASA PSI file manifest and paused execution prior to file acquisition. Review the selected files in Panel E below, toggle checkboxes if needed, and approve or reject.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleApprovalDecision("APPROVE")}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                Approve &amp; Acquire ({selectedFileIds.length} Files)
              </button>
              <button
                type="button"
                onClick={() => handleApprovalDecision("MODIFY_PLAN")}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                Apply Modified Selection
              </button>
              <button
                type="button"
                onClick={() => handleApprovalDecision("REJECT")}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                Reject Run
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PANEL D & PANEL E: NASA PSI DISCOVERY + SMART FILE SELECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL D: NASA PSI DISCOVERY */}
        <section className="lg:col-span-5 rounded-2xl border border-space-800 bg-space-900 p-5 sm:p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-intelligent dark:text-brand-light-cyan" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Panel D — NASA PSI Catalog Discovery
              </h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-soft text-brand-blue dark:text-brand-light-cyan">
              AGENT 04 ({activeRequest?.discovered_investigations?.length || 0} Campaigns)
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {(activeRequest?.discovered_investigations || []).map((inv) => (
              <div
                key={inv.internal_catalog_id || inv.psi_id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-brand-blue dark:text-brand-light-cyan">
                      {inv.acronym}
                    </span>
                    {inv.source_record_id ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        Official NASA PSI: {inv.source_record_id}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        Unverified Standalone PSI ID
                      </span>
                    )}
                    {inv.internal_catalog_id && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Catalog: {inv.internal_catalog_id}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Score: {inv.relevance_score}%
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {inv.title}
                </div>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                  {inv.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <span>
                    Facility: {inv.facility || "ISS"} | Origin: {inv.record_origin || "LOCAL_SEED_RECORD"}
                  </span>
                  {inv.doi ? (
                    <span className="font-mono text-sky-600 dark:text-sky-400">
                      Paper DOI: {inv.doi}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      Portal Handoff Metadata
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PANEL E: SMART FILE SELECTION & SCORING */}
        <section className="lg:col-span-7 rounded-2xl border border-space-800 bg-space-900 p-5 sm:p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Panel E — Smart File Selection &amp; Priority Formula
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              AGENT 05 &amp; 06 (F = 0.35Q + 0.25T + 0.20C + 0.10P + 0.10A)
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {(activeRequest?.candidate_files || []).map((file: PSIFileManifestItem) => {
              const sb = file.score_breakdown;
              const isChecked = selectedFileIds.includes(file.file_identifier);
              return (
                <div
                  key={file.file_identifier}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                    file.selected
                      ? "border-emerald-500/35 bg-emerald-500/5"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFileCheckbox(file.file_identifier)}
                        className="mt-0.5 rounded border-slate-300 text-brand-blue focus:ring-brand-intelligent"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                          <span>{file.file_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {file.file_category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ID: {file.file_identifier} | Size:{" "}
                          {file.file_size_bytes
                            ? file.file_size_bytes > 1_000_000
                              ? `${(file.file_size_bytes / 1_000_000).toFixed(1)} MB`
                              : `${(file.file_size_bytes / 1024).toFixed(1)} KB`
                            : "N/A"}
                        </div>
                      </div>
                    </label>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                          file.selected
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        F = {sb?.priority_score_f ?? 0}
                      </span>
                    </div>
                  </div>

                  {sb && (
                    <div className="grid grid-cols-5 gap-1.5 pt-1 text-[10px] font-mono text-center">
                      <div className="p-1 rounded bg-white/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        Q={sb.question_relevance_q}
                      </div>
                      <div className="p-1 rounded bg-white/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        T={sb.file_type_relevance_t}
                      </div>
                      <div className="p-1 rounded bg-white/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        C={sb.content_coverage_c}
                      </div>
                      <div className="p-1 rounded bg-white/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        P={sb.provenance_quality_p}
                      </div>
                      <div className="p-1 rounded bg-white/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                        A={sb.accessibility_a}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {file.selection_rationale}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/60 text-[10px]">
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      Governance: {file.acquisition_outcome || file.accessibility}
                    </span>
                    {file.governance_explanation && (
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-md" title={file.governance_explanation}>
                        {file.governance_explanation}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* PANEL F & PANEL G: DATASET CONSTRUCTION MONITOR + CANONICAL DATASET EXPLORER */}
      {datasetDetail && (
        <section className="rounded-2xl border border-space-800 bg-space-900 p-5 sm:p-6 shadow-panel space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800/70 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-brand-intelligent dark:text-brand-light-cyan" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Panels F &amp; G — Dynamic Dataset Engine &amp; Canonical Explorer
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {datasetDetail.dataset_key} ({datasetDetail.latest_version?.version_tag || "v1.0.0"})
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                SHA-256 Content Fingerprint:{" "}
                <code className="font-mono text-brand-blue dark:text-brand-light-cyan">
                  {datasetDetail.latest_version?.content_fingerprint}
                </code>
              </p>
            </div>

            {/* EXPORT BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {(["json", "csv", "parquet"] as const).map((fmt) => (
                <a
                  key={fmt}
                  href={apiClient.getDatasetExportUrl(datasetDetail.id, fmt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-intelligent text-slate-800 dark:text-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5 text-brand-intelligent dark:text-brand-light-cyan" />
                  Export .{fmt.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* VALIDATION KPI CARDS */}
          {datasetDetail.quality_report && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-slate-500">Validation Gate</div>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  {datasetDetail.quality_report.overall_status}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-slate-500">Verified Records</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {datasetDetail.quality_report.total_records} Rows
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-slate-500">Passed / Warnings</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {datasetDetail.quality_report.passed_count} / {datasetDetail.quality_report.warning_count}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-slate-500">Provenance Coverage</div>
                <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mt-1">
                  {datasetDetail.quality_report.provenance_coverage_pct}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-slate-500">Null Handling</div>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  {datasetDetail.quality_report.null_handling_verified
                    ? "Strict Null (Never 0)"
                    : "Unverified"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <div className="text-slate-500">Source Campaigns</div>
                <div className="font-bold text-sm text-brand-blue dark:text-brand-light-cyan mt-1">
                  {(datasetDetail.source_investigation_ids || []).join(", ")}
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE TABS: RECORDS | COVERAGE | LINEAGE | PANDAS ANALYTICS | VERSION DIFF */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {(
              [
                { key: "records", label: "Canonical Records Table" },
                { key: "coverage", label: "Quality & Coverage Analysis" },
                { key: "lineage", label: "6-Hop Provenance Lineage Explorer" },
                { key: "analytics", label: "Pandas / NumPy Analytical Workspace" },
                { key: "diff", label: "Dataset Version Diff" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveDatasetTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeDatasetTab === tab.key
                    ? "keep-white bg-brand-blue text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: CANONICAL MEASUREMENT ITEMS TABLE */}
          {activeDatasetTab === "records" && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 font-semibold">Campaign</th>
                    <th className="py-2.5 px-3 font-semibold">Run Code</th>
                    <th className="py-2.5 px-3 font-semibold">Fuel / Material</th>
                    <th className="py-2.5 px-3 font-semibold">Parameter</th>
                    <th className="py-2.5 px-3 font-semibold">Normalized Value</th>
                    <th className="py-2.5 px-3 font-semibold">O2 / Pressure / Flow</th>
                    <th className="py-2.5 px-3 font-semibold">Provenance DOI</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {(datasetDetail.items || []).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-blue dark:text-brand-light-cyan">
                        {item.investigation_acronym}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">
                        {item.run_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {item.fuel_type}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white">
                        {item.parameter_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.normalized_value !== null && item.normalized_value !== undefined
                          ? `${item.normalized_value} ${item.normalized_unit}`
                          : "NULL"}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {item.oxygen_pct ?? "—"}% O2 | {item.pressure_kpa ?? "—"} kPa |{" "}
                        {item.airflow_cm_s ?? "—"} cm/s
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-sky-600 dark:text-sky-400">
                        {item.source_doi || "NASA-PSI"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {item.validation_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: COVERAGE & QUALITY ANALYSIS (PRIORITY 8) */}
          {activeDatasetTab === "coverage" && datasetCoverage && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-brand-soft/60 dark:bg-space-950 border border-space-800 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                Formula: {datasetCoverage.quality_formula}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Composite Quality Score", val: `${datasetCoverage.overall_quality_score}%` },
                  { label: "Field Completeness", val: `${datasetCoverage.field_completeness}%` },
                  { label: "Measurement Coverage", val: `${datasetCoverage.measurement_coverage}%` },
                  { label: "Source Provenance Coverage", val: `${datasetCoverage.source_provenance_coverage}%` },
                  { label: "Verified DOI Availability", val: `${datasetCoverage.doi_availability}%` },
                  { label: "Page / Section Ref Coverage", val: `${datasetCoverage.page_reference_coverage}%` },
                  { label: "SI Unit Consistency", val: `${datasetCoverage.unit_consistency}%` },
                  { label: "Duplicate / Missing Rate", val: `${datasetCoverage.duplicate_rate}% / ${datasetCoverage.missing_measurement_rate}%` },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    <div className="text-slate-500">{m.label}</div>
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 6-HOP LINEAGE EXPLORER (PRIORITY 8) */}
          {activeDatasetTab === "lineage" && datasetLineage && (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 text-xs">
              {(datasetLineage.lineage_items || []).map((node: any) => {
                const c = node.provenance_chain || {};
                return (
                  <div
                    key={node.item_id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-blue dark:text-brand-light-cyan">
                        Row #{node.row_index}: {node.parameter_name} = {node.normalized_value} {node.normalized_unit}
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                        {c.step_3_investigation?.verification_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-400">1. Dataset Item</div>
                        <div className="truncate">{c.step_1_dataset_item?.version_tag} ({c.step_1_dataset_item?.conversion_formula})</div>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-400">2. Exp. Run</div>
                        <div className="truncate">{c.step_2_experimental_run?.run_name} ({c.step_2_experimental_run?.fuel_type})</div>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-400">3. Investigation</div>
                        <div className="truncate">
                          {c.step_3_investigation?.acronym} | Official: {c.step_3_investigation?.source_record_id || "Unverified"}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-400">4. Publication DOI</div>
                        <div className="truncate text-sky-600 dark:text-sky-400">{c.step_4_source_document?.source_doi || "N/A"}</div>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-400">5. Page / Section</div>
                        <div className="truncate">p.{c.step_5_location_reference?.page_number ?? "—"} {c.step_5_location_reference?.section_name}</div>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                        <div className="text-slate-400">6. Original Source</div>
                        <div className="truncate">{c.step_6_original_source?.repository}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: PANDAS / NUMPY ANALYTICAL DATA WORKSPACE (PRIORITY 9) */}
          {activeDatasetTab === "analytics" && pandasAnalytics && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300 font-medium">
                {pandasAnalytics.causality_disclaimer}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-slate-500">Group By:</span>
                  <select
                    value={analyticsGroupBy}
                    onChange={async (e) => {
                      const col = e.target.value;
                      setAnalyticsGroupBy(col);
                      if (datasetDetail) {
                        const res = await apiClient.runDatasetAnalytics(datasetDetail.id, {
                          group_by_column: col,
                          filter_parameter: analyticsFilterParam || undefined,
                        });
                        setPandasAnalytics(res);
                      }
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1"
                  >
                    <option value="investigation_acronym">Investigation Campaign</option>
                    <option value="fuel_type">Fuel / Material Type</option>
                    <option value="validation_status">Validation Status</option>
                  </select>
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-slate-500">Filter Parameter:</span>
                  <input
                    type="text"
                    placeholder="e.g. flame_spread_rate"
                    value={analyticsFilterParam}
                    onChange={(e) => setAnalyticsFilterParam(e.target.value)}
                    onBlur={async () => {
                      if (datasetDetail) {
                        const res = await apiClient.runDatasetAnalytics(datasetDetail.id, {
                          group_by_column: analyticsGroupBy,
                          filter_parameter: analyticsFilterParam || undefined,
                        });
                        setPandasAnalytics(res);
                      }
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 font-mono"
                  />
                </label>

                <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
                  Unit Check: {pandasAnalytics.unit_comparison_check?.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Unit-Partitioned Descriptive Statistics ({pandasAnalytics.metric_classification})
                  </div>
                  {(pandasAnalytics.descriptive_statistics || []).map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-1 font-mono"
                    >
                      <div className="font-bold text-brand-blue dark:text-brand-light-cyan">
                        {st.parameter_name} [{st.normalized_unit}] (n={st.sample_count})
                      </div>
                      <div>
                        Mean={st.mean} | Std={st.std} | Min={st.min} | Median={st.median} | IQR={st.iqr} | Max={st.max}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Group-By Summary ({pandasAnalytics.inference_classification})
                  </div>
                  {(pandasAnalytics.group_by_summary || []).map((g: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 font-mono flex items-center justify-between"
                    >
                      <span>
                        <strong>{g.group_value}</strong> — {g.parameter_name} ({g.normalized_unit})
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        mean={g.mean} (n={g.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATASET VERSION DIFF (PRIORITY 8) */}
          {activeDatasetTab === "diff" && datasetDiff && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
                <div className="text-slate-500">Compared Versions</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">
                  {datasetDiff.base_version} → {datasetDiff.target_version}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
                <div className="text-slate-500">Added Records</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  +{datasetDiff.added_count}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
                <div className="text-slate-500">Removed Records</div>
                <div className="font-bold text-red-600 dark:text-red-400 mt-1">
                  -{datasetDiff.removed_count}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
                <div className="text-slate-500">Modified Values</div>
                <div className="font-bold text-amber-600 dark:text-amber-400 mt-1">
                  ~{datasetDiff.modified_count}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
                <div className="text-slate-500">Unchanged / Quality Δ</div>
                <div className="font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {datasetDiff.unchanged_count} ({datasetDiff.quality_score_delta >= 0 ? "+" : ""}{datasetDiff.quality_score_delta}%)
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* PANEL H: FINAL EVIDENCE-GROUNDED RESEARCH INTELLIGENCE REPORT */}
      {activeRequest?.final_report && (
        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/70 pb-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-brand-intelligent dark:text-brand-light-cyan" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Panel H — Evidence-Grounded Scientific Intelligence Synthesis (Agent 11)
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Provider: {activeRequest.final_report.ai_provider} ({activeRequest.final_report.model_name})
            </span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed bg-slate-50/70 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200/70 dark:border-slate-800">
            {activeRequest.final_answer}
          </div>

          {/* QUANTITATIVE PARAMETER SUMMARY */}
          {Array.isArray(activeRequest.final_report.quantitative_findings) &&
            activeRequest.final_report.quantitative_findings.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quantitative Dataset Parameter Envelope
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeRequest.final_report.quantitative_findings.map(
                    (qf: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-1"
                      >
                        <div className="font-mono font-bold text-brand-blue dark:text-brand-light-cyan">
                          {qf.parameter_name} ({qf.unit})
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          Min: <strong>{qf.min_value}</strong> | Mean:{" "}
                          <strong>{qf.mean_value}</strong> | Max:{" "}
                          <strong>{qf.max_value}</strong> (n={qf.sample_count})
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {qf.evidence_classification}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* VERIFIED CITATIONS */}
          {Array.isArray(activeRequest.final_report.evidence_citations) &&
            activeRequest.final_report.evidence_citations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Verified Scientific Citations &amp; Provenance Excerpts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeRequest.final_report.evidence_citations.map(
                    (cit: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-brand-blue dark:text-brand-light-cyan">
                            [{cit.investigation_code}] {cit.document_title}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            p.{cit.page_number} ({cit.section_name})
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 italic">
                          &ldquo;{cit.excerpt}&rdquo;
                        </p>
                        {cit.doi && (
                          <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400">
                            DOI: {cit.doi}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* SCIENTIFIC UNCERTAINTY & GAPS */}
          {activeRequest.final_report.scientific_uncertainty_note && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-amber-600 dark:text-amber-400">
                Scientific Uncertainty &amp; Extrapolation Boundary Note
              </div>
              <p>{activeRequest.final_report.scientific_uncertainty_note}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
