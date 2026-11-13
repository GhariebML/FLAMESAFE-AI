"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export function useOverview() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiClient
      .getOverview()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setError(null);
          setIsUsingFallback(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load overview data.");
          setIsUsingFallback(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error, isUsingFallback };
}
