"use client";

import { useCallback, useEffect, useState } from "react";
import { getOperationalDashboard } from "@/services/api";
import type { OperationalDashboard } from "@/types/dashboard";

export interface OperationalEntry {
  teamId: string;
  teamName: string;
  data: OperationalDashboard | null;
  error: string | null;
}

interface TeamRef {
  id: string;
  name: string;
}

interface Result {
  entries: OperationalEntry[];
  isLoading: boolean;
  refetch: () => void;
}

async function fetchOperationalEntry(team: TeamRef): Promise<OperationalEntry> {
  try {
    const data = await getOperationalDashboard({ teamId: team.id });
    return { teamId: team.id, teamName: team.name, data, error: null };
  } catch (err) {
    return {
      teamId: team.id,
      teamName: team.name,
      data: null,
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

export function useAllOperationalDashboards(teams: TeamRef[]): Result {
  const [entries, setEntries] = useState<OperationalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teamKey = teams.map((o) => o.id).join("|");

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const results = await Promise.all(teams.map(fetchOperationalEntry));
    setEntries(results);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { entries, isLoading, refetch: fetchAll };
}
