"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Activity, Github, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { apiClient } from "@/lib/api/client";

export const Navbar: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getHealth()
      .then(() => {
        if (isMounted) setBackendStatus("online");
      })
      .catch(() => {
        if (isMounted) setBackendStatus("offline");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-space-800 bg-space-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-flame-600/20 border border-flame-500/40 flex items-center justify-center text-flame-500 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                FlameSafe <span className="text-flame-500">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-1">
                NASA Space Apps 2026 · Team R²
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-space-800">
            <Badge variant="plasma" className="text-[11px] gap-1">
              <ShieldAlert className="h-3 w-3" /> Microgravity Combustion Intelligence
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-space-800 bg-space-900/60 text-xs text-slate-300">
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
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
};
