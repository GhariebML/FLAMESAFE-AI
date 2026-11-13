import React from "react";
import { AlertCircle } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No scientific records found",
  description = "Try adjusting your search query, filter criteria, or environmental parameters.",
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-space-800 bg-space-950/40">
      <div className="h-12 w-12 rounded-full bg-space-900 border border-space-800 flex items-center justify-center text-slate-400 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
