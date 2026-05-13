"use client";

import { useCallback, useEffect, useState } from "react";
import { getTeamDashboard } from "@/services/api";
import type { TeamDashboard } from "@/types/dashboard";

interface UseTeamDashboardArgs {
  teamId: string;
  startDate: string;
  endDate: string;
}

interface UseTeamDashboardResult {
  data: TeamDashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTeamDashboard({
  teamId,
  startDate,
  endDate,
}: UseTeamDashboardArgs): UseTeamDashboardResult {
  const [data, setData] = useState<TeamDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!teamId) return;
    setIsLoading(true);
    setError(null);
    try {
      setData(await getTeamDashboard({ teamId, startDate, endDate }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch team dashboard",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
