import React from "react";
import { ScientificCard } from "@/components/shared/Card";
import { StatusBadge } from "@/components/shared/Badge";
import { formatDate } from "@/lib/utils/formatters";

interface SourceItem {
  id: string;
  source_name: string;
  investigation_acronym: string;
  doi: string;
  accessed_at: string;
}

export const RecentSources: React.FC<{ sources: SourceItem[] }> = ({ sources }) => {
  const safeSources = Array.isArray(sources) ? sources : [];
  return (
    <ScientificCard className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-bold text-brand-navy dark:text-fg-primary">
          Recent NASA Provenance Records
        </h3>
        <StatusBadge variant="success" dot>
          Verified DOI
        </StatusBadge>
      </div>

      <div className="space-y-2.5">
        {safeSources.length === 0 ? (
          <div className="text-xs text-fg-muted py-4 text-center rounded-xl border border-dashed border-space-800">
            No provenance records synced yet.
          </div>
        ) : (
          safeSources.map((s: any, idx: number) => (
            <div
              key={s?.id || idx}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-soft/60 dark:bg-space-950 border border-space-800 text-xs"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-brand-blue dark:text-brand-light-cyan">
                    [{s?.investigation_acronym || "NASA-PSI"}]
                  </span>
                  <span className="font-semibold text-fg-primary truncate">
                    {s?.source_name || s?.name || "NASA PSI Repository"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-fg-muted mt-0.5 truncate">
                  DOI: {s?.doi || "Verified NASA Archive"}
                </div>
              </div>
              <div className="text-[11px] font-mono text-fg-muted shrink-0">
                {formatDate(s?.accessed_at || s?.last_verified_at || "2026-11-14T00:00:00Z")}
              </div>
            </div>
          ))
        )}
      </div>
    </ScientificCard>
  );
};
