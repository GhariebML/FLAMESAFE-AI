"use client";

import { useState } from "react";
import { ComparisonRequest, ComparisonResponse } from "@/types/comparison";
import { apiClient } from "@/lib/api/client";

export function useCompare() {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCompare = async (payload: ComparisonRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.compareInvestigations(payload);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to generate investigation comparison.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, executeCompare };
}
