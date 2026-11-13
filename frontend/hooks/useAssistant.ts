"use client";

import { useState } from "react";
import { AssistantQueryRequest, AssistantQueryResponse } from "@/types/assistant";
import { apiClient } from "@/lib/api/client";

export function useAssistant() {
  const [response, setResponse] = useState<AssistantQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = async (payload: AssistantQueryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.queryAssistant(payload);
      setResponse(res);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to process research query.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { response, isLoading, error, query };
}
