import React from "react";
import Link from "next/link";
import { InvestigationSummary } from "@/types/investigation";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ArrowRight, Layers, FileText, Flame, ExternalLink } from "lucide-react";

export const InvestigationCard: React.FC<{ investigation: InvestigationSummary }> = ({
  investigation,
}) => {
  return (
    <Card className="flex flex-col justify-between border-space-800 bg-space-900/80 hover:border-blue-500/50 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="flame">{investigation.acronym}</Badge>
          <span className="text-[11px] font-mono text-slate-400">{investigation.psi_id}</span>
        </div>

        <h3 className="mt-3 text-base font-bold text-slate-50 group-hover:text-blue-300 transition-colors">
          {investigation.title}
        </h3>

        <div className="mt-1 text-xs text-plasma-400 font-medium">
          {investigation.research_area}
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {investigation.description ||
            "Microgravity combustion research program recorded in NASA PSI."}
        </p>

        {/* Fuel & Gravity Chips */}
        {(investigation.primary_fuel_types?.length || investigation.gravity_regimes?.length) ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {investigation.primary_fuel_types?.map((fuel) => (
              <span
                key={fuel}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-space-950 border border-space-800 text-[10px] text-amber-300"
              >
                <Flame className="h-2.5 w-2.5" /> {fuel}
              </span>
            ))}
            {investigation.gravity_regimes?.slice(0, 1).map((grav) => (
              <span
                key={grav}
                className="px-2 py-0.5 rounded bg-space-950 border border-space-800 text-[10px] font-mono text-slate-300"
              >
                {grav}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 pt-3.5 border-t border-space-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            {investigation.experimental_runs_count} runs
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            {investigation.documents_count} docs
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {investigation.doi && (
            <a
              href={`https://doi.org/${investigation.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open DOI ${investigation.doi}`}
              className="text-[11px] font-mono text-plasma-400 hover:text-plasma-300 inline-flex items-center gap-0.5"
            >
              DOI <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Link
            href={`/investigations/${investigation.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 group-hover:translate-x-0.5 transition-all"
          >
            Inspect <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
