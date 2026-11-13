import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glow = false, children, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-space-800/90 bg-space-900/90 backdrop-blur-xl p-5 text-fg-secondary shadow-panel transition-all duration-200 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-400/40 before:to-transparent",
        glow && "border-flame-500/40 shadow-lg shadow-flame-500/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
