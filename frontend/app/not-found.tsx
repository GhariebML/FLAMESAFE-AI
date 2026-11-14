import Link from "next/link";
import { Compass, FlaskConical, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-lg w-full rounded-2xl border border-[#283340] bg-[#10151D]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] space-y-5">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B24]/15 border border-[#FF6B24]/40 text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B24]">
          Telemetry Signal Lost · 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F7F5] tracking-tight">
          Research Sector Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A8B3] leading-relaxed">
          The requested FlameSafe AI route or NASA PSI dataset address does not exist or has been relocated.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B24] to-[#E94B16] text-white keep-white font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#283340] bg-[#151C26] text-[#F7F7F5] font-semibold text-xs sm:text-sm hover:border-[#39B9EB]/50 transition-colors"
          >
            <Compass className="h-4 w-4 text-[#39B9EB]" />
            Mission Control
          </Link>
          <Link
            href="/investigations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#283340] bg-[#151C26] text-[#F7F7F5] font-semibold text-xs sm:text-sm hover:border-[#FF6B24]/50 transition-colors"
          >
            <FlaskConical className="h-4 w-4 text-[#FF6B24]" />
            PSI Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
