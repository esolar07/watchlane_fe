"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrgCoverageDetail } from "@/services/api";
import { type OrgCoverageDetail } from "@/types/dashboard";

interface UseOrgCoverageDetailResult {
  data: OrgCoverageDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrgCoverageDetail(params: {
  orgId: string;
  startDate: string;
  endDate: string;
}): UseOrgCoverageDetailResult {
  const [data, setData] = useState<OrgCoverageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params.orgId) return;
    setIsLoading(true);
    setError(null);
    try {
      const detail = await getOrgCoverageDetail({
        orgId: params.orgId,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      setData(detail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch coverage"
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.orgId, params.startDate, params.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
