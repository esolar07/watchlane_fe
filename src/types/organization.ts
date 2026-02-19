export interface Organization {
  id: string;
  name: string;
  role: string;
  settings: OrganizationSettings;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  planTier: string;
  role: string;
  createdAt: string;
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