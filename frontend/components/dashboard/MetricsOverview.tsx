import React from "react";
import { Database, FileText, Activity, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Indexed Investigations"
        value={totalInvestigations}
        subtitle="Canonical NASA PSI flight programs"
        accent="blue"
        icon={<Database className="h-5 w-5" />}
      />
      <MetricCard
        title="Experimental Runs"
        value={totalRuns}
        subtitle="Documented microgravity test runs"
        accent="cyan"
        icon={<Activity className="h-5 w-5" />}
      />
      <MetricCard
        title="Scientific Measurements"
        value={totalMeasurements}
        subtitle="Spread rates, heat fluxes & quench limits"
        accent="emerald"
        icon={<ShieldCheck className="h-5 w-5" />}
      />
      <MetricCard
        title="Research Publications"
        value={totalDocuments}
        subtitle="Peer-reviewed papers & technical reports"
        accent="flame"
        icon={<FileText className="h-5 w-5" />}
      />
    </div>
  );
};
