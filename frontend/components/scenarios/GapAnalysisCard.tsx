import React from "react";
import { ScenarioAnalysisResponse } from "@/types/scenario";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export const GapAnalysisCard: React.FC<{ analysis: ScenarioAnalysisResponse }> = ({
  analysis,
}) => {
  return (
    <div className="space-y-6">
      {/* Target & Summary */}
      <Card glow className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="flame" className="text-xs">
            {analysis.target_environment}
          </Badge>
          <span className="text-xs font-mono text-plasma-400">{analysis.gravity_context}</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">{analysis.scenario_summary}</p>
      </Card>

      {/* Condition Matches */}
      <Card className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Experimental Condition Validation
        </h4>
        <div className="space-y-2">
          {analysis.condition_matches.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-space-950 border border-space-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-semibold text-slate-200">{c.parameter}</span>
                <span className="text-slate-400 ml-2 font-mono">[{c.scenario_input}]</span>
                {c.notes && <p className="text-[11px] text-slate-500 mt-0.5">{c.notes}</p>}
              </div>
              <Badge
                variant={
                  c.experimental_data_status === "Direct Match"
                    ? "success"
                    : c.experimental_data_status === "Analogous Range"
                    ? "plasma"
                    : "warning"
                }
              >
                {c.experimental_data_status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Research Gaps */}
      <Card className="border-amber-500/30 bg-amber-950/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4" /> Identified Scientific Research Gaps
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
          {analysis.research_gaps.map((gap, i) => (
            <li key={i}>{gap}</li>
          ))}
        </ul>
      </Card>

      {/* Safety Advisory */}
      <Card className="border-red-500/30 bg-red-950/10 space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" /> Safety Boundary Advisory
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{analysis.safety_advisory}</p>
      </Card>
    </div>
  );
};
