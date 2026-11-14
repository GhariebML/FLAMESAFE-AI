"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { SourceCatalogResponse } from "@/types/investigation";
import {
  MetricCard,
  SearchInput,
  UncertaintyBanner,
  LoadingSkeleton,
  EmptyState,
  Card,
  Badge,
} from "@/components/ui";
import { BookOpenCheck, FileText, Database, ExternalLink, ShieldCheck, CheckCircle2, Download, Sparkles } from "lucide-react";

export default function EvidenceCenterPage() {
  const [catalog, setCatalog] = useState<SourceCatalogResponse | null>(null);
  const [investigationFilter, setInvestigationFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      apiClient
        .getSourcesCatalog({
          investigation: investigationFilter || undefined,
          query: searchQuery || undefined,
        })
        .then((res) => {
          if (mounted) {
            setCatalog(res);
            setError(null);
          }
        })
        .catch((err) => {
          if (mounted) setError(err.message || "Failed to load NASA sources catalog.");
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [investigationFilter, searchQuery]);

  const handleDownloadReport = () => {
    const payload = catalog || {
      report: "FlameSafe AI — NASA PSI Traceable Evidence Summary",
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flamesafe-nasa-research-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[88rem] mx-auto space-y-8 min-w-0 pb-10">
      {/* =====================================================================
          PHASE 7.7 — EVIDENCE VAULT: TRACEABLE NASA PSI PUBLICATIONS & DOIS
      ===================================================================== */}
      <section className="relative rounded-2xl bg-[#10151D] border border-[#283340] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 8 Columns: Traceable NASA Corpus Header */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 text-xs font-bold text-[#22C55E]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Traceable NASA PSI Evidence Vault</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F7F7F5] tracking-tight">
              Primary Literature &amp; <span className="text-[#FF6B24]">Citation Vault</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#A1A8B3] leading-relaxed max-w-2xl">
              Inspect peer-reviewed NASA Physical Sciences Informatics (PSI) and NTRS technical
              publications, DOI identifiers, and page-level evidence excerpts used to ground
              autonomous research synthesis.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B24] to-[#E94B16] hover:from-[#FF8040] hover:to-[#FF6B24] text-white keep-white font-bold text-xs sm:text-sm shadow-[0_8px_24px_rgba(255,107,36,0.38)] transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Export Evidence Catalog (JSON)</span>
              </button>

              <Badge variant="success" className="gap-1.5 py-1.5 px-3">
                <ShieldCheck className="h-4 w-4" /> Page &amp; Section Verified
              </Badge>
            </div>
          </div>

          {/* Right 4 Columns: Single NASA Report Dossier Visual (No Repeated Mascot) */}
          <div className="lg:col-span-4">
            <div className="relative h-48 rounded-xl overflow-hidden border border-[#283340] bg-[#080A0F] shadow-xl">
              <img
                src="/images/story/report-docs.png"
                alt="NASA PSI Primary Literature Dossier"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/85 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-[#F7F7F5]">NASA PSI / NTRS Archive</span>
                <span className="font-mono text-[#39B9EB]">DOI Indexed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <UncertaintyBanner
          variant="warning"
          title="Sources Catalog Unavailable"
          message={error}
        />
      )}

      {catalog && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
          <MetricCard
            label="Data Repositories"
            value={catalog.total_sources}
            subtitle="Authoritative NASA PSI & NTRS archives"
            icon={Database}
            accentColor="electric"
          />
          <MetricCard
            label="Peer-Reviewed Documents"
            value={catalog.total_documents}
            subtitle="Indexed primary literature sources"
            icon={FileText}
            accentColor="plasma"
          />
          <MetricCard
            label="Indexed Evidence Chunks"
            value={catalog.total_evidence_chunks}
            subtitle="Page & section verified RAG excerpts"
            icon={BookOpenCheck}
            accentColor="emerald"
          />
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3.5 p-4 sm:p-5 rounded-2xl border border-space-800 bg-space-900 shadow-panel">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search evidence excerpts, document titles, sections, or DOIs..."
          className="flex-1 min-w-0"
        />
        <select
          aria-label="Filter evidence by NASA investigation"
          value={investigationFilter}
          onChange={(e) => setInvestigationFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs font-medium text-fg-primary focus:outline-none focus:border-brand-intelligent shrink-0"
        >
          <option value="">All Investigations</option>
          <option value="BASS">BASS</option>
          <option value="SAFFIRE">SAFFIRE</option>
          <option value="FLEX">FLEX</option>
          <option value="SAME">SAME</option>
          <option value="ACME">ACME</option>
        </select>
      </div>

      {/* Evidence Excerpts List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          <LoadingSkeleton className="h-44" />
          <LoadingSkeleton className="h-44" />
          <LoadingSkeleton className="h-44" />
          <LoadingSkeleton className="h-44" />
        </div>
      ) : !catalog || catalog.evidence_items.length === 0 ? (
        <EmptyState
          title="No matching evidence excerpts found"
          description="Try clearing filters or verifying backend database seeding."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {catalog.evidence_items.map((item) => (
            <Card key={item.chunk_id} className="space-y-3 border-space-800 bg-space-900/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="flame">{item.investigation_acronym}</Badge>
                  <span className="font-mono text-[11px] text-slate-400">{item.psi_id}</span>
                </div>
                <Badge variant={item.verification_status === "Verified Source" ? "success" : "outline"}>
                  {item.verification_status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-100">{item.document_title}</h3>
                <div className="text-[11px] text-plasma-400 mt-0.5 flex flex-wrap gap-2">
                  <span>{item.section_name || "General Section"}</span>
                  {item.page_number && <span>· Page {item.page_number}</span>}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-space-950/70 p-3 rounded-lg border border-space-800/80">
                “{item.chunk_text}”
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <span className="font-mono text-slate-500">
                  Vector: {item.embedding_provider || "none"}
                  {item.embedding_model ? ` (${item.embedding_model})` : ""}
                </span>
                {item.doi && (
                  <a
                    href={`https://doi.org/${item.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-plasma-400 hover:underline"
                  >
                    DOI: {item.doi} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
