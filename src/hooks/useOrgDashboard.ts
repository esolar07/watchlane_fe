"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrgDashboard } from "@/services/api";
import type { OrgDashboard } from "@/types/dashboard";

interface UseOrgDashboardArgs {
  orgId: string;
  startDate: string;
  endDate: string;
}

interface UseOrgDashboardResult {
  data: OrgDashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrgDashboard({
  orgId,
  startDate,
  endDate,
}: UseOrgDashboardArgs): UseOrgDashboardResult {
  const [data, setData] = useState<OrgDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    try {
      setData(await getOrgDashboard({ orgId, startDate, endDate }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch org dashboard",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
