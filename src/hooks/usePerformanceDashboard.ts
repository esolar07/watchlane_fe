"use client";

import { useCallback, useEffect, useState } from "react";
import { getPerformanceDashboard } from "@/services/api";
import type { PerformanceDashboard } from "@/types/dashboard";

interface UsePerformanceDashboardArgs {
  orgId: string;
  startDate: string;
  endDate: string;
  repId?: string;
}

interface UsePerformanceDashboardResult {
  data: PerformanceDashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePerformanceDashboard(
  args: UsePerformanceDashboardArgs,
): UsePerformanceDashboardResult {
  const [data, setData] = useState<PerformanceDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { orgId, startDate, endDate, repId } = args;

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    try {
      setData(
        await getPerformanceDashboard({ orgId, startDate, endDate, repId }),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch performance dashboard",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, startDate, endDate, repId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
