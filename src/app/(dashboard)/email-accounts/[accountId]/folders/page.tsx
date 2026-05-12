"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, AlertOctagon, FolderTree as FolderTreeIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getEmailAccount,
  getEmailAccountFolders,
  setFolderMonitored,
} from "@/services/api";
import type { EmailAccount, EmailFolder } from "@/types/email-account";
import { FolderTree } from "@/components/folder-tree";
import type { MonitoredState } from "@/components/folder-monitored-control";
import { useAuth } from "@/components/AuthProvider";

export default function EmailAccountFoldersPage() {
  const params = useParams<{ accountId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { organizations } = useAuth();
  const accountId = params?.accountId ?? "";
  const orgIdFromQuery = searchParams?.get("orgId") ?? "";
  const orgId =
    orgIdFromQuery ||
    (organizations.length === 1 ? organizations[0].id : "");

  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [backfillingIds, setBackfillingIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  const isGmail = account?.provider === "google";

  useEffect(() => {
    if (!accountId) return;
    if (!orgId) {
      setLoadError("Missing organization context. Open this page from the Email Accounts list.");
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getEmailAccount(accountId, orgId)
      .then((acct) => {
        if (cancelled) return;
        setAccount(acct);
        if (acct.provider === "google") {
          setFolders([]);
          setIsLoading(false);
          return null;
        }
        return getEmailAccountFolders(accountId, orgId).then(({ folders }) => {
          if (cancelled) return;
          setFolders(folders);
          setIsLoading(false);
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load folders",
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, orgId]);

  const handleToggle = useCallback(
    async (folder: EmailFolder, next: MonitoredState) => {
      if (pendingIds.has(folder.id)) return;
      const previous = folder.monitored;
      const willBackfill = previous !== true && next === true;

      setPendingIds((prev) => new Set(prev).add(folder.id));
      if (willBackfill) {
        setBackfillingIds((prev) => new Set(prev).add(folder.id));
      }
      setActionError(null);

      setFolders((prev) =>
        prev.map((f) => (f.id === folder.id ? { ...f, monitored: next } : f)),
      );

      try {
        const { folder: updated } = await setFolderMonitored(
          folder.id,
          next,
          orgId,
        );
        setFolders((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f)),
        );
      } catch (err) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === folder.id ? { ...f, monitored: previous } : f,
          ),
        );
        setActionError(
          err instanceof Error ? err.message : "Failed to update folder",
        );
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(folder.id);
          return next;
        });
        if (willBackfill) {
          setBackfillingIds((prev) => {
            const next = new Set(prev);
            next.delete(folder.id);
            return next;
          });
        }
      }
    },
    [pendingIds, orgId],
  );

  const headerTitle = useMemo(() => {
    if (!account) return "Folder monitoring";
    return account.emailAddress;
  }, [account]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/email-accounts")}
          aria-label="Back to email accounts"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{headerTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Choose which folders to monitor for coverage tracking.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : loadError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{loadError}</p>
          </CardContent>
        </Card>
      ) : isGmail ? (
        <Card>
          <CardContent className="flex items-start gap-3 py-6">
            <AlertOctagon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Folder selection isn&apos;t available for Gmail accounts yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                We currently only support folder-based monitoring on Outlook
                mailboxes.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : folders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FolderTreeIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">
              Folder list is being built
            </h3>
            <p className="text-sm text-muted-foreground">
              Check back in a minute — Outlook is still syncing this mailbox.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mailbox folders</CardTitle>
            <CardDescription>
              Toggle folders to control monitoring. Children inherit from their
              parent unless you override them. Turning on a folder pulls the
              last 30 days from Outlook.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {actionError && (
              <div className="mx-6 mb-3 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <AlertOctagon className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{actionError}</p>
              </div>
            )}
            <FolderTree
              folders={folders}
              pendingIds={pendingIds}
              backfillingIds={backfillingIds}
              onToggle={handleToggle}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
