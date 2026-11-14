"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FlameSafe AI route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-lg w-full rounded-2xl border border-red-500/30 bg-[#10151D]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] space-y-5">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#F7F7F5]">
          Workspace Module Interrupted
        </h2>
        <p className="text-xs sm:text-sm text-[#A1A8B3] leading-relaxed">
          {error.message || "An unexpected client rendering error occurred. You can retry safely without losing persisted backend data."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B24] to-[#E94B16] text-white keep-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Module
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#283340] bg-[#151C26] text-[#F7F7F5] font-semibold text-xs sm:text-sm hover:border-[#39B9EB]/50 transition-colors"
          >
            <Home className="h-4 w-4 text-[#39B9EB]" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
