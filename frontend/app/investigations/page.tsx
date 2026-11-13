"use client";

import React, { useState } from "react";
import { useInvestigations } from "@/hooks/useInvestigations";
import { InvestigationCard } from "@/components/investigations/InvestigationCard";
import { FilterBar } from "@/components/investigations/FilterBar";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/shared/Badge";
import { Search } from "lucide-react";

export default function InvestigationsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");

  const { investigations, total, isLoading, error } = useInvestigations({
    query: search || undefined,
    research_area: domain || undefined,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6 text-flame-400" />
            NASA Investigation Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover, filter, and inspect canonical NASA microgravity combustion flight investigations.
          </p>
        </div>
        <Badge variant="outline">Total Indexed: {total}</Badge>
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        selectedDomain={domain}
        onDomainChange={setDomain}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton className="h-60" />
          <LoadingSkeleton className="h-60" />
          <LoadingSkeleton className="h-60" />
        </div>
      ) : investigations.length === 0 ? (
        <EmptyState
          title="No investigations match criteria"
          description="Try clearing your search filters or selecting 'All Research Areas'."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investigations.map((inv) => (
            <InvestigationCard key={inv.id} investigation={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
