import React from "react";
import { Card } from "@/components/shared/Card";
import { Database, FileText, Activity, ShieldCheck } from "lucide-react";

interface MetricsProps {
  totalInvestigations: number;
  totalRuns: number;
  totalMeasurements: number;
  totalDocuments: number;
}

export const MetricsOverview: React.FC<MetricsProps> = ({
  totalInvestigations,
  totalRuns,
  totalMeasurements,
  totalDocuments,
}) => {
  const metrics = [
    {
      label: "Indexed Investigations",
      value: totalInvestigations,
      icon: Database,
      desc: "Canonical NASA PSI flight programs",
      color: "text-flame-400",
    },
    {
      label: "Experimental Runs",
      value: totalRuns,
      icon: Activity,
      desc: "Documented microgravity test runs",
      color: "text-plasma-400",
    },
    {
      label: "Scientific Measurements",
      value: totalMeasurements,
      icon: ShieldCheck,
      desc: "Spread rates, heat fluxes & quench limits",
      color: "text-emerald-400",
    },
    {
      label: "Research Publications",
      value: totalDocuments,
      icon: FileText,
      desc: "Peer-reviewed papers & technical reports",
      color: "text-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.label} className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{m.label}</span>
              <Icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-white tracking-tight">{m.value}</div>
              <p className="mt-1 text-[11px] text-slate-500">{m.desc}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
