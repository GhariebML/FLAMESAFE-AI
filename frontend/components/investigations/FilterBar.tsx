"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/shared/Button";
import {
  RESEARCH_DOMAINS,
  FUEL_CATEGORIES,
  GRAVITY_REGIMES,
} from "@/lib/constants/domains";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDomain: string;
  onDomainChange: (d: string) => void;
  selectedFuel: string;
  onFuelChange: (f: string) => void;
  selectedGravity: string;
  onGravityChange: (g: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  selectedFuel,
  onFuelChange,
  selectedGravity,
  onGravityChange,
  sortBy,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}) => {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-space-800 bg-space-900/80 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search title, acronym, PSI ID, objectives, or fuel..."
          className="w-full lg:flex-1"
        />

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            aria-label="Filter by research area"
            value={selectedDomain}
            onChange={(e) => onDomainChange(e.target.value)}
            className="w-full sm:w-52 px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Research Domains</option>
            {RESEARCH_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by fuel category"
            value={selectedFuel}
            onChange={(e) => onFuelChange(e.target.value)}
            className="w-full sm:w-44 px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Fuel Categories</option>
            {FUEL_CATEGORIES.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by gravity regime"
            value={selectedGravity}
            onChange={(e) => onGravityChange(e.target.value)}
            className="w-full sm:w-40 px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Gravity Regimes</option>
            {GRAVITY_REGIMES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort investigations"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full sm:w-36 px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="acronym">Sort: Acronym</option>
            <option value="title">Sort: Title</option>
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
