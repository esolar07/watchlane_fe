"use client";

import { useCallback, useEffect, useState } from "react";
import { getAggregateDashboard } from "@/services/api";
import type { AggregateDashboard } from "@/types/dashboard";

interface UseAggregateDashboardArgs {
  startDate: string;
  endDate: string;
}

interface UseAggregateDashboardResult {
  data: AggregateDashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAggregateDashboard({
  startDate,
  endDate,
}: UseAggregateDashboardArgs): UseAggregateDashboardResult {
  const [data, setData] = useState<AggregateDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getAggregateDashboard({ startDate, endDate }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch aggregate",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
