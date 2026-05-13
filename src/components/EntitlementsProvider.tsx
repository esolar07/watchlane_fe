"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getEntitlements } from "@/services/api";
import { useWorkspace } from "@/hooks/useWorkspace";
import type {
  Entitlements,
  LimitFeatureKey,
  BooleanFeatureKey,
} from "@/types/entitlements";

interface EntitlementsContextValue {
  entitlements: Entitlements | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasFeature: (key: BooleanFeatureKey) => boolean;
  isWithinLimit: (key: LimitFeatureKey, count?: number) => boolean;
  remaining: (key: LimitFeatureKey, count?: number) => number | null;
}

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null);

function readUsageFor(entitlements: Entitlements, key: LimitFeatureKey): number {
  if (key === "mailbox_limit") return entitlements.usage.mailboxes_used;
  if (key === "team_limit") return entitlements.usage.teams_used;
  if (key === "workspace_limit") return entitlements.usage.workspaces_used;
  return 0;
}

export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const { activeWorkspace } = useWorkspace();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntitlements = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await getEntitlements();
      setEntitlements(next);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load entitlements");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!activeWorkspace) return;
    await fetchEntitlements();
  }, [activeWorkspace, fetchEntitlements]);

  useEffect(() => {
    if (!activeWorkspace) {
      Promise.resolve().then(() => setEntitlements(null));
      return;
    }
    fetchEntitlements();
  }, [activeWorkspace, fetchEntitlements]);

  const hasFeature = useCallback(
    (key: BooleanFeatureKey) => Boolean(entitlements?.features[key]),
    [entitlements],
  );

  const isWithinLimit = useCallback(
    (key: LimitFeatureKey, count?: number) => {
      if (!entitlements) return false;
      const limit = entitlements.features[key];
      if (limit === null) return true;
      const used = count ?? readUsageFor(entitlements, key);
      return used < limit;
    },
    [entitlements],
  );

  const remaining = useCallback(
    (key: LimitFeatureKey, count?: number) => {
      if (!entitlements) return null;
      const limit = entitlements.features[key];
      if (limit === null) return null;
      const used = count ?? readUsageFor(entitlements, key);
      return Math.max(0, limit - used);
    },
    [entitlements],
  );

  return (
    <EntitlementsContext.Provider
      value={{ entitlements, isLoading, error, refetch, hasFeature, isWithinLimit, remaining }}
    >
      {children}
    </EntitlementsContext.Provider>
  );
}

export function useEntitlements() {
  const context = useContext(EntitlementsContext);
  if (!context) throw new Error("useEntitlements must be used within an EntitlementsProvider");
  return context;
}
