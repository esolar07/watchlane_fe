"use client";

import { useState } from "react";
import { getAuthMailboxUrl } from "@/services/api";
import { isLimitReachedError } from "@/lib/errors";

interface ConnectState {
  connectingTeamId: string | null;
  connectError: string | null;
}

function describeConnectError(caught: unknown): string {
  if (!isLimitReachedError(caught)) {
    return caught instanceof Error ? caught.message : "Failed to start connection.";
  }
  return `You've used ${caught.body.current ?? "all"} of ${caught.body.limit ?? "your"} mailboxes.`;
}

async function startMailboxOAuth(teamId: string): Promise<void> {
  const { url } = await getAuthMailboxUrl("microsoft", teamId);
  window.location.href = url;
}

/** Starts Microsoft OAuth for one specific team, so the backend never has to guess the team. */
export function useConnectMailbox() {
  const [state, setState] = useState<ConnectState>({ connectingTeamId: null, connectError: null });
  function connectMailbox(teamId: string) {
    setState({ connectingTeamId: teamId, connectError: null });
    startMailboxOAuth(teamId).catch((caught) =>
      setState({ connectingTeamId: null, connectError: describeConnectError(caught) }));
  }
  return { ...state, connectMailbox };
}
