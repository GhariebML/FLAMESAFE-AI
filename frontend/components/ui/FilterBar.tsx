"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { SecondaryButton } from "@/components/shared/Button";

export interface FilterSelectOption {
  label: string;
  value: string;
}

export interface FilterSelectConfig {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  selects?: FilterSelectConfig[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search datasets, investigations, DOIs...",
  selects = [],
  onReset,
  hasActiveFilters = false,
  rightSlot,
  className = "",
}) => {
  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border border-space-800 bg-space-900 shadow-panel space-y-3 ${className}`}
    >
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full lg:flex-1"
        />

        <div className="flex flex-wrap items-center gap-2">
          {selects.map((sel) => (
            <select
              key={sel.id}
              aria-label={sel.label}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="w-full sm:w-auto min-w-[10.5rem] px-3 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs font-medium text-fg-primary focus:outline-none focus:border-brand-intelligent transition-colors"
            >
              {sel.placeholder && <option value="">{sel.placeholder}</option>}
              {sel.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {rightSlot}

          {hasActiveFilters && onReset && (
            <SecondaryButton size="sm" onClick={onReset} className="whitespace-nowrap">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </SecondaryButton>
          )}
        </div>
      </div>
    </div>
  );
};
