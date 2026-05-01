"use client";

import { useCallback, useEffect, useState } from "react";
import { getOperationalDashboard } from "@/services/api";
import type { OperationalDashboard } from "@/types/dashboard";

export interface OperationalEntry {
  orgId: string;
  orgName: string;
  data: OperationalDashboard | null;
  error: string | null;
}

interface OrgRef {
  id: string;
  name: string;
}

interface Result {
  entries: OperationalEntry[];
  isLoading: boolean;
  refetch: () => void;
}

async function fetchOperationalEntry(org: OrgRef): Promise<OperationalEntry> {
  try {
    const data = await getOperationalDashboard({ orgId: org.id });
    return { orgId: org.id, orgName: org.name, data, error: null };
  } catch (err) {
    return {
      orgId: org.id,
      orgName: org.name,
      data: null,
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

export function useAllOperationalDashboards(orgs: OrgRef[]): Result {
  const [entries, setEntries] = useState<OperationalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const orgKey = orgs.map((o) => o.id).join("|");

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const results = await Promise.all(orgs.map(fetchOperationalEntry));
    setEntries(results);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { entries, isLoading, refetch: fetchAll };
}
