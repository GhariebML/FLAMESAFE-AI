"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Activity, Cpu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const TOP_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Research Intelligence", href: "/research" },
  { label: "Investigations", href: "/investigations" },
  { label: "Comparison Lab", href: "/compare" },
  { label: "Insights", href: "/insights" },
  { label: "Scenarios", href: "/scenarios" },
  { label: "AI Assistant", href: "/assistant" },
  { label: "Evidence", href: "/evidence" },
];

export function Navbar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                FLAMESAFE <span className="text-orange-600 dark:text-orange-400">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Cpu className="w-2.5 h-2.5" />
                MULTI-AGENT v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Microgravity Combustion &amp; Fire Safety Intelligence
            </p>
          </div>
        </Link>

        {/* Quick Mobile / Tablet Horizontal Links */}
        <nav className="flex lg:hidden items-center gap-1 overflow-x-auto max-w-full py-1">
          {TOP_LINKS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Telemetry Pill + Dual Theme Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>PSI + 11-AGENT GRAPH ONLINE</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
