import React from "react";
import Link from "next/link";
import { InvestigationSummary } from "@/types/investigation";
import { ScientificCard } from "@/components/shared/Card";
import { StatusBadge } from "@/components/shared/Badge";
import { ArrowRight, Layers, FileText, Flame, ExternalLink } from "lucide-react";

function resolveInvestigationThumb(acronym: string): string {
  const upper = acronym.toUpperCase();
  if (upper.includes("ACME")) return "/images/story/inv-acme.png";
  if (upper.includes("SAFFIRE")) return "/images/story/inv-saffire.png";
  if (upper.includes("FLEX")) return "/images/story/inv-flex.png";
  if (upper.includes("SAME")) return "/images/story/inv-same.png";
  return "/images/story/inv-bass.png";
}

export const InvestigationCard: React.FC<{ investigation: InvestigationSummary }> = ({
  investigation,
}) => {
  const thumbSrc = resolveInvestigationThumb(investigation.acronym || "");

  return (
    <ScientificCard
      interactive
      float
      className="relative overflow-hidden flex flex-col justify-between group"
    >
      {/* Top Brand Gradient Accent Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF7A18] via-[#39B9EB] to-[#00B8FF] opacity-90 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-[#1E3A6E] bg-[#040812] mb-4 shadow-inner">
          <img
            src={thumbSrc}
            alt={investigation.acronym}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060E20]/85 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
            <StatusBadge variant="brand">{investigation.acronym}</StatusBadge>
            <span className="text-[11px] font-mono font-semibold text-[#D6E4FF] px-2.5 py-0.5 rounded-md bg-[#060E20]/90 border border-[#39B9EB]/40 backdrop-blur-md">
              {investigation.psi_id}
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-[#39B9EB] transition-colors line-clamp-2">
          {investigation.title}
        </h3>

        <div className="mt-1 text-xs text-[#39B9EB] font-semibold">
          {investigation.research_area}
        </div>

        <p className="mt-2 text-xs text-[#A1A8B3] line-clamp-2 leading-relaxed">
          {investigation.description ||
            "Microgravity combustion research program recorded in NASA PSI."}
        </p>

        {/* Fuel & Gravity Chips */}
        {(investigation.primary_fuel_types?.length || investigation.gravity_regimes?.length) ? (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {investigation.primary_fuel_types?.map((fuel) => (
              <span
                key={fuel}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF7A18]/15 border border-[#FF7A18]/35 text-[10px] font-semibold text-[#FFB547]"
              >
                <Flame className="h-2.5 w-2.5" /> {fuel}
              </span>
            ))}
            {investigation.gravity_regimes?.slice(0, 1).map((grav) => (
              <span
                key={grav}
                className="px-2.5 py-0.5 rounded-full bg-[#0A1834] border border-[#1E3A6E] text-[10px] font-mono text-[#B4C6E4]"
              >
                {grav}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 pt-3.5 border-t border-[#1E3A6E]/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-[#9BB0CD] font-mono">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-[#39B9EB]" />
            {investigation.experimental_runs_count} runs
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-[#39B9EB]" />
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
              className="text-[11px] font-mono font-medium text-[#39B9EB] hover:underline inline-flex items-center gap-0.5"
            >
              DOI <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Link
            href={`/investigations/${investigation.id}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#11264E] border border-[#39B9EB]/40 text-xs font-semibold text-white group-hover:bg-[#FF7A18] group-hover:border-[#FF7A18] transition-all"
          >
            Inspect <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </ScientificCard>
  );
};
