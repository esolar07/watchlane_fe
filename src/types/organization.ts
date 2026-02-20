export interface Organization {
  id: string;
  name: string;
  role: string;
  mailboxConnected: boolean;
  settings: OrganizationSettings;
}

export interface OrganizationMember {
  name: string;
  email: string;
  role: string;
  mailboxConnected: boolean;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  planTier: string;
  role: string;
  createdAt: string;
  mailboxConnected: boolean;
  settings: OrganizationSettings;
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