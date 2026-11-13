import React from "react";
import { cn } from "@/lib/utils/cn";

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-space-800/80 border border-space-700/50",
        className
      )}
    />
  );
};
