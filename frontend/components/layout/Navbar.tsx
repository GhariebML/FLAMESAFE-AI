"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, Github, Menu, Search, Cpu } from "lucide-react";
import { apiClient } from "@/lib/api/client";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Mission Hub",
  "/dashboard": "Mission Overview",
  "/investigations": "Investigation Explorer",
  "/compare": "Comparison Lab",
  "/insights": "Scientific Insights",
  "/scenarios": "Mission Scenarios",
  "/assistant": "SI Research Assistant",
  "/evidence": "Evidence & Sources Center",
};

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [aiProvider, setAiProvider] = useState<string>("mock");
  const [quickQuery, setQuickQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getHealth()
      .then((res) => {
        if (isMounted) {
          setBackendStatus("online");
          if (res?.ai_provider) setAiProvider(res.ai_provider);
        }
      })
      .catch(() => {
        if (isMounted) setBackendStatus("offline");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentTitle =
    ROUTE_TITLES[pathname || "/"] ||
    (pathname?.startsWith("/investigations/") ? "Investigation Profile" : "Mission Control");

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    if (!trimmed) return;
    router.push(`/investigations?query=${encodeURIComponent(trimmed)}`);
    setQuickQuery("");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-space-800 bg-space-950/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-6">
        {/* Left: Mobile Drawer Toggle + Brand + Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-space-800 md:hidden shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="h-9 w-9 rounded-lg bg-flame-600/20 border border-flame-500/40 flex items-center justify-center text-flame-500 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1">
                FlameSafe <span className="text-flame-500">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-0.5">
                Space Apps 2026 · Team R²
              </span>
            </div>
          </Link>

          {/* Dynamic Module Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-space-800 text-xs">
            <span className="text-slate-500">Module</span>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-slate-200 truncate">{currentTitle}</span>
          </div>
        </div>

        {/* Center: Global Quick Search (Desktop) */}
        <form
          onSubmit={handleQuickSearch}
          className="hidden md:flex items-center relative w-64 lg:w-80"
        >
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="search"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Quick search investigations (e.g., PMMA)..."
            aria-label="Global investigation search"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-space-900 border border-space-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </form>

        {/* Right: Telemetry Status + AI Mode + GitHub */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-space-800 bg-space-900/80 text-[11px] text-slate-300 font-mono"
            title="Active AI / RAG Synthesis Provider"
          >
            <Cpu className="h-3 w-3 text-plasma-400" />
            <span>{aiProvider === "mock" ? "AI: Mock Mode" : `AI: ${aiProvider}`}</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-space-800 bg-space-900/80 text-[11px] text-slate-300 font-mono"
            title="Backend API Health"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendStatus === "online"
                  ? "bg-emerald-400 animate-pulse"
                  : backendStatus === "checking"
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
            />
            <span className="hidden sm:inline">API:</span>
            <span className="capitalize">{backendStatus}</span>
          </div>

          <a
            href="https://github.com/GhariebML/FLAMESAFE-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
            title="GitHub Repository"
          >
            <Github className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>
        </div>
      </div>
    </header>
  );
};
