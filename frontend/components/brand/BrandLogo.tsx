import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "hero";
  href?: string;
  className?: string;
  surface?: "light" | "auto";
}

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-12 w-auto",
  hero: "h-16 sm:h-20 w-auto",
};

/**
 * Official FlameSafe AI Horizontal Brand Lockup.
 * Preserves original aspect ratio (974x300) and white-background presentation.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  href = "/",
  className,
  surface = "auto",
}) => {
  const imageNode = (
    <span
      className={cn(
        "inline-flex items-center shrink-0 rounded-xl transition-colors",
        surface === "light"
          ? "bg-white px-2.5 py-1"
          : "bg-white px-2 py-1 dark:px-2.5 dark:py-1 dark:shadow-sm dark:ring-1 dark:ring-white/20",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/flamesafe-logo.png"
        alt="FlameSafe AI — Microgravity Combustion Intelligence"
        width={974}
        height={300}
        className={cn(
          "object-contain select-none shrink-0",
          SIZE_CLASSES[size]
        )}
      />
    </span>
  );

  if (!href) {
    return imageNode;
  }

  return (
    <Link
      href={href}
      aria-label="FlameSafe AI Home"
      className="inline-flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-intelligent shrink-0"
    >
      {imageNode}
    </Link>
  );
};

export interface BrandIconProps {
  size?: number;
  className?: string;
  framed?: boolean;
}

/**
 * Official FlameSafe AI Emblem Icon (cropped strictly from the official logo emblem).
 */
export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 32,
  className,
  framed = true,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 overflow-hidden",
        framed && "bg-white rounded-xl p-1 border border-brand-border shadow-sm",
        className
      )}
      style={{ width: framed ? size + 8 : size, height: framed ? size + 8 : size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/brand-assets/flamesafe-emblem.png"
        alt="FlameSafe AI Emblem"
        width={512}
        height={512}
        className="w-full h-full object-contain select-none"
      />
    </span>
  );
};
