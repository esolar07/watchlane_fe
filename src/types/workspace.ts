export interface WorkspaceSummary {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  currentPlan: { slug: string; name: string };
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  currentPlan: { slug: string; name: string };
  members: WorkspaceMember[];
}
