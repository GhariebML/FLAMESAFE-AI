import React from "react";
import { CitationItem } from "@/types/assistant";
import { ScientificCard } from "@/components/shared/Card";
import { StatusBadge } from "@/components/shared/Badge";
import { ExternalLink, CheckCircle } from "lucide-react";

export const CitationViewer: React.FC<{ citations: CitationItem[] }> = ({ citations }) => {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-space-800">
      <div className="text-xs font-semibold text-fg-muted flex items-center gap-1.5">
        <CheckCircle className="h-3.5 w-3.5 text-brand-success" />
        Verified NASA Scientific Citations ({citations.length})
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {citations.map((c) => (
          <ScientificCard
            key={c.citation_id}
            tone="soft"
            className="p-3 text-xs space-y-1.5 shadow-none"
          >
            <div className="flex items-center justify-between gap-2">
              <StatusBadge variant="brand" className="text-[10px]">
                {c.investigation_acronym} · {c.citation_id}
              </StatusBadge>
              <StatusBadge variant="success" className="text-[9px]">
                {c.verification_status}
              </StatusBadge>
            </div>

            <div className="font-semibold text-brand-navy dark:text-fg-primary line-clamp-1">
              {c.document_title}
            </div>

            <p className="text-[11px] text-fg-secondary italic bg-space-900 p-2 rounded-lg border border-space-800">
              &ldquo;{c.excerpt}&rdquo;
            </p>

            <div className="flex items-center justify-between text-[10px] text-fg-muted pt-1">
              <span>{c.page_number ? `Page ${c.page_number}` : ""}</span>
              {c.doi && (
                <a
                  href={`https://doi.org/${c.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-blue dark:text-brand-light-cyan hover:underline font-mono"
                >
                  DOI: {c.doi} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </ScientificCard>
        ))}
      </div>
    </div>
  );
};
