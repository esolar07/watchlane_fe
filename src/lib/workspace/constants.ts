export const WORKSPACE_HEADER_NAME = "X-Workspace-Id";
export const ORG_HEADER_NAME = "X-Org-Id";
export const ACTIVE_WORKSPACE_STORAGE_KEY = "watchlane.activeWorkspaceId";

let activeWorkspaceIdInMemory: string | null = null;

export function setActiveWorkspaceId(workspaceId: string | null): void {
  activeWorkspaceIdInMemory = workspaceId;
  if (typeof window === "undefined") return;
  if (workspaceId === null) window.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  else window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
}

export function getActiveWorkspaceId(): string | null {
  if (activeWorkspaceIdInMemory !== null) return activeWorkspaceIdInMemory;
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
}
