"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listWorkspaces } from "@/services/api";
import {
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "@/lib/workspace/constants";
import { useAuth } from "@/components/AuthProvider";
import type { WorkspaceSummary } from "@/types/workspace";

interface WorkspaceContextValue {
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  isLoading: boolean;
  error: string | null;
  selectWorkspace: (workspaceId: string) => void;
  refetch: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function chooseInitialWorkspace(
  available: WorkspaceSummary[],
  storedId: string | null,
): string | null {
  const matched = available.find((workspace) => workspace.id === storedId);
  if (matched) return matched.id;
  return available[0]?.id ?? null;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspaceIdState, setActiveIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyWorkspaces = useCallback((fetched: WorkspaceSummary[]) => {
    setWorkspaces(fetched);
    const next = chooseInitialWorkspace(fetched, getActiveWorkspaceId());
    setActiveWorkspaceId(next);
    setActiveIdState(next);
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listWorkspaces();
      applyWorkspaces(response.workspaces);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  }, [applyWorkspaces]);

  const resetWorkspaces = useCallback(() => {
    setWorkspaces([]);
    setActiveWorkspaceId(null);
    setActiveIdState(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      resetWorkspaces();
      return;
    }
    loadWorkspaces();
  }, [isAuthenticated, isAuthLoading, loadWorkspaces, resetWorkspaces]);

  const selectWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setActiveIdState(workspaceId);
  }, []);

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceIdState) ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        error,
        selectWorkspace,
        refetch: loadWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
}
