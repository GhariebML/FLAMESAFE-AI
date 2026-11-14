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
import { ArrowRight, FlaskConical } from "lucide-react";

const STORY_CATEGORY_PILLS = [
  { id: "All", label: "All Campaigns", query: "" },
  { id: "Combustion", label: "Combustion", query: "combustion" },
  { id: "Safety", label: "Fire Safety", query: "fire" },
  { id: "Materials", label: "Solid Materials", query: "solid" },
  { id: "Smoke", label: "Smoke & Aerosols", query: "smoke" },
] as const;

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
  const [activePill, setActivePill] = useState<string>("All");

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
    setActivePill("All");
    setSearchInput("");
    setDebouncedQuery("");
    setDomain("");
    setFuelType("");
    setGravityRegime("");
    setSortBy("acronym");
  };

  const handlePillClick = (pill: (typeof STORY_CATEGORY_PILLS)[number]) => {
    setActivePill(pill.id);
    setSearchInput(pill.query);
    setDebouncedQuery(pill.query);
  };

  return (
    <div className="w-full max-w-[88rem] mx-auto space-y-7 min-w-0 pb-10">
      {/* =====================================================================
          PHASE 7.3 — INVESTIGATION EXPLORER HEADER (NO REPEATED MASCOT BOX)
      ===================================================================== */}
      <section className="relative rounded-2xl bg-[#10151D] border border-[#283340] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B24]">
              <FlaskConical className="h-3.5 w-3.5 text-[#39B9EB]" />
              NASA PHYSICAL SCIENCES INFORMATICS (PSI) · {total} INDEXED CAMPAIGNS
            </span>
            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#F7F7F5] tracking-tight">
              Investigation Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A8B3] mt-1 max-w-2xl">
              Search and filter orbital microgravity combustion programs by research
              domain, fuel class, gravity regime, and verified DOI records.
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
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#778495] mr-1">
            Quick Domain Filter:
          </span>
          {STORY_CATEGORY_PILLS.map((pill) => {
            const active = activePill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#FF6B24] text-white keep-white shadow-[0_0_16px_rgba(255,107,36,0.35)]"
                    : "bg-[#151D27] text-[#A1A8B3] border border-[#283340] hover:text-[#F7F7F5]"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Advanced FilterBar */}
        <FilterBar
          searchQuery={searchInput}
          onSearchChange={(val) => {
            setActivePill("All");
            setSearchInput(val);
          }}
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
      </section>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Offline Demo Fallback Active"
          message={`Backend API unavailable (${error || "network failure"}). Showing local reference records; server-side filtering may be limited.`}
        />
      )}

      {/* Investigations Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-72" />
        </div>
      ) : investigations.length === 0 ? (
        <EmptyState
          title="No investigations match your selected filters"
          description="Try resetting filters or broadening your search terms."
        />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investigations.map((inv) => (
            <InvestigationCard key={inv.id} investigation={inv} />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-x-auto border-[#283340] bg-[#10151D]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#283340] bg-[#151D27] text-[#A1A8B3]">
                <th className="p-3.5 font-semibold">Acronym / PSI ID</th>
                <th className="p-3.5 font-semibold">Investigation Title</th>
                <th className="p-3.5 font-semibold">Research Domain</th>
                <th className="p-3.5 font-semibold">Fuel Classes</th>
                <th className="p-3.5 font-semibold text-right">Runs / Docs</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283340]">
              {investigations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#151D27]/70">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="flame">{inv.acronym}</Badge>
                      <span className="font-mono text-[11px] text-[#778495]">{inv.psi_id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-[#F7F7F5]">{inv.title}</td>
                  <td className="p-3.5 text-[#39B9EB]">{inv.research_area}</td>
                  <td className="p-3.5 text-[#A1A8B3]">
                    {inv.primary_fuel_types?.length
                      ? inv.primary_fuel_types.join(", ")
                      : "Not recorded"}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#F7F7F5]">
                    {inv.experimental_runs_count} / {inv.documents_count}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/investigations/${inv.id}`}
                      className="inline-flex items-center gap-1 text-[#39B9EB] hover:text-[#F7F7F5] font-semibold"
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
