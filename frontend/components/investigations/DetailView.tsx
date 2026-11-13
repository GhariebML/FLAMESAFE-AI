import React from "react";
import Link from "next/link";
import { InvestigationDetail } from "@/types/investigation";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import {
  ExternalLink,
  Layers,
  FileText,
  Cpu,
  BookOpen,
  Flame,
  Database,
  Scale,
} from "lucide-react";
import { formatOxygen, formatPressure, formatVelocity } from "@/lib/utils/units";

export const DetailView: React.FC<{ investigation: InvestigationDetail }> = ({
  investigation,
}) => {
  const allSensors = Array.from(
    new Set(
      investigation.experimental_runs.flatMap((r) => r.sensor_types || [])
    )
  );
  const allEvidenceChunks = investigation.research_documents.flatMap((doc) =>
    (doc.evidence_chunks || []).map((chunk) => ({
      ...chunk,
      documentTitle: doc.title,
      doi: doc.doi,
    }))
  );
  const meta = investigation.metadata_payload || {};

  return (
    <div className="space-y-6">
      {/* 1. Overview & 2. Experimental Objectives */}
      <Card glow className="space-y-4 border-space-800 bg-space-900/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="flame" className="text-sm px-3 py-1">
              {investigation.acronym}
            </Badge>
            <span className="font-mono text-xs text-slate-300 bg-space-950 px-2.5 py-1 rounded border border-space-800">
              {investigation.psi_id}
            </span>
            {meta.facility && (
              <Badge variant="outline">{String(meta.facility)}</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <Link
              href={`/compare`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/35 text-xs font-medium text-blue-300 hover:bg-blue-500/25"
            >
              <Scale className="h-3.5 w-3.5" /> Compare in Lab
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">
            {investigation.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-amber-400">
            {investigation.research_area}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-space-800/80">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Experimental Objectives
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {investigation.objectives || "Not recorded in current PSI metadata."}
            </p>
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Scientific Context & Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {investigation.description || "Not recorded."}
            </p>
          </div>
        </div>

        {/* Metadata Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
            <span className="block text-[10px] uppercase text-slate-500">Flight Platform</span>
            <span className="text-slate-200 font-medium">{meta.platform || "International Space Station / Orbital"}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
            <span className="block text-[10px] uppercase text-slate-500">Principal Investigator</span>
            <span className="text-slate-200 font-medium">{meta.principal_investigator || "NASA GRC Team"}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
            <span className="block text-[10px] uppercase text-slate-500">Combustion Mode</span>
            <span className="text-slate-200 font-medium">{meta.combustion_type || investigation.research_area}</span>
          </div>
        </div>
      </Card>

      {/* 3, 4, 5, 6. Experimental Runs, Fuel Characteristics, Conditions & Measurements */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <Layers className="h-4 w-4 text-electric-400" />
          <span>
            Experimental Runs, Conditions & Measurements ({investigation.experimental_runs.length})
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {investigation.experimental_runs.map((run) => (
            <Card key={run.id} className="space-y-3 border-space-800 bg-space-900/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-amber-400">
                  {run.run_code}
                </span>
                <Badge variant="outline">{run.gravity_regime}</Badge>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-flame-400 shrink-0" />
                  <span>{run.fuel_name}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Category: {run.fuel_type}
                  {run.fuel_geometry ? ` · Geometry: ${run.fuel_geometry}` : ""}
                </div>
                {run.suppressant && (
                  <div className="text-[11px] text-plasma-400 mt-0.5">
                    Suppression / Extinction Mode: {run.suppressant}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-space-950 border border-space-800 text-[11px]">
                <div>
                  <span className="block text-slate-500">Oxygen</span>
                  <span className="font-mono font-medium text-slate-100">
                    {formatOxygen(run.oxygen_concentration)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Pressure</span>
                  <span className="font-mono font-medium text-slate-100">
                    {formatPressure(run.pressure_value, run.pressure_unit || "kPa")}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Airflow</span>
                  <span className="font-mono font-medium text-slate-100">
                    {formatVelocity(run.airflow_velocity, run.airflow_unit || "cm/s")}
                  </span>
                </div>
              </div>

              {run.measurements.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Null-Safe Quantitative Measurements
                  </span>
                  <div className="space-y-1">
                    {run.measurements.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-space-950/70 border border-space-800/80"
                      >
                        <span className="text-slate-300">{m.metric_name}</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {m.metric_value !== null && m.metric_value !== undefined
                            ? `${m.metric_value} ${m.unit}`
                            : "Not recorded"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {run.experimental_notes && (
                <div className="p-2.5 rounded-lg bg-space-950/50 border border-space-800/60 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-400">Experimental Results Note: </span>
                  {run.experimental_notes}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* 7. Sensors & Instrumentation + 8. Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3 border-space-800 bg-space-900/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Cpu className="h-4 w-4 text-plasma-400" />
            <span>Sensors & Diagnostic Hardware</span>
          </div>
          {allSensors.length === 0 ? (
            <p className="text-xs text-slate-400">No diagnostic instrumentation listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allSensors.map((sensor) => (
                <Badge key={sensor} variant="plasma">
                  {sensor}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 border-space-800 bg-space-900/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Authoritative NASA Data Sources ({investigation.data_sources.length})</span>
          </div>
          <div className="space-y-2">
            {investigation.data_sources.map((src) => (
              <div
                key={src.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-space-950 border border-space-800 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{src.source_name}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {src.doi ? `DOI: ${src.doi}` : "NASA Archive"}
                  </div>
                </div>
                <a
                  href={src.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded bg-space-800 text-plasma-400 hover:text-white"
                  title="Open source URL"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 9. Research Documents & 10. Evidence Chunks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <FileText className="h-4 w-4 text-plasma-400" />
          <span>
            Peer-Reviewed Publications ({investigation.research_documents.length})
          </span>
        </div>

        <div className="space-y-2">
          {investigation.research_documents.map((doc) => (
            <Card
              key={doc.id}
              className="flex items-center justify-between gap-3 p-4 border-space-800 bg-space-900/80"
            >
              <div>
                <h4 className="text-sm font-semibold text-slate-100">{doc.title}</h4>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {doc.document_type} {doc.doi ? `· DOI: ${doc.doi}` : ""}
                </div>
              </div>
              {doc.doi && (
                <a
                  href={`https://doi.org/${doc.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-space-800 text-slate-300 hover:text-white shrink-0"
                  aria-label={`Open DOI for ${doc.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </Card>
          ))}
        </div>

        {allEvidenceChunks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Indexed Evidence Excerpts ({allEvidenceChunks.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allEvidenceChunks.map((chunk) => (
                <Card key={chunk.id} className="p-3.5 space-y-2 border-space-800 bg-space-950/70">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-plasma-400">
                      {chunk.section_name || "Technical Excerpt"}
                    </span>
                    {chunk.page_number && (
                      <Badge variant="outline">Page {chunk.page_number}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    “{chunk.chunk_text}”
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
