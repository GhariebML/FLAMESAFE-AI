import React from "react";
import { Badge } from "@/components/shared/Badge";
import { ShieldCheck } from "lucide-react";

export const ProvenanceBadge: React.FC<{
  sourceName: string;
  doi?: string | null;
}> = ({ sourceName, doi }) => {
  return (
    <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-lg bg-space-900 border border-space-800 text-xs">
      <ShieldCheck className="h-4 w-4 text-emerald-400" />
      <span className="text-slate-300 font-medium">{sourceName}</span>
      {doi && (
        <Badge variant="outline" className="font-mono text-[10px]">
          {doi}
        </Badge>
      )}
    </div>
  );
};
