"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Building2,
  ChevronRight,
  AlertOctagon,
  FolderTree as FolderTreeIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { getEmailAccounts } from "@/services/api";
import type { EmailAccount } from "@/types/email-account";

interface AccountsByOrg {
  orgId: string;
  orgName: string;
  accounts: EmailAccount[];
  error?: string;
}

export default function EmailAccountsPage() {
  const { organizations, isLoading: isAuthLoading } = useAuth();
  const [groups, setGroups] = useState<AccountsByOrg[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    let cancelled = false;

    const load = async () => {
      if (organizations.length === 0) {
        if (!cancelled) {
          setGroups([]);
          setIsLoading(false);
        }
        return;
      }
      const result = await Promise.all(
        organizations.map(async (org): Promise<AccountsByOrg> => {
          try {
            const accounts = await getEmailAccounts(org.id);
            return { orgId: org.id, orgName: org.name, accounts };
          } catch (err) {
            return {
              orgId: org.id,
              orgName: org.name,
              accounts: [],
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to load accounts",
            };
          }
        }),
      );
      if (cancelled) return;
      setGroups(result);
      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [organizations, isAuthLoading]);

  const totalAccounts = useMemo(
    () => (groups ?? []).reduce((sum, g) => sum + g.accounts.length, 0),
    [groups],
  );

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium">No organizations</h3>
          <p className="text-sm text-muted-foreground">
            Connect a mailbox to one of your organizations to manage its
            folders here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email Accounts</h1>
        <p className="text-sm text-muted-foreground">
          {totalAccounts === 0
            ? "Connected mailboxes will appear here."
            : `${totalAccounts} connected mailbox${totalAccounts === 1 ? "" : "es"}.`}
        </p>
      </div>

      {groups.map((group) => (
        <Card key={group.orgId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {group.orgName}
            </CardTitle>
            <CardDescription>
              {group.accounts.length === 0
                ? "No mailboxes connected to this organization."
                : `${group.accounts.length} mailbox${group.accounts.length === 1 ? "" : "es"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {group.error ? (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <AlertOctagon className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{group.error}</p>
              </div>
            ) : group.accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Connect a mailbox from the Organizations page.
              </p>
            ) : (
              <ul className="divide-y">
                {group.accounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    orgId={group.orgId}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AccountRow({
  account,
  orgId,
}: {
  account: EmailAccount;
  orgId: string;
}) {
  const isMicrosoft = account.provider === "microsoft";

  return (
    <li>
      <Link
        href={`/email-accounts/${account.id}/folders?orgId=${encodeURIComponent(orgId)}`}
        className="group flex items-center gap-3 py-3 transition-colors hover:bg-accent/40"
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
              <span className="text-xs text-muted-foreground">
                Folder selection unavailable
              </span>
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
