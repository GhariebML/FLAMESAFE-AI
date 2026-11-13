"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  FlaskConical,
  GitCompare,
  Lightbulb,
  ShieldAlert,
  Bot,
  BookOpenCheck,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Mission Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: "Overview",
  },
  {
    name: "Research Intelligence",
    href: "/research",
    icon: Cpu,
    badge: "11-Agent AI",
  },
  {
    name: "Investigations",
    href: "/investigations",
    icon: FlaskConical,
    badge: "NASA PSI",
  },
  {
    name: "Comparison Lab",
    href: "/compare",
    icon: GitCompare,
    badge: "Matrix",
  },
  {
    name: "Scientific Insights",
    href: "/insights",
    icon: Lightbulb,
    badge: "R-Score",
  },
  {
    name: "Scenario Analyzer",
    href: "/scenarios",
    icon: ShieldAlert,
    badge: "Risk",
  },
  {
    name: "AI Research Assistant",
    href: "/assistant",
    icon: Bot,
    badge: "RAG",
  },
  {
    name: "Evidence & Provenance",
    href: "/evidence",
    icon: BookOpenCheck,
    badge: "Verified",
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-68 lg:shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/75 backdrop-blur-xl min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
      <div className="space-y-6">
        <div className="px-3 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Scientific Modules
          </div>
        </div>

        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-orange-500/20 text-orange-700 dark:text-orange-300 font-semibold"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="rounded-xl p-3.5 bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              NASA PSI Data Vault
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              11 Campaigns
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            BASS, SAFFIRE, FLEX, SAME, ACME &amp; 6 PSI catalog campaigns with deterministic validation.
          </p>
          <a
            href="https://psi.nasa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline"
          >
            NASA PSI Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
