import React from "react";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";

interface DomainItem {
  domain: string;
  investigations_count: number;
  runs_count: number;
}

export const DomainDistribution: React.FC<{ items: DomainItem[] }> = ({ items }) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Combustion Research Domains</h3>
        <Badge variant="plasma">NASA PSI Coverage</Badge>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500 py-4">No domains indexed yet.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.domain}
              className="flex items-center justify-between p-3 rounded-lg bg-space-950/50 border border-space-800"
            >
              <div>
                <div className="text-sm font-medium text-slate-200">{item.domain}</div>
                <div className="text-[11px] text-slate-500">
                  {item.runs_count} documented experimental runs
                </div>
              </div>
              <Badge variant="outline">{item.investigations_count} programs</Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
