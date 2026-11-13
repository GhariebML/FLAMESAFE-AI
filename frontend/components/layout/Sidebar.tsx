"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Scale,
  Compass,
  BotMessageSquare,
  Sparkles,
  BookOpenCheck,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigationGroups = [
  {
    label: "Research Core",
    items: [
      { name: "Mission Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Investigation Explorer", href: "/investigations", icon: Search },
      { name: "Evidence Center", href: "/evidence", icon: BookOpenCheck },
    ],
  },
  {
    label: "Analytical Labs",
    items: [
      { name: "Comparison Lab", href: "/compare", icon: Scale },
      { name: "Scientific Insights", href: "/insights", icon: Sparkles },
      { name: "Mission Scenarios", href: "/scenarios", icon: Compass },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      { name: "SI Research Assistant", href: "/assistant", icon: BotMessageSquare },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              {group.label}
            </div>
            <nav aria-label={group.label} className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/35 font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-space-800/70"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-plasma-400" : "text-slate-500"
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

      <div className="rounded-xl border border-space-800 bg-space-900/70 p-3.5 text-xs text-slate-400 space-y-2 mt-6">
        <div className="font-semibold text-slate-200 flex items-center justify-between">
          <span>NASA PSI Open Data</span>
          <span className="text-[10px] font-mono text-plasma-400">v0.1.0</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Curated Physical Sciences Informatics microgravity combustion archive. Independent hackathon project.
        </p>
        <a
          href="https://psi.nasa.gov/physci/repo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-plasma-400 hover:text-plasma-300 transition-colors"
        >
          NASA PSI Repository <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Persistent Desktop Sidebar */}
      <aside className="w-64 border-r border-space-800 bg-space-950/90 backdrop-blur-xl flex-col justify-between p-4 shrink-0 hidden md:flex">
        {navContent}
      </aside>

      {/* Responsive Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-space-950 border-r border-space-800 p-4 flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-space-800">
              <span className="text-sm font-bold text-white tracking-tight">
                FlameSafe <span className="text-flame-500">AI</span> Navigation
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-space-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
