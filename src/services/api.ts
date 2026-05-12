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
import { WorkspaceSummary, WorkspaceDetail, WorkspaceMember } from "@/types/workspace";
import { Plan, PlanPrice, PriceInterval } from "@/types/plan";
import { Entitlements } from "@/types/entitlements";
import { WORKSPACE_HEADER_NAME, getActiveWorkspaceId } from "@/lib/workspace/constants";
import { parseHttpError } from "@/lib/errors";

const BASE_URL = process.env.NEXT_PUBLIC_WATCHLANE_BASE_API;

function unwrapList<T>(body: unknown, ...keys: string[]): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object") {
    const bag = body as Record<string, unknown>;
    for (const key of keys) {
      const candidate = bag[key];
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [];
}

type RequestOptions = { method?: string; body?: unknown; extraHeaders?: Record<string, string> };

async function workspaceRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const workspaceId = getActiveWorkspaceId();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...options.extraHeaders };
  if (workspaceId) headers[WORKSPACE_HEADER_NAME] = workspaceId;
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) throw await parseHttpError(response, `Request failed: ${path}`);
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function getMe(): Promise<MeResponse> {
  const response = await fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" });
  if (!response.ok) throw new Error("Not authenticated");
  return response.json();
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${BASE_URL}/api/dashboard/summary`, { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch dashboard summary");
  return response.json();
}

export async function getOrganizations(): Promise<OrganizationDetail[]> {
  const response = await fetch(`${BASE_URL}/api/organizations`, { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch organizations");
  return response.json();
}

export async function getOrganization(orgId: string): Promise<OrganizationDetail> {
  const response = await fetch(`${BASE_URL}/api/organizations/${orgId}`, { credentials: "include" });
  if (response.status === 404) throw new Error("Organization not found");
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch organization");
  return response.json();
}

export async function updateOrganization(orgId: string, payload: UpdateOrganizationPayload): Promise<OrganizationDetail> {
  const response = await fetch(`${BASE_URL}/api/organizations/${orgId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to update organization");
  return response.json();
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
  const workspaceId = getActiveWorkspaceId();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (workspaceId) headers[WORKSPACE_HEADER_NAME] = workspaceId;
  const response = await fetch(`${BASE_URL}/api/organizations`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to create organization");
  return response.json();
}

export async function regenerateInviteCode(orgId: string): Promise<OrganizationDetail> {
  const response = await fetch(`${BASE_URL}/api/organizations/${orgId}/regenerate-invite`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to regenerate invite code");
  return response.json();
}

export async function getAuthMailboxUrl(mailbox: string, orgId: string): Promise<{ url: string }> {
  const url = new URL(`${BASE_URL}/api/auth/${mailbox}/connect-url`);
  url.searchParams.set("orgId", orgId);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to get mailbox connection URL");
  return response.json();
}

export async function getInviteUrl(inviteCode: string): Promise<{ url: string; organizationName: string }> {
  const response = await fetch(`${BASE_URL}/api/auth/microsoft/invite-url?inviteCode=${encodeURIComponent(inviteCode)}`);
  if (response.status === 404) throw new Error("Invalid or expired invite link");
  if (!response.ok) throw await parseHttpError(response, "Failed to get invite URL");
  return response.json();
}

export async function getAuthUrls(): Promise<{ microsoft: string; google: string }> {
  const response = await fetch(`${BASE_URL}/api/auth/urls`);
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch auth URLs");
  return response.json();
}

export async function getAggregateDashboard(params: { startDate: string; endDate: string }): Promise<AggregateDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/aggregate`);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch aggregate dashboard");
  return response.json();
}

export async function getOrgDashboard(params: { orgId: string; startDate: string; endDate: string }): Promise<OrgDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/org`);
  url.searchParams.set("orgId", params.orgId);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch org dashboard");
  return response.json();
}

export async function getOperationalDashboard(params: { orgId: string; repId?: string }): Promise<OperationalDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/operational`);
  url.searchParams.set("orgId", params.orgId);
  if (params.repId) url.searchParams.set("repId", params.repId);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch operational dashboard");
  return response.json();
}

export async function getPerformanceDashboard(params: { orgId: string; startDate: string; endDate: string; repId?: string }): Promise<PerformanceDashboard> {
  const url = new URL(`${BASE_URL}/api/dashboard/performance`);
  url.searchParams.set("orgId", params.orgId);
  url.searchParams.set("startDate", params.startDate);
  url.searchParams.set("endDate", params.endDate);
  if (params.repId) url.searchParams.set("repId", params.repId);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch performance dashboard");
  return response.json();
}

export async function triggerSync(): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/api/dashboard/sync`, { method: "POST", credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to sync mail");
  return response.json();
}

export async function getEmailAccounts(orgId: string): Promise<EmailAccount[]> {
  const url = new URL(`${BASE_URL}/api/email-accounts`);
  url.searchParams.set("orgId", orgId);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch email accounts");
  return unwrapList<EmailAccount>(await response.json(), "emailAccounts", "accounts");
}

export async function getEmailAccount(accountId: string, orgId: string): Promise<EmailAccount> {
  const response = await fetch(`${BASE_URL}/api/email-accounts/${accountId}`, {
    credentials: "include",
    headers: { "x-org-id": orgId },
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch email account");
  return response.json();
}

export async function getEmailAccountFolders(accountId: string, orgId: string): Promise<{ folders: EmailFolder[] }> {
  const response = await fetch(`${BASE_URL}/api/email-accounts/${accountId}/folders`, {
    credentials: "include",
    headers: { "x-org-id": orgId },
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch folders");
  return { folders: unwrapList<EmailFolder>(await response.json(), "folders", "data") };
}

export async function setFolderMonitored(folderId: string, monitored: boolean | null, orgId: string): Promise<{ folder: EmailFolder }> {
  const response = await fetch(`${BASE_URL}/api/folders/${folderId}/monitored`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-org-id": orgId },
    body: JSON.stringify({ monitored }),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to update folder");
  return response.json();
}

export async function getRules(orgId: string): Promise<Rule[]> {
  const url = new URL(`${BASE_URL}/api/rules`);
  url.searchParams.set("orgId", orgId);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch rules");
  return unwrapList<Rule>(await response.json(), "rules", "data");
}

export async function createRule(payload: CreateRulePayload): Promise<{ rule: Rule }> {
  const response = await fetch(`${BASE_URL}/api/rules`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to create rule");
  return response.json();
}

export async function listWorkspaces(): Promise<{ workspaces: WorkspaceSummary[] }> {
  const response = await fetch(`${BASE_URL}/api/workspaces`, { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch workspaces");
  return response.json();
}

export async function createWorkspace(name: string): Promise<WorkspaceSummary> {
  const response = await fetch(`${BASE_URL}/api/workspaces`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to create workspace");
  return response.json();
}

export function getCurrentWorkspace(): Promise<WorkspaceDetail> {
  return workspaceRequest<WorkspaceDetail>("/api/workspaces/current");
}

export function updateCurrentWorkspace(name: string): Promise<WorkspaceDetail> {
  return workspaceRequest<WorkspaceDetail>("/api/workspaces/current", { method: "PATCH", body: { name } });
}

export function listWorkspaceMembers(): Promise<{ members: WorkspaceMember[] }> {
  return workspaceRequest<{ members: WorkspaceMember[] }>("/api/workspaces/current/members");
}

export function addWorkspaceMember(userId: string, role?: string): Promise<WorkspaceMember> {
  return workspaceRequest<WorkspaceMember>("/api/workspaces/current/members", { method: "POST", body: { userId, role } });
}

export function updateWorkspaceMemberRole(memberId: string, role: string): Promise<WorkspaceMember> {
  return workspaceRequest<WorkspaceMember>(`/api/workspaces/current/members/${memberId}`, { method: "PATCH", body: { role } });
}

export function removeWorkspaceMember(memberId: string): Promise<void> {
  return workspaceRequest<void>(`/api/workspaces/current/members/${memberId}`, { method: "DELETE" });
}

export async function listPlans(): Promise<{ plans: Plan[] }> {
  const response = await fetch(`${BASE_URL}/api/plans`, { cache: "no-store" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch plans");
  return response.json();
}

export function getEntitlements(): Promise<Entitlements> {
  return workspaceRequest<Entitlements>("/api/entitlements");
}

export async function adminListPlans(): Promise<{ plans: Plan[] }> {
  const response = await fetch(`${BASE_URL}/api/admin/plans`, { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch admin plans");
  return response.json();
}

export async function adminCreatePlan(payload: { slug: string; name: string; description?: string; sortOrder?: number; isActive?: boolean }): Promise<Plan> {
  const response = await fetch(`${BASE_URL}/api/admin/plans`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to create plan");
  return response.json();
}

export async function adminUpdatePlan(planId: string, patch: Partial<{ name: string; description: string; sortOrder: number; isActive: boolean }>): Promise<Plan> {
  const response = await fetch(`${BASE_URL}/api/admin/plans/${planId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to update plan");
  return response.json();
}

export async function adminDeletePlan(planId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/admin/plans/${planId}`, { method: "DELETE", credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to delete plan");
}

export async function adminPutPlanFeatures(planId: string, features: Record<string, string | number | boolean | null>): Promise<Plan> {
  const response = await fetch(`${BASE_URL}/api/admin/plans/${planId}/features`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to update features");
  return response.json();
}

export async function adminCreatePrice(planId: string, payload: { stripePriceId: string; interval: PriceInterval; unitAmount: number; currency?: string }): Promise<PlanPrice> {
  const response = await fetch(`${BASE_URL}/api/admin/plans/${planId}/prices`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to create price");
  return response.json();
}

export async function adminUpdatePrice(planId: string, priceId: string, patch: Partial<{ stripePriceId: string; unitAmount: number; currency: string }>): Promise<PlanPrice> {
  const response = await fetch(`${BASE_URL}/api/admin/plans/${planId}/prices/${priceId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw await parseHttpError(response, "Failed to update price");
  return response.json();
}

export async function adminDeletePrice(planId: string, priceId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/admin/plans/${planId}/prices/${priceId}`, { method: "DELETE", credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to delete price");
}
