"use client";

import { useEffect, useState } from "react";
import { getEmailAccounts, getTeams } from "@/services/api";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { TeamDetail } from "@/types/team";

/** Mailbox count per team id; null means the count could not be loaded. */
export type MailboxCounts = Record<string, number | null>;

interface WorkspaceMailboxes {
  teams: TeamDetail[];
  mailboxCounts: MailboxCounts;
}

interface LoadedMailboxes {
  workspaceId: string | null;
  data: WorkspaceMailboxes;
}

const NO_MAILBOXES: WorkspaceMailboxes = { teams: [], mailboxCounts: {} };

async function countTeamMailboxes(teamId: string): Promise<number | null> {
  try {
    return (await getEmailAccounts(teamId)).length;
  } catch {
    return null;
  }
}

async function loadMailboxCounts(teams: TeamDetail[]): Promise<MailboxCounts> {
  const counts = await Promise.all(teams.map((team) => countTeamMailboxes(team.id)));
  return Object.fromEntries(teams.map((team, index) => [team.id, counts[index]]));
}

async function fetchWorkspaceMailboxes(workspaceId: string | null): Promise<WorkspaceMailboxes> {
  if (!workspaceId) return NO_MAILBOXES;
  const allTeams = await getTeams().catch(() => []);
  const teams = allTeams.filter((team) => team.workspaceId === workspaceId);
  return { teams, mailboxCounts: await loadMailboxCounts(teams) };
}

/** True only when every team's count loaded and all are zero. */
export function workspaceHasNoMailboxes(counts: MailboxCounts): boolean {
  const values = Object.values(counts);
  return values.length > 0 && values.every((count) => count === 0);
}

function useLoadedMailboxes(workspaceId: string | null, enabled: boolean) {
  const [loaded, setLoaded] = useState<LoadedMailboxes | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (enabled) fetchWorkspaceMailboxes(workspaceId).then((data) => { if (!cancelled) setLoaded({ workspaceId, data }); });
    return () => { cancelled = true; };
  }, [workspaceId, enabled, reloadToken]);
  return { loaded, refetch: () => setReloadToken((token) => token + 1) };
}

/**
 * Teams in the active workspace plus how many mailboxes each has.
 * Uses GET /api/email-accounts per team, which counts invite-link mailboxes (userId = null),
 * unlike `team.mailboxConnected`, which only reflects the current user's own mailbox.
 */
export function useWorkspaceMailboxes() {
  const { activeWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? null;
  const { loaded, refetch } = useLoadedMailboxes(workspaceId, !isWorkspaceLoading);
  const isLoading = isWorkspaceLoading || loaded?.workspaceId !== workspaceId;
  return { ...(loaded?.data ?? NO_MAILBOXES), isLoading, refetch };
}
