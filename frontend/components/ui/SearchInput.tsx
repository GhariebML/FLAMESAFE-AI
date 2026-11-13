"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search investigations, fuels, DOIs, or parameters...",
  ariaLabel = "Search scientific records",
  className = "",
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="h-4 w-4 text-fg-muted absolute left-3.5 pointer-events-none" />
      <input
        id="scientific-search-input"
        name="search"
        type="search"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-space-950 border border-space-800 text-xs sm:text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-blue-500 transition-colors"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search query"
          onClick={() => onChange("")}
          className="absolute right-2.5 p-1 rounded-md text-fg-muted hover:text-fg-primary hover:bg-space-800 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
