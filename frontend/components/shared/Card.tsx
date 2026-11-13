import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glow = false, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-space-800 bg-space-900/95 backdrop-blur-md p-5 text-fg-secondary shadow-panel transition-all",
        glow && "border-flame-500/35 shadow-lg shadow-flame-500/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
