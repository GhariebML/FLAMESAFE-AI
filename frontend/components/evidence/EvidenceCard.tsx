import React from "react";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { FileText, ExternalLink } from "lucide-react";

export const EvidenceCard: React.FC<{
  title: string;
  excerpt: string;
  acronym: string;
  page?: number | null;
  doi?: string | null;
}> = ({ title, excerpt, acronym, page, doi }) => {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="flame">{acronym}</Badge>
        {doi && (
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-plasma-400 hover:underline inline-flex items-center gap-1"
          >
            DOI: {doi} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <FileText className="h-4 w-4 text-slate-400" />
        {title}
      </div>

      <p className="text-xs text-slate-300 bg-space-950 p-3 rounded-lg border border-space-800 leading-relaxed italic">
        &ldquo;{excerpt}&rdquo;
      </p>

      {page && <div className="text-[10px] text-slate-500">Document Page: {page}</div>}
    </Card>
  );
};
