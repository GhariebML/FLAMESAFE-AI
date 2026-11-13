import React from "react";
import { InvestigationDetail } from "@/types/investigation";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ExternalLink, Layers, FileText, Link as LinkIcon } from "lucide-react";
import { formatOxygen, formatPressure, formatVelocity } from "@/lib/utils/units";

export const DetailView: React.FC<{ investigation: InvestigationDetail }> = ({
  investigation,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <Card glow className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="flame" className="text-sm px-3 py-1">
              {investigation.acronym}
            </Badge>
            <span className="font-mono text-xs text-slate-400">{investigation.psi_id}</span>
          </div>
          {investigation.doi && (
            <a
              href={`https://doi.org/${investigation.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-plasma-400 hover:text-plasma-300 font-mono"
            >
              DOI: {investigation.doi} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{investigation.title}</h1>
          <p className="mt-1 text-sm font-medium text-flame-400">{investigation.research_area}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Research Objectives
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {investigation.objectives || "Not documented."}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview Description
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {investigation.description || "Not documented."}
            </p>
          </div>
        </div>
      </Card>

      {/* Experimental Runs Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <Layers className="h-4 w-4 text-flame-400" />
          Documented Experimental Runs ({investigation.experimental_runs.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investigation.experimental_runs.map((run) => (
            <Card key={run.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-flame-400">
                  {run.run_code}
                </span>
                <Badge variant="outline">{run.gravity_regime}</Badge>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-200">{run.fuel_name}</div>
                <div className="text-xs text-slate-400">
                  Type: {run.fuel_type} {run.fuel_geometry ? `· Geometry: ${run.fuel_geometry}` : ""}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-space-950 border border-space-800 text-[11px]">
                <div>
                  <span className="block text-slate-500">Oxygen</span>
                  <span className="font-medium text-slate-200">
                    {formatOxygen(run.oxygen_concentration)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Pressure</span>
                  <span className="font-medium text-slate-200">
                    {formatPressure(run.pressure_value, run.pressure_unit || "kPa")}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Airflow</span>
                  <span className="font-medium text-slate-200">
                    {formatVelocity(run.airflow_velocity, run.airflow_unit || "cm/s")}
                  </span>
                </div>
              </div>

              {run.measurements.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Recorded Measurements
                  </span>
                  <div className="space-y-1">
                    {run.measurements.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-space-900 border border-space-800/60"
                      >
                        <span className="text-slate-300">{m.metric_name}</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {m.metric_value !== null ? `${m.metric_value} ${m.unit}` : "null"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {run.experimental_notes && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: {run.experimental_notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Publications and Documents */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <FileText className="h-4 w-4 text-plasma-400" />
          Related Scientific Publications ({investigation.research_documents.length})
        </div>

        <div className="space-y-2">
          {investigation.research_documents.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between p-3.5">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{doc.title}</h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  Type: {doc.document_type} {doc.doi ? `· DOI: ${doc.doi}` : ""}
                </div>
              </div>
              {doc.doi && (
                <a
                  href={`https://doi.org/${doc.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-space-800 text-slate-300 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
