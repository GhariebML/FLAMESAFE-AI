import React from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-space-800 bg-space-900 p-10 sm:p-12 text-center shadow-panel">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft dark:bg-space-800 border border-space-800 text-brand-intelligent dark:text-brand-light-cyan">
        {icon || <SearchX className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-bold text-fg-primary">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-fg-muted leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
