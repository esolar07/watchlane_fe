import { Organization, OrganizationDetail, CreateOrganizationPayload, UpdateOrganizationPayload } from "@/types/organization";
import { DashboardSummary, CoverageMetrics, OrgCoverageDetail } from "@/types/dashboard";
import { MeResponse } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_WATCHLANE_BASE_API;

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

export async function getOrganization(id: string): Promise<OrganizationDetail> {
  const res = await fetch(`${BASE_URL}/api/organizations/${id}`, {
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Organization not found");
    throw new Error("Failed to fetch organization");
  }
  return res.json();
}

export async function updateOrganization(id: string, payload: UpdateOrganizationPayload): Promise<OrganizationDetail> {
  const res = await fetch(`${BASE_URL}/api/organizations/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update organization");
  }
  return res.json();
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
  const res = await fetch(`${BASE_URL}/api/organizations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create organization");
  }
  return res.json();
}

export async function regenerateInviteCode(orgId: string): Promise<OrganizationDetail> {
  const res = await fetch(`${BASE_URL}/api/organizations/${orgId}/regenerate-invite`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to regenerate invite code");
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

export async function getInviteUrl(inviteCode: string): Promise<{ url: string; organizationName: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/microsoft/invite-url?inviteCode=${encodeURIComponent(inviteCode)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Invalid or expired invite link");
    throw new Error("Failed to get invite URL");
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

export async function getCoverageMetrics(params: {
  startDate: string;
  endDate: string;
}): Promise<CoverageMetrics[]> {
  const url = new URL(`${BASE_URL}/api/dashboard/coverage`);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch coverage metrics");
  }
  return res.json();
}

export async function getOrgCoverageDetail(params: {
  orgId: string;
  startDate: string;
  endDate: string;
}): Promise<OrgCoverageDetail> {
  const url = new URL(`${BASE_URL}/api/dashboard/coverage`);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  url.searchParams.set("orgId", params.orgId);

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch organization coverage");
  }
  return res.json();
}
