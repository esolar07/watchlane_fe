"use client";

import { useState, useEffect, useCallback } from "react";
import { getCoverageMetrics } from "@/services/api";
import { type CoverageMetrics } from "@/types/dashboard";

interface UseCoverageMetricsResult {
  data: CoverageMetrics[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCoverageMetrics(params: {
  startDate: string;
  endDate: string;
}): UseCoverageMetricsResult {
  const [data, setData] = useState<CoverageMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await getCoverageMetrics({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [params.startDate, params.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
