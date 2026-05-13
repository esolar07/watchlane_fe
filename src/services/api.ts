import {
  Team,
  TeamDetail,
  CreateTeamPayload,
  UpdateTeamPayload,
} from "@/types/team";
import {
  DashboardSummary,
  AggregateDashboard,
  OperationalDashboard,
  TeamDashboard,
  PerformanceDashboard,
} from "@/types/dashboard";
import { MeResponse } from "@/types/auth";
import { EmailAccount, EmailFolder } from "@/types/email-account";
import { Rule, CreateRulePayload } from "@/types/rule";
import {
  WorkspaceSummary,
  WorkspaceDetail,
  WorkspaceMember,
  AssignableWorkspaceRole,
} from "@/types/workspace";
import { Entitlements } from "@/types/entitlements";
import {
  WORKSPACE_HEADER_NAME,
  TEAM_HEADER_NAME,
  getActiveWorkspaceId,
} from "@/lib/workspace/constants";
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

type Scope = "workspace" | "team" | "none";

interface RequestOptions {
  method?: string;
  body?: unknown;
  scope?: Scope;
  teamId?: string;
  extraHeaders?: Record<string, string>;
}

function buildScopedHeaders(scope: Scope, teamId?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const workspaceId = getActiveWorkspaceId();
  if (scope !== "none" && workspaceId) headers[WORKSPACE_HEADER_NAME] = workspaceId;
  if (scope === "team" && teamId) headers[TEAM_HEADER_NAME] = teamId;
  return headers;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const scope = options.scope ?? "none";
  const headers = { ...buildScopedHeaders(scope, options.teamId), ...options.extraHeaders };
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

export function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/me");
}

export function updateMe(payload: { name: string }): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/me", { method: "PATCH", body: payload });
}

export interface OnboardingPayload {
  workspaceName: string;
  teamName: string;
  profileName?: string;
}

export interface OnboardingResponse {
  user: MeResponse;
  workspace: WorkspaceSummary;
  team: TeamDetail;
}

export function completeOnboarding(payload: OnboardingPayload): Promise<OnboardingResponse> {
  return apiRequest<OnboardingResponse>("/api/onboarding", { method: "POST", body: payload });
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/api/dashboard/summary");
}

export function getTeams(): Promise<TeamDetail[]> {
  return apiRequest<TeamDetail[]>("/api/teams");
}

export function getTeam(teamId: string): Promise<TeamDetail> {
  return apiRequest<TeamDetail>(`/api/teams/${teamId}`, { scope: "team", teamId });
}

export function updateTeam(teamId: string, payload: UpdateTeamPayload): Promise<TeamDetail> {
  return apiRequest<TeamDetail>(`/api/teams/${teamId}`, {
    method: "PUT",
    scope: "team",
    teamId,
    body: payload,
  });
}

export function createTeam(payload: CreateTeamPayload): Promise<Team> {
  return apiRequest<Team>("/api/teams", { method: "POST", scope: "workspace", body: payload });
}

export function regenerateInviteCode(teamId: string): Promise<TeamDetail> {
  return apiRequest<TeamDetail>(`/api/teams/${teamId}/regenerate-invite`, {
    method: "POST",
    scope: "team",
    teamId,
  });
}

export async function getAuthMailboxUrl(mailbox: string, teamId: string): Promise<{ url: string }> {
  const url = new URL(`${BASE_URL}/api/auth/${mailbox}/connect-url`);
  url.searchParams.set("teamId", teamId);
  const response = await fetch(url.toString(), { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to get mailbox connection URL");
  return response.json();
}

export async function getInviteUrl(inviteCode: string): Promise<{ url: string; teamName: string }> {
  const response = await fetch(
    `${BASE_URL}/api/auth/microsoft/invite-url?inviteCode=${encodeURIComponent(inviteCode)}`,
    { credentials: "include" },
  );
  if (response.status === 404) throw new Error("Invalid or expired invite link");
  if (!response.ok) throw await parseHttpError(response, "Failed to get invite URL");
  return response.json();
}

export async function getAuthUrls(): Promise<{ microsoft: string; google: string }> {
  const response = await fetch(`${BASE_URL}/api/auth/urls`, { credentials: "include" });
  if (!response.ok) throw await parseHttpError(response, "Failed to fetch auth URLs");
  return response.json();
}

export function getAggregateDashboard(params: {
  startDate: string;
  endDate: string;
}): Promise<AggregateDashboard> {
  const query = new URLSearchParams(params).toString();
  return apiRequest<AggregateDashboard>(`/api/dashboard/aggregate?${query}`);
}

export function getTeamDashboard(params: {
  teamId: string;
  startDate: string;
  endDate: string;
}): Promise<TeamDashboard> {
  const query = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate }).toString();
  return apiRequest<TeamDashboard>(`/api/dashboard/team?${query}`, { scope: "team", teamId: params.teamId });
}

export function getOperationalDashboard(params: {
  teamId: string;
  repId?: string;
}): Promise<OperationalDashboard> {
  const query = new URLSearchParams(params.repId ? { repId: params.repId } : {}).toString();
  const suffix = query ? `?${query}` : "";
  return apiRequest<OperationalDashboard>(`/api/dashboard/operational${suffix}`, {
    scope: "team",
    teamId: params.teamId,
  });
}

export function getPerformanceDashboard(params: {
  teamId: string;
  startDate: string;
  endDate: string;
  repId?: string;
}): Promise<PerformanceDashboard> {
  const query = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.repId ? { repId: params.repId } : {}),
  }).toString();
  return apiRequest<PerformanceDashboard>(`/api/dashboard/performance?${query}`, {
    scope: "team",
    teamId: params.teamId,
  });
}

export function triggerSync(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/dashboard/sync", { method: "POST" });
}

export async function getEmailAccounts(teamId: string): Promise<EmailAccount[]> {
  const body = await apiRequest<unknown>(`/api/email-accounts?teamId=${encodeURIComponent(teamId)}`, {
    scope: "team",
    teamId,
  });
  return unwrapList<EmailAccount>(body, "emailAccounts", "accounts");
}

export function getEmailAccount(accountId: string, teamId: string): Promise<EmailAccount> {
  return apiRequest<EmailAccount>(`/api/email-accounts/${accountId}`, { scope: "team", teamId });
}

export async function getEmailAccountFolders(
  accountId: string,
  teamId: string,
): Promise<{ folders: EmailFolder[] }> {
  const body = await apiRequest<unknown>(`/api/email-accounts/${accountId}/folders`, {
    scope: "team",
    teamId,
  });
  return { folders: unwrapList<EmailFolder>(body, "folders", "data") };
}

export function setFolderMonitored(
  folderId: string,
  monitored: boolean | null,
  teamId: string,
): Promise<{ folder: EmailFolder }> {
  return apiRequest<{ folder: EmailFolder }>(`/api/folders/${folderId}/monitored`, {
    method: "PATCH",
    scope: "team",
    teamId,
    body: { monitored },
  });
}

export async function getRules(teamId: string): Promise<Rule[]> {
  const body = await apiRequest<unknown>(`/api/rules?teamId=${encodeURIComponent(teamId)}`, {
    scope: "team",
    teamId,
  });
  return unwrapList<Rule>(body, "rules", "data");
}

export function createRule(payload: CreateRulePayload & { teamId: string }): Promise<{ rule: Rule }> {
  const { teamId, ...rest } = payload;
  return apiRequest<{ rule: Rule }>("/api/rules", {
    method: "POST",
    scope: "team",
    teamId,
    body: rest,
  });
}

export function listWorkspaces(): Promise<{ workspaces: WorkspaceSummary[] }> {
  return apiRequest<{ workspaces: WorkspaceSummary[] }>("/api/workspaces");
}

export function createWorkspace(name: string): Promise<WorkspaceSummary> {
  return apiRequest<WorkspaceSummary>("/api/workspaces", { method: "POST", body: { name } });
}

export function getCurrentWorkspace(): Promise<WorkspaceDetail> {
  return apiRequest<WorkspaceDetail>("/api/workspaces/current", { scope: "workspace" });
}

export function updateCurrentWorkspace(name: string): Promise<WorkspaceDetail> {
  return apiRequest<WorkspaceDetail>("/api/workspaces/current", {
    method: "PATCH",
    scope: "workspace",
    body: { name },
  });
}

export function listWorkspaceMembers(): Promise<{ members: WorkspaceMember[] }> {
  return apiRequest<{ members: WorkspaceMember[] }>("/api/workspaces/current/members", {
    scope: "workspace",
  });
}

export function addWorkspaceMember(
  userId: string,
  role?: AssignableWorkspaceRole,
): Promise<WorkspaceMember> {
  return apiRequest<WorkspaceMember>("/api/workspaces/current/members", {
    method: "POST",
    scope: "workspace",
    body: { userId, role },
  });
}

export function updateWorkspaceMemberRole(
  memberId: string,
  role: AssignableWorkspaceRole,
): Promise<WorkspaceMember> {
  return apiRequest<WorkspaceMember>(`/api/workspaces/current/members/${memberId}`, {
    method: "PATCH",
    scope: "workspace",
    body: { role },
  });
}

export function removeWorkspaceMember(memberId: string): Promise<void> {
  return apiRequest<void>(`/api/workspaces/current/members/${memberId}`, {
    method: "DELETE",
    scope: "workspace",
  });
}

export async function getEntitlements(): Promise<Entitlements> {
  const raw = await apiRequest<Entitlements & { usage?: Partial<Entitlements["usage"]> & { orgs_used?: number } }>(
    "/api/entitlements",
    { scope: "workspace" },
  );
  return {
    ...raw,
    usage: {
      workspaces_used: raw.usage?.workspaces_used ?? 0,
      teams_used: raw.usage?.teams_used ?? raw.usage?.orgs_used ?? 0,
      mailboxes_used: raw.usage?.mailboxes_used ?? 0,
    },
  };
}
