export type TeamRole = "OWNER" | "ADMIN" | "MEMBER";

export interface TeamSettings {
  slaMinutes: number;
  slaEnabled: boolean;
  weeklyReportEnabled: boolean;
  weeklyReportDay: string | null;
  notifyOnBreach: boolean;
}

export interface Team {
  id: string;
  name: string;
  workspaceId: string;
  role: TeamRole;
  mailboxConnected: boolean;
  settings: TeamSettings;
}

export interface TeamMember {
  name: string;
  email: string;
  role: TeamRole;
  mailboxConnected: boolean;
}

export interface TeamDetail extends Team {
  createdAt: string;
  inviteCode?: string;
  members?: TeamMember[];
}

export interface CreateTeamPayload {
  name: string;
  role: TeamRole;
  settings: TeamSettings;
}

export interface UpdateTeamPayload {
  name?: string;
  settings?: Partial<TeamSettings>;
}
