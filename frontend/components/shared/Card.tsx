import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glow = false, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-space-800 bg-space-900/90 backdrop-blur-md p-5 text-slate-200 transition-all",
        glow && "border-flame-500/30 shadow-lg shadow-flame-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
