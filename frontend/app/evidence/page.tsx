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
import { BookOpenCheck, FileText, Database, ExternalLink, ShieldCheck } from "lucide-react";

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-plasma-400 shrink-0" />
            <span>Evidence & Provenance Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit every indexed NASA scientific publication, DOI identifier, source URL, and page-level evidence chunk.
          </p>
        </div>
        <Badge variant="success" className="gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" /> Traceable Scientific Corpus
        </Badge>
      </div>

      {error && (
        <UncertaintyBanner
          variant="warning"
          title="Sources Catalog Unavailable"
          message={error}
        />
      )}

      {catalog && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-space-800 bg-space-900/80">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search evidence excerpts, document titles, sections, or DOIs..."
          className="flex-1"
        />
        <select
          aria-label="Filter evidence by NASA investigation"
          value={investigationFilter}
          onChange={(e) => setInvestigationFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
