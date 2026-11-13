"use client";

import { useEffect, useState, useCallback } from "react";
import { InvestigationSummary, InvestigationFilterParams } from "@/types/investigation";
import { apiClient } from "@/lib/api/client";
import { FALLBACK_INVESTIGATIONS } from "@/lib/constants/mockData";

export function useInvestigations(initialFilters: InvestigationFilterParams = {}) {
  const [investigations, setInvestigations] = useState<InvestigationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvestigationFilterParams>(initialFilters);

  const fetchInvestigations = useCallback(async (currentFilters: InvestigationFilterParams) => {
    setIsLoading(true);
    try {
      const res = await apiClient.getInvestigations(currentFilters);
      setInvestigations(res.items);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      console.warn("Using fallback local data due to API connectivity:", err.message);
      // Graceful fallback to mock data if API is temporarily unavailable
      setInvestigations(FALLBACK_INVESTIGATIONS);
      setTotal(FALLBACK_INVESTIGATIONS.length);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestigations(filters);
  }, [filters, fetchInvestigations]);

  return {
    investigations,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: () => fetchInvestigations(filters),
  };
}
