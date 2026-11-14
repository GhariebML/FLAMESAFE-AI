import React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "default"
  | "brand"
  | "blue"
  | "cyan"
  | "flame"
  | "plasma"
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default:
    "bg-brand-soft dark:bg-space-800 text-fg-secondary border-space-800 dark:border-space-700",
  brand:
    "bg-brand-blue/10 text-brand-blue dark:text-brand-light-cyan border-brand-blue/25 dark:border-brand-light-cyan/30",
  blue:
    "bg-blue-500/10 text-brand-intelligent dark:text-blue-300 border-blue-500/25",
  cyan:
    "bg-brand-cyan/10 text-sky-700 dark:text-brand-light-cyan border-brand-cyan/30",
  plasma:
    "bg-brand-cyan/10 text-sky-700 dark:text-brand-light-cyan border-brand-cyan/30",
  flame:
    "bg-brand-flame-orange/15 text-amber-800 dark:text-brand-flame-yellow border-brand-flame-orange/30",
  success:
    "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  warning:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  danger:
    "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  error:
    "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  outline:
    "bg-transparent text-fg-secondary border-space-800 dark:border-space-700",
};

const DOT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-fg-muted",
  brand: "bg-brand-intelligent",
  blue: "bg-brand-blue",
  cyan: "bg-brand-cyan",
  plasma: "bg-brand-cyan",
  flame: "bg-brand-flame-orange",
  success: "bg-brand-success",
  warning: "bg-brand-warning",
  danger: "bg-brand-error",
  error: "bg-brand-error",
  outline: "bg-fg-muted",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-tight",
        BADGE_STYLES[variant],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT_STYLES[variant])}
        />
      )}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<BadgeProps> = (props) => <Badge {...props} />;
