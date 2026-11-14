import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge, type BadgeVariant } from "@/components/shared/Badge";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  mascotSrc?: string;
  className?: string;
}

function resolveMascotForTitle(title: string, custom?: string): string {
  if (custom) return custom;
  const lower = title.toLowerCase();
  if (lower.includes("agent") || lower.includes("research") || lower.includes("assistant")) {
    return "/images/story/mascot-agents.png";
  }
  if (lower.includes("scenario") || lower.includes("oxygen") || lower.includes("insight") || lower.includes("safety")) {
    return "/images/story/mascot-shield.png";
  }
  if (lower.includes("compare") || lower.includes("observatory")) {
    return "/images/story/mascot-window.png";
  }
  if (lower.includes("evidence") || lower.includes("mission") || lower.includes("overview")) {
    return "/images/story/mascot-journey.png";
  }
  return "/images/story/mascot-explorer.png";
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  badgeText,
  badgeVariant = "brand",
  breadcrumbs,
  actions,
  mascotSrc,
  className = "",
}) => {
  const resolvedMascot = resolveMascotForTitle(title, mascotSrc);

  return (
    <header
      className={`relative overflow-hidden rounded-3xl border border-[#254B8C]/90 bg-[#050C1D] p-6 sm:p-7 mb-7 shadow-[0_18px_50px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(57,185,235,0.28)] ${className}`}
    >
      {/* Ultra-HD Mascot Scene Backdrop on Right Side */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[55%] lg:w-[48%] overflow-hidden">
        <img
          src={resolvedMascot}
          alt="Astro-Flame Bot Scene"
          className="h-full w-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050C1D] via-[#050C1D]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050C1D]/85 via-transparent to-[#050C1D]/30" />
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="relative z-10 flex flex-wrap items-center gap-1.5 text-xs text-[#9EB2D0] mb-3"
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#9EB2D0]/70" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#39B9EB] transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white keep-white font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0 max-w-2xl">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-[#39B9EB]/65 bg-[#050B18] overflow-hidden shrink-0 shadow-[0_0_24px_rgba(57,185,235,0.35)]">
            <img
              src="/images/story/mascot-avatar.png"
              alt="Astro-Flame Bot"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            {(eyebrow || badgeText) && (
              <div className="flex flex-wrap items-center gap-2">
                {badgeText && (
                  <StatusBadge variant={badgeVariant} dot>
                    {badgeText}
                  </StatusBadge>
                )}
                {eyebrow && (
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#FF7A18]">
                    {eyebrow}
                  </span>
                )}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white keep-white drop-shadow">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-[#D6E4FF] leading-relaxed max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
};
