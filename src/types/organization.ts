export interface Organization {
  id: string;
  name: string;
  role: string;
  mailboxConnected: boolean;
  settings: OrganizationSettings;
  workspaceId: string;
  workspaceName: string;
  plan: { slug: string; name: string };
}

export interface OrganizationMember {
  name: string;
  email: string;
  role: string;
  mailboxConnected: boolean;
}

export interface OrganizationDetail extends Organization {
  createdAt: string;
  inviteCode?: string;
  members?: OrganizationMember[];
}

export interface OrganizationSettings {
  slaMinutes: number;
  slaEnabled: boolean;
  weeklyReportEnabled: boolean;
  weeklyReportDay: string | null;
  notifyOnBreach: boolean;
}

export interface CreateOrganizationPayload {
  name: string;
  role: string;
  settings: OrganizationSettings;
}

export interface UpdateOrganizationPayload {
  name?: string;
  settings?: Partial<OrganizationSettings>;
}
