import React from "react";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

interface SourceItem {
  id: string;
  source_name: string;
  investigation_acronym: string;
  doi: string;
  accessed_at: string;
}

export const RecentSources: React.FC<{ sources: SourceItem[] }> = ({ sources }) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Recent NASA Provenance Records</h3>
        <Badge variant="outline">Verified DOI</Badge>
      </div>

      <div className="space-y-2">
        {sources.length === 0 ? (
          <div className="text-xs text-slate-500 py-4">No sources recorded yet.</div>
        ) : (
          sources.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-space-950/40 border border-space-800 text-xs"
            >
              <div>
                <span className="font-semibold text-flame-400 mr-2">[{s.investigation_acronym}]</span>
                <span className="text-slate-300">{s.source_name}</span>
                <div className="text-[10px] text-slate-500 mt-0.5">DOI: {s.doi}</div>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0 ml-3">
                {formatDate(s.accessed_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
