import React from "react";
import Link from "next/link";
import { InvestigationSummary } from "@/types/investigation";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ArrowRight, Layers, FileText, ExternalLink } from "lucide-react";

export const InvestigationCard: React.FC<{ investigation: InvestigationSummary }> = ({
  investigation,
}) => {
  return (
    <Card className="flex flex-col justify-between hover:border-flame-500/40 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="flame">{investigation.acronym}</Badge>
          <span className="text-[11px] font-mono text-slate-500">{investigation.psi_id}</span>
        </div>

        <h3 className="mt-3 text-base font-bold text-white group-hover:text-flame-400 transition-colors">
          {investigation.title}
        </h3>

        <div className="mt-1 text-xs text-plasma-400 font-medium">
          {investigation.research_area}
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {investigation.description || "Microgravity combustion research program recorded in NASA PSI."}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-space-800 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {investigation.experimental_runs_count} runs
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {investigation.documents_count} docs
          </span>
        </div>

        <Link
          href={`/investigations/${investigation.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-flame-400 hover:text-flame-300 group-hover:translate-x-0.5 transition-all"
        >
          Explore <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
};
