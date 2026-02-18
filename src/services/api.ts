const BASE_URL = process.env.NEXT_PUBLIC_WATCHLANE_BASE_API;

export interface Organization {
  id: string;
  name: string;
  role: string;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  planTier: string;
  role: string;
  createdAt: string;
}

export interface DashboardSummary {
  coveredCount: number;
  uncoveredCount: number;
  avgResponseTimeMinutes: number;
  oldestUncoveredMinutes: number;
}

interface MeResponse {
  user: { id: string; name: string; email: string; avatarUrl?: string };
  organizations: Organization[];
}

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${BASE_URL}/api/dashboard/summary`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }
  return res.json();
}

export async function getOrganizations(): Promise<OrganizationDetail[]> {
  const res = await fetch(`${BASE_URL}/api/organizations`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch organizations");
  }
  return res.json();
}

export async function createOrganization(name: string): Promise<Organization> {
  const res = await fetch(`${BASE_URL}/api/organizations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create organization");
  }
  return res.json();
}

export async function getAuthMailboxUrl(mailbox: string): Promise<{ url: string }> {
  const res = await fetch(
    `${BASE_URL}/api/auth/${mailbox}/connect-url?`,
    { credentials: "include" }
  );
  if (!res.ok) {
    throw new Error("Failed to get mailbox connection URL");
  }
  return res.json();
}

export async function getAuthUrls(): Promise<{ microsoft: string; google: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/urls`);
  if (!res.ok) {
    throw new Error("Failed to fetch auth URLs");
  }
  return res.json();
}
