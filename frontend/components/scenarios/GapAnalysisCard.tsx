import React from "react";
import { ScenarioAnalysisResponse } from "@/types/scenario";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { UncertaintyBanner } from "@/components/ui/UncertaintyBanner";
import { AlertCircle, Compass, BookOpen, ExternalLink } from "lucide-react";

const STATUS_BADGE_MAP: Record<string, "success" | "plasma" | "warning" | "danger"> = {
  "Exact Match": "success",
  "Direct Match": "success",
  "Partial Match": "plasma",
  "Analogous Range": "plasma",
  "Extrapolated Regime": "warning",
  Extrapolated: "warning",
  "Unsupported Condition": "danger",
  "No Data": "danger",
};

export const GapAnalysisCard: React.FC<{ analysis: ScenarioAnalysisResponse }> = ({
  analysis,
}) => {
  const relevantInvs = Array.isArray(analysis?.relevant_investigations)
    ? analysis.relevant_investigations
    : Array.isArray((analysis as any)?.matching_investigations)
    ? (analysis as any).matching_investigations.map((i: any) => i?.acronym || String(i))
    : [];
  const condMatches = Array.isArray(analysis?.condition_matches)
    ? analysis.condition_matches
    : [];
  const supEvidence = Array.isArray(analysis?.supporting_evidence)
    ? analysis.supporting_evidence
    : [];
  const gaps = Array.isArray(analysis?.research_gaps)
    ? analysis.research_gaps
    : Array.isArray((analysis as any)?.identified_gaps)
    ? (analysis as any).identified_gaps
    : [];
  const directions = Array.isArray(analysis?.recommended_research_directions)
    ? analysis.recommended_research_directions
    : Array.isArray((analysis as any)?.recommended_actions)
    ? (analysis as any).recommended_actions
    : [];

  return (
    <div className="space-y-6">
      {/* Target & Summary */}
      <Card glow className="space-y-3 border-space-800 bg-space-900/90">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="flame" className="text-xs">
              {analysis?.target_environment || (analysis as any)?.environment || "Orbital Habitat"}
            </Badge>
            {relevantInvs.map((acr: string) => (
              <Badge key={acr} variant="outline">
                {acr}
              </Badge>
            ))}
          </div>
          <span className="text-xs font-mono text-plasma-400">
            {analysis?.gravity_context || "Microgravity / Partial-Gravity Regime"}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {analysis?.scenario_summary || (analysis as any)?.coverage_status}
        </p>
      </Card>

      {/* Condition Matches */}
      {condMatches.length > 0 && (
        <Card className="space-y-3 border-space-800 bg-space-900/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Experimental Condition Coverage & Match Classification
          </h4>
          <div className="space-y-2.5">
            {condMatches.map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-space-950 border border-space-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-100">{c.parameter}</span>
                    <span className="text-plasma-400 font-mono">[{c.scenario_input}]</span>
                  </div>
                  {c.notes && <p className="text-[11px] text-slate-400 leading-relaxed">{c.notes}</p>}
                </div>
                <Badge
                  variant={STATUS_BADGE_MAP[c.experimental_data_status] || "warning"}
                  className="shrink-0 self-start sm:self-center"
                >
                  {c.experimental_data_status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Supporting Evidence Snippets */}
      {supEvidence.length > 0 && (
        <Card className="space-y-3 border-space-800 bg-space-900/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-plasma-400">
            <BookOpen className="h-4 w-4" /> Supporting NASA Experimental Evidence
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supEvidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="flame">{ev.investigation_acronym}</Badge>
                  {ev.page_number && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Page {ev.page_number}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-200">{ev.document_title}</div>
                <p className="text-slate-400 italic leading-relaxed">“{ev.excerpt}”</p>
                {ev.doi && (
                  <a
                    href={`https://doi.org/${ev.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-plasma-400 hover:underline"
                  >
                    DOI: {ev.doi} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Research Gaps & Recommended Directions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-amber-500/30 bg-amber-950/15 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" /> Identified Scientific Research Gaps
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-200 leading-relaxed">
            {gaps.map((gap: string, i: number) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </Card>

        {directions.length > 0 && (
          <Card className="border-blue-500/30 bg-blue-950/15 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Compass className="h-4 w-4" /> Recommended Research Directions
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-200 leading-relaxed">
              {directions.map((dir: string, i: number) => (
                <li key={i}>{dir}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Safety Advisory */}
      <UncertaintyBanner
        variant="warning"
        title="Gravity & Extrapolation Safety Boundary Advisory"
        message={
          analysis?.safety_advisory ||
          "Empirical 0g ISS data must be interpreted with appropriate safety margins when extrapolating to partial-gravity exploration habitats."
        }
      />
    </div>
  );
};
