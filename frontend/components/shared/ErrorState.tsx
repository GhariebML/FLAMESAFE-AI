import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { SecondaryButton } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Unable to Retrieve Scientific Data",
  message,
  onRetry,
  retryLabel = "Retry Request",
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-brand-error/30 bg-red-500/5 p-6 sm:p-8 flex flex-col items-center text-center shadow-panel ${className}`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 border border-brand-error/25 text-brand-error">
        <AlertOctagon className="h-5 w-5" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-fg-primary">{title}</h3>
      <p className="mt-1.5 max-w-lg text-xs sm:text-sm text-fg-muted leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <SecondaryButton size="sm" onClick={onRetry} className="mt-4">
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </SecondaryButton>
      )}
    </div>
  );
};
