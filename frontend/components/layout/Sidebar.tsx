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
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigationItems = [
  { name: "Mission Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Investigation Explorer", href: "/investigations", icon: Search },
  { name: "Comparison Matrix", href: "/compare", icon: Scale },
  { name: "Scenario Analyzer", href: "/scenarios", icon: Compass },
  { name: "SI Assistant", href: "/assistant", icon: BotMessageSquare },
  { name: "Research Insights", href: "/insights", icon: Sparkles },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-space-800 bg-space-950/60 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 hidden md:flex">
      <div className="space-y-6">
        <div className="px-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          Core Modules
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-flame-500/15 text-flame-400 border border-flame-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-space-800/60"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-flame-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-space-800 bg-space-900/50 p-3 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-300">NASA PSI Open Data</div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Curated Physical Sciences Informatics combustion research.
        </p>
        <a
          href="https://psi.nasa.gov/physci/repo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-flame-400 hover:text-flame-300 transition-colors"
        >
          NASA PSI Repository <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </aside>
  );
};
