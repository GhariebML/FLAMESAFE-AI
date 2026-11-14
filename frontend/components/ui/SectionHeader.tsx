import React from "react";
import { StatusBadge, type BadgeVariant } from "@/components/shared/Badge";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  badgeText,
  badgeVariant = "brand",
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 ${className}`}
    >
      <div className="space-y-1">
        {(eyebrow || badgeText) && (
          <div className="flex flex-wrap items-center gap-2">
            {badgeText && <StatusBadge variant={badgeVariant}>{badgeText}</StatusBadge>}
            {eyebrow && (
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue dark:text-brand-light-cyan">
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-brand-navy dark:text-fg-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
