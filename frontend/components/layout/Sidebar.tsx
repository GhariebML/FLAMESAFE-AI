"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  FlaskConical,
  Scale,
  Lightbulb,
  ShieldAlert,
  MessageSquareCode,
  FileCheck2,
  X,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface NavGroup {
  heading: string;
  items: {
    name: string;
    href: string;
    icon: React.FC<{ className?: string }>;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Intelligence Core",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Research Workspace", href: "/research", icon: Cpu },
      { name: "AI Assistant", href: "/assistant", icon: MessageSquareCode },
    ],
  },
  {
    heading: "NASA PSI Repository",
    items: [
      { name: "Investigations", href: "/investigations", icon: FlaskConical },
      { name: "Compare Studies", href: "/compare", icon: Scale },
      { name: "Evidence Library", href: "/evidence", icon: FileCheck2 },
    ],
  },
  {
    heading: "Safety Analytics",
    items: [
      { name: "Insights & Gaps", href: "/insights", icon: Lightbulb },
      { name: "Scenario Simulator", href: "/scenarios", icon: ShieldAlert },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  showDesktop?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  showDesktop = true,
}) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const renderNavLinks = (closeOnSelect: boolean) => (
    <div className="space-y-6 flex-1">
      {NAV_GROUPS.map((group) => (
        <div key={group.heading} className="space-y-1.5">
          <div className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-muted">
            {group.heading}
          </div>
          <nav aria-label={group.heading} className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (closeOnSelect && onClose) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all border",
                    isActive
                      ? "bg-[#102246] text-white keep-white border-[#39B9EB]/45 font-semibold shadow-[0_0_16px_rgba(57,185,235,0.18)]"
                      : "border-transparent text-[#A1A8B3] hover:bg-[#0B1730] hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-[#FF7A18]" : "text-[#39B9EB]"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  const renderBottomStatus = () => (
    <Link
      href="/assistant"
      className="mt-6 rounded-2xl border border-[#1E3A6E] bg-gradient-to-br from-[#08152E] to-[#050C1C] p-3.5 text-xs flex items-center gap-3 hover:border-[#39B9EB]/60 transition-all"
    >
      <img
        src="/images/story/mascot-avatar.webp"
        alt="Astro-Flame Bot"
        className="h-11 w-11 rounded-xl border border-[#39B9EB]/50 object-cover shrink-0"
      />
      <div className="min-w-0">
        <div className="font-bold text-white keep-white flex items-center gap-1.5">
          <span>Astro-Flame AI</span>
          <span className="h-2 w-2 rounded-full bg-[#39B9EB] animate-pulse" />
        </div>
        <p className="text-[11px] text-[#A1A8B3] truncate">
          Ask about 0g fire safety
        </p>
      </div>
    </Link>
  );

  return (
    <>
      {/* Desktop Workspace Sidebar */}
      {showDesktop && (
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#1E3A6E]/70 bg-[#050914]/90 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 sm:p-5">
          {renderNavLinks(false)}
          {renderBottomStatus()}
        </aside>
      )}

      {/* Accessible Mobile & Tablet Slide-Out Navigation Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
        >
          <div
            className="fixed inset-0 bg-brand-navy/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white dark:bg-space-950 border-r border-space-800 p-4 flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-space-800">
              <BrandLogo size="sm" href="/" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="h-8 w-8 rounded-lg border border-space-800 flex items-center justify-center text-fg-muted hover:text-fg-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {renderNavLinks(true)}
            {renderBottomStatus()}
          </div>
        </div>
      )}
    </>
  );
};

export const SidebarNavigation = Sidebar;
