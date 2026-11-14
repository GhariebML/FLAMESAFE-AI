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
          DEDICATED STORYBOARD SHOWCASE: RESEARCH REPORT — MISSION COMPLETE!
      ===================================================================== */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#060E20] via-[#09152E] to-[#050A18] border-2 border-[#254B8C]/90 p-6 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Columns: Research Report Mission Complete Showcase */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Research Report • Traceable NASA Corpus</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Mission <span className="text-[#FF7A18]">Complete!</span>
            </h1>

            <p className="text-sm sm:text-base text-[#D6E4FF] leading-relaxed max-w-xl">
              Here&apos;s your scientific summary with verified sources, DOI
              identifiers, and page-level evidence excerpts from NASA PSI.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#E94B16] hover:from-[#FF8B33] hover:to-[#FF6B24] text-white keep-white font-bold text-sm shadow-[0_10px_28px_rgba(255,122,24,0.45)] transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>

              <Badge variant="success" className="gap-1.5 py-2 px-3.5">
                <ShieldCheck className="h-4 w-4" /> Verified NASA Citations
              </Badge>
            </div>
          </div>

          {/* Right 5 Columns: NASA Dossier Visual + Realistic Astro-Flame Bot */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="relative h-56 rounded-2xl overflow-hidden border border-[#254B8C] bg-black shadow-xl">
              <img
                src="/images/story/report-docs.png"
                alt="NASA Research Report Dossier"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative h-56 rounded-2xl overflow-hidden border border-[#254B8C] bg-black shadow-xl">
              <img
                src="/images/story/mascot-journey.png"
                alt="Realistic Astro-Flame Bot Mission Complete"
                className="h-full w-full object-cover"
              />
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
