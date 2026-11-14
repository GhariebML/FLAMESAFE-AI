import React from "react";
import { BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/shared/Badge";

export interface EvidenceCitationProps {
  investigationCode: string;
  documentTitle: string;
  excerpt: string;
  pageNumber?: number | null;
  sectionName?: string | null;
  doi?: string | null;
  verificationStatus?: string;
}

export const EvidenceCitation: React.FC<EvidenceCitationProps> = ({
  investigationCode,
  documentTitle,
  excerpt,
  pageNumber,
  sectionName,
  doi,
  verificationStatus = "Verified Source",
}) => {
  return (
    <article className="rounded-xl border border-space-800 bg-space-950 p-3.5 text-xs space-y-2 shadow-sm hover:border-brand-intelligent/40 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant="brand">[{investigationCode}]</StatusBadge>
          <span className="font-semibold text-fg-primary line-clamp-1 inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-brand-intelligent shrink-0" />
            {documentTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-fg-muted">
          {pageNumber && <span>p.{pageNumber}</span>}
          {sectionName && <span>({sectionName})</span>}
          <span className="inline-flex items-center gap-1 text-brand-success font-semibold">
            <ShieldCheck className="h-3 w-3" />
            {verificationStatus}
          </span>
        </div>
      </div>

      <p className="text-fg-secondary italic leading-relaxed border-l-2 border-brand-cyan/50 pl-3">
        &ldquo;{excerpt}&rdquo;
      </p>

      {doi && (
        <div className="pt-0.5">
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-blue dark:text-brand-light-cyan hover:underline"
          >
            DOI: {doi} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </article>
  );
};
