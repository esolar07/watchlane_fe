export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type AssignableWorkspaceRole = "ADMIN" | "MEMBER";

export interface WorkspaceSummary {
  id: string;
  name: string;
  ownerUserId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: AssignableWorkspaceRole;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  ownerUserId: string;
  members: WorkspaceMember[];
}
