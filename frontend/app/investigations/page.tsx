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
import { ArrowRight, Sparkles } from "lucide-react";

const STORY_CATEGORY_PILLS = [
  { id: "All", label: "All", query: "" },
  { id: "Combustion", label: "Combustion", query: "combustion" },
  { id: "Safety", label: "Safety", query: "fire" },
  { id: "Materials", label: "Materials", query: "solid" },
  { id: "Smoke", label: "Smoke", query: "smoke" },
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
          DEDICATED STORYBOARD SHOWCASE: INVESTIGATION EXPLORER
      ===================================================================== */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#060E20] via-[#09152E] to-[#050A18] border-2 border-[#254B8C]/90 p-6 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Left 4 Columns: Realistic Astro-Flame Bot Explorer Showcase */}
          <div className="lg:col-span-4">
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#254B8C] bg-[#040914] shadow-2xl">
              <img
                src="/images/story/mascot-explorer.png"
                alt="Realistic Astro-Flame Bot NASA Investigation Explorer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040918]/90 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">
                  NASA PSI Catalog
                </span>
                <Badge variant="outline">Indexed: {total}</Badge>
              </div>
            </div>
          </div>

          {/* Right 8 Columns: Title, Story Pills & Featured Preview Strip */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#FF7A18]">
                  <Sparkles className="h-3.5 w-3.5 text-[#39B9EB]" />
                  NASA PHYSICAL SCIENCES INFORMATICS
                </span>
                <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Investigation Explorer
                </h1>
                <p className="text-sm text-[#B4C6E4] mt-1">
                  Dive into NASA&apos;s groundbreaking microgravity combustion experiments.
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

            {/* Storyboard Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold text-[#9BB0CD] mr-1">
                Filter by:
              </span>
              {STORY_CATEGORY_PILLS.map((pill) => {
                const active = activePill === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handlePillClick(pill)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      active
                        ? "bg-[#0088FF] text-white shadow-[0_0_16px_rgba(0,136,255,0.5)]"
                        : "bg-[#0A162E] text-[#9BB0CD] border border-[#1E3A6E] hover:text-white"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Advanced FilterBar inside Hero */}
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
          </div>
        </div>
      </section>

      {isUsingFallback && (
        <UncertaintyBanner
          variant="demo"
          title="Offline Demo Fallback Active"
          message={`Backend API unavailable (${error || "network failure"}). Showing local reference records; server-side filtering may be limited.`}
        />
      )}

      {/* Featured Investigations Cards Grid */}
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
        <Card className="p-0 overflow-x-auto border-[#1E3A6E]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E3A6E] bg-[#050C1D] text-[#9BB0CD]">
                <th className="p-3.5 font-semibold">Acronym / PSI ID</th>
                <th className="p-3.5 font-semibold">Investigation Title</th>
                <th className="p-3.5 font-semibold">Research Domain</th>
                <th className="p-3.5 font-semibold">Fuel Classes</th>
                <th className="p-3.5 font-semibold text-right">Runs / Docs</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A6E]/60">
              {investigations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#0A1836]/60">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="flame">{inv.acronym}</Badge>
                      <span className="font-mono text-[11px] text-[#9BB0CD]">{inv.psi_id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-white">{inv.title}</td>
                  <td className="p-3.5 text-[#39B9EB]">{inv.research_area}</td>
                  <td className="p-3.5 text-[#D6E4FF]">
                    {inv.primary_fuel_types?.length
                      ? inv.primary_fuel_types.join(", ")
                      : "Not recorded"}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#D6E4FF]">
                    {inv.experimental_runs_count} / {inv.documents_count}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/investigations/${inv.id}`}
                      className="inline-flex items-center gap-1 text-[#39B9EB] hover:text-white font-semibold"
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
