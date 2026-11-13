"use client";

import { useState } from "react";
import { ScenarioRequest, ScenarioAnalysisResponse } from "@/types/scenario";
import { apiClient } from "@/lib/api/client";

export function useScenario() {
  const [data, setData] = useState<ScenarioAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (payload: ScenarioRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.analyzeScenario(payload);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to analyze mission scenario.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, analyze };
}
