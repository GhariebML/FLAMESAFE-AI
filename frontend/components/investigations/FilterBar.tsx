"use client";

import React from "react";
import { Search } from "lucide-react";
import { RESEARCH_DOMAINS } from "@/lib/constants/domains";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDomain: string;
  onDomainChange: (d: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDomain,
  onDomainChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-xl border border-space-800 bg-space-900/60 backdrop-blur-md">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by title, acronym, fuel, or NASA PSI ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-space-950/80 border border-space-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-flame-500/50"
        />
      </div>

      <div className="w-full sm:w-auto">
        <select
          value={selectedDomain}
          onChange={(e) => onDomainChange(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-lg bg-space-950/80 border border-space-800 text-xs text-slate-300 focus:outline-none focus:border-flame-500/50"
        >
          <option value="">All Research Areas</option>
          {RESEARCH_DOMAINS.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
