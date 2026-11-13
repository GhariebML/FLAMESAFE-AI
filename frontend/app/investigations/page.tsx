"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useInvestigations } from "@/hooks/useInvestigations";
import { InvestigationCard } from "@/components/investigations/InvestigationCard";
import { FilterBar } from "@/components/investigations/FilterBar";
import {
  Tabs,
  UncertaintyBanner,
  LoadingSkeleton,
  EmptyState,
  Badge,
  Card,
} from "@/components/ui";
import { Search, ArrowRight } from "lucide-react";

function InvestigationsExplorerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("query") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get("query") || "");
  const [domain, setDomain] = useState(searchParams.get("research_area") || "");
  const [fuelType, setFuelType] = useState(searchParams.get("fuel_type") || "");
  const [gravityRegime, setGravityRegime] = useState(searchParams.get("gravity_regime") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "acronym");
  const [viewMode, setViewMode] = useState("cards");

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    investigations,
    total,
    isLoading,
    error,
    isUsingFallback,
    setFilters,
  } = useInvestigations({
    query: debouncedQuery || undefined,
    research_area: domain || undefined,
    fuel_type: fuelType || undefined,
    gravity_regime: gravityRegime || undefined,
    sort_by: sortBy || undefined,
  });

  // Sync filters to hook & URL search params
  useEffect(() => {
    setFilters({
      query: debouncedQuery || undefined,
      research_area: domain || undefined,
      fuel_type: fuelType || undefined,
      gravity_regime: gravityRegime || undefined,
      sort_by: sortBy || undefined,
    });

    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    if (domain) params.set("research_area", domain);
    if (fuelType) params.set("fuel_type", fuelType);
    if (gravityRegime) params.set("gravity_regime", gravityRegime);
    if (sortBy && sortBy !== "acronym") params.set("sort_by", sortBy);

    const qs = params.toString();
    router.replace(qs ? `/investigations?${qs}` : "/investigations", { scroll: false });
  }, [debouncedQuery, domain, fuelType, gravityRegime, sortBy, setFilters, router]);

  const hasActiveFilters = Boolean(
    searchInput || domain || fuelType || gravityRegime || sortBy !== "acronym"
  );

  const handleClearAll = () => {
    setSearchInput("");
    setDebouncedQuery("");
    setDomain("");
    setFuelType("");
    setGravityRegime("");
    setSortBy("acronym");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6 text-electric-400 shrink-0" />
            <span>NASA Investigation Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, and inspect canonical NASA microgravity combustion experiments with persisted query URLs.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Tabs
            activeTab={viewMode}
            onChange={setViewMode}
            tabs={[
              { id: "cards", label: "Cards" },
              { id: "table", label: "Table" },
            ]}
          />
          <Badge variant="outline">Indexed: {total}</Badge>
        </div>
      </div>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Offline Demo Fallback Active"
          message={`Backend API unavailable (${error || "network failure"}). Showing local reference records; server-side filtering may be limited.`}
        />
      )}

      <FilterBar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedDomain={domain}
        onDomainChange={setDomain}
        selectedFuel={fuelType}
        onFuelChange={setFuelType}
        selectedGravity={gravityRegime}
        onGravityChange={setGravityRegime}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearAll={handleClearAll}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64" />
        </div>
      ) : investigations.length === 0 ? (
        <EmptyState
          title="No investigations match your selected filters"
          description="Try resetting filters or broadening your search terms."
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investigations.map((inv) => (
            <InvestigationCard key={inv.id} investigation={inv} />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-x-auto border-space-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-space-800 bg-space-950/80 text-slate-400">
                <th className="p-3.5 font-semibold">Acronym / PSI ID</th>
                <th className="p-3.5 font-semibold">Investigation Title</th>
                <th className="p-3.5 font-semibold">Research Domain</th>
                <th className="p-3.5 font-semibold">Fuel Classes</th>
                <th className="p-3.5 font-semibold text-right">Runs / Docs</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {investigations.map((inv) => (
                <tr key={inv.id} className="hover:bg-space-900/60">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="flame">{inv.acronym}</Badge>
                      <span className="font-mono text-[11px] text-slate-400">{inv.psi_id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-100">{inv.title}</td>
                  <td className="p-3.5 text-plasma-400">{inv.research_area}</td>
                  <td className="p-3.5 text-slate-300">
                    {inv.primary_fuel_types?.length
                      ? inv.primary_fuel_types.join(", ")
                      : "Not recorded"}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-300">
                    {inv.experimental_runs_count} / {inv.documents_count}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/investigations/${inv.id}`}
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Inspect <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default function InvestigationsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton className="h-96 max-w-7xl mx-auto" />}>
      <InvestigationsExplorerInner />
    </Suspense>
  );
}
