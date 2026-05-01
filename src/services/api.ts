import { Organization, OrganizationDetail, CreateOrganizationPayload, UpdateOrganizationPayload } from "@/types/organization";
import {
  DashboardSummary,
  AggregateDashboard,
  OperationalDashboard,
  OrgDashboard,
  PerformanceDashboard,
} from "@/types/dashboard";
import { MeResponse } from "@/types/auth";
import { EmailAccount, EmailFolder } from "@/types/email-account";
import { Rule, CreateRulePayload } from "@/types/rule";

const BASE_URL = process.env.NEXT_PUBLIC_WATCHLANE_BASE_API;

async function parseError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => null);
  const message = body?.error ?? body?.message ?? fallback;
  return new Error(message);
}

function unwrapList<T>(body: unknown, ...keys: string[]): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of keys) {
      const v = obj[key];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
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

export async function getAuthMailboxUrl(mailbox: string, orgId: string): Promise<{ url: string }> {
  const url = new URL(`${BASE_URL}/api/auth/${mailbox}/connect-url`);
  url.searchParams.set("orgId", orgId);

  const res = await fetch(url.toString(), { credentials: "include" });
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

export async function getAggregateDashboard(params: {
  startDate: string;
  endDate: string;
}): Promise<AggregateDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/aggregate`);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch aggregate dashboard");
  }
  return res.json();
}

export async function getOrgDashboard(params: {
  orgId: string;
  startDate: string;
  endDate: string;
}): Promise<OrgDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/org`);
  url.searchParams.set("orgId", params.orgId);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch org dashboard");
  }
  return res.json();
}

export async function getOperationalDashboard(params: {
  orgId: string;
  repId?: string;
}): Promise<OperationalDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/operational`);
  url.searchParams.set("orgId", params.orgId);
  if (params.repId) url.searchParams.set("repId", params.repId);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch operational dashboard");
  }
  return res.json();
}

export async function getPerformanceDashboard(params: {
  orgId: string;
  startDate: string;
  endDate: string;
  repId?: string;
}): Promise<PerformanceDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/performance`);
  url.searchParams.set("orgId", params.orgId);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  if (params.repId) url.searchParams.set("repId", params.repId);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch performance dashboard");
  }
  return res.json();
}

export async function triggerSync(): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/dashboard/sync`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to sync mail");
  }
  return res.json();
}

export async function getEmailAccounts(orgId: string): Promise<EmailAccount[]> {
  const url = new URL(`${BASE_URL}/api/email-accounts`);
  url.searchParams.set("orgId", orgId);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch email accounts");
  }
  return unwrapList<EmailAccount>(await res.json(), "emailAccounts", "accounts");
}

export async function getEmailAccount(accountId: string): Promise<EmailAccount> {
  const res = await fetch(`${BASE_URL}/api/email-accounts/${accountId}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch email account");
  }
  return res.json();
}

export async function getEmailAccountFolders(
  accountId: string,
): Promise<{ folders: EmailFolder[] }> {
  const res = await fetch(
    `${BASE_URL}/api/email-accounts/${accountId}/folders`,
    { credentials: "include" },
  );
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch folders");
  }
  return {
    folders: unwrapList<EmailFolder>(await res.json(), "folders", "data"),
  };
}

export async function setFolderMonitored(
  folderId: string,
  monitored: boolean | null,
): Promise<{ folder: EmailFolder }> {
  const res = await fetch(`${BASE_URL}/api/folders/${folderId}/monitored`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monitored }),
  });
  if (!res.ok) {
    throw await parseError(res, "Failed to update folder");
  }
  return res.json();
}

export async function getRules(orgId: string): Promise<Rule[]> {
  const url = new URL(`${BASE_URL}/api/rules`);
  url.searchParams.set("orgId", orgId);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    throw await parseError(res, "Failed to fetch rules");
  }
  return unwrapList<Rule>(await res.json(), "rules", "data");
}

export async function createRule(
  payload: CreateRulePayload,
): Promise<{ rule: Rule }> {
  const res = await fetch(`${BASE_URL}/api/rules`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await parseError(res, "Failed to create rule");
  }
  return res.json();
}
