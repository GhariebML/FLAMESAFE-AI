import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#252D38] bg-[#080A0F]/95 backdrop-blur-md py-8 px-4 sm:px-6 text-xs text-[#A1A8B3]">
      <div className="max-w-[84rem] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <BrandLogo size="sm" href="/" surface="light" />
          <p className="text-[11px] sm:text-xs text-[#A1A8B3] max-w-xl leading-relaxed">
            Built by <span className="font-semibold text-[#F7F7F5] keep-white">Team R²</span> for the{" "}
            <span className="font-semibold text-[#FF6B24]">
              2026 NASA Space Apps Challenge — Cairo
            </span>
            . Grounded exclusively in NASA Physical Sciences Informatics (PSI) microgravity combustion datasets and peer-reviewed provenance.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex flex-wrap items-center gap-4 font-medium text-[#A1A8B3]">
            <Link href="/dashboard" className="hover:text-[#F7F7F5] transition-colors">
              Dashboard
            </Link>
            <Link href="/research" className="hover:text-[#F7F7F5] transition-colors">
              Research Workspace
            </Link>
            <Link href="/investigations" className="hover:text-[#F7F7F5] transition-colors">
              NASA PSI Catalog
            </Link>
            <Link href="/evidence" className="hover:text-[#F7F7F5] transition-colors">
              Evidence Library
            </Link>
            <Link href="/scenarios" className="hover:text-[#F7F7F5] transition-colors">
              Research Gaps
            </Link>
          </div>
          <p className="text-[11px] text-[#A1A8B3]">
            Independent scientific research project — no official NASA endorsement, certification, or partnership implied.
          </p>
        </div>
      </div>
    </footer>
  );
};
