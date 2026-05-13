"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mail,
  ChevronRight,
  AlertOctagon,
  FolderTree as FolderTreeIcon,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamTabNav } from "@/components/team-tab-nav";
import { getEmailAccounts, getAuthMailboxUrl } from "@/services/api";
import { useEntitlements } from "@/hooks/useEntitlements";
import { isLimitReachedError } from "@/lib/errors";
import type { EmailAccount } from "@/types/email-account";

export default function TeamEmailAccountsPage() {
  const params = useParams<{ teamId: string }>();
  const teamId = params?.teamId ?? "";
  const { isWithinLimit } = useEntitlements();
  const canConnect = isWithinLimit("mailbox_limit");
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    setIsLoading(true);
    getEmailAccounts(teamId)
      .then((rows) => {
        if (cancelled) return;
        setAccounts(rows);
        setLoadError(null);
      })
      .catch((caught) => {
        if (cancelled) return;
        setLoadError(caught instanceof Error ? caught.message : "Failed to load accounts");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  async function handleConnect() {
    setActionError(null);
    setConnecting(true);
    try {
      const { url } = await getAuthMailboxUrl("microsoft", teamId);
      window.location.href = url;
    } catch (caught) {
      setConnecting(false);
      if (isLimitReachedError(caught)) {
        const body = caught.body;
        setActionError(`You've used ${body.current ?? "all"} of ${body.limit ?? "your"} mailboxes.`);
      } else {
        setActionError(caught instanceof Error ? caught.message : "Failed to start connection.");
      }
    }
  }

  return (
    <div className="space-y-4">
      <TeamTabNav
        teamId={teamId}
        rightSlot={
          canConnect ? (
            <Button size="sm" disabled={connecting} onClick={handleConnect}>
              <Plus className="mr-2 h-4 w-4" />
              {connecting ? "Connecting…" : "Connect mailbox"}
            </Button>
          ) : null
        }
      />

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {isLoading ? (
        <LoadingState />
      ) : loadError ? (
        <ErrorCard message={loadError} />
      ) : accounts.length === 0 ? (
        <EmptyState canConnect={canConnect} />
      ) : (
        <Card>
          <CardContent className="px-0">
            <ul className="divide-y">
              {accounts.map((account) => (
                <AccountRow key={account.id} account={account} teamId={teamId} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountRow({ account, teamId }: { account: EmailAccount; teamId: string }) {
  const isMicrosoft = account.provider === "microsoft";
  return (
    <li>
      <Link
        href={`/teams/${teamId}/email-accounts/${account.id}/folders`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Mail className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{account.emailAddress}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {isMicrosoft ? "Outlook" : "Gmail"}
            </Badge>
            {!isMicrosoft && (
              <span className="text-xs text-muted-foreground">Folder selection unavailable</span>
            )}
          </div>
        </div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
          <FolderTreeIcon className="h-3.5 w-3.5" />
          Manage folders
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-center gap-3 py-6">
        <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ canConnect }: { canConnect: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No mailboxes connected</h3>
        <p className="text-sm text-muted-foreground">
          {canConnect
            ? "Connect an Outlook mailbox to start tracking coverage."
            : "Upgrade your plan to connect more mailboxes."}
        </p>
      </CardContent>
    </Card>
  );
}
