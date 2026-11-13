import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "flame" | "plasma" | "outline" | "success" | "warning" | "danger";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-space-800 text-fg-secondary border-space-700",
    flame: "bg-flame-500/15 text-orange-700 dark:text-flame-400 border-flame-500/35",
    plasma: "bg-plasma-500/15 text-cyan-800 dark:text-plasma-400 border-plasma-500/35",
    outline: "bg-transparent text-fg-secondary border-space-700",
    success: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/35",
    warning: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/35",
    danger: "bg-red-500/15 text-red-800 dark:text-red-400 border-red-500/35",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
