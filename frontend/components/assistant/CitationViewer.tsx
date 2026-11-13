import React from "react";
import { CitationItem } from "@/types/assistant";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ExternalLink, CheckCircle } from "lucide-react";

export const CitationViewer: React.FC<{ citations: CitationItem[] }> = ({ citations }) => {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-space-800">
      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        Verified NASA Scientific Citations ({citations.length})
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {citations.map((c) => (
          <Card key={c.citation_id} className="p-3 text-xs bg-space-950/60 border-space-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="flame" className="text-[10px]">
                {c.investigation_acronym} · {c.citation_id}
              </Badge>
              <Badge variant="success" className="text-[9px]">
                {c.verification_status}
              </Badge>
            </div>

            <div className="font-semibold text-slate-200 line-clamp-1">{c.document_title}</div>

            <p className="text-[11px] text-slate-400 italic bg-space-900/60 p-2 rounded border border-space-800/80">
              "{c.excerpt}"
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>{c.page_number ? `Page ${c.page_number}` : ""}</span>
              {c.doi && (
                <a
                  href={`https://doi.org/${c.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-plasma-400 hover:text-plasma-300 font-mono"
                >
                  DOI: {c.doi} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
