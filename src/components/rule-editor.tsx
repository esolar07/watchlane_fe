"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Building2, Mail, Folder, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createRule, getEmailAccountFolders } from "@/services/api";
import type { EmailAccount, EmailFolder } from "@/types/email-account";
import {
  evaluationTypeLabels,
  type CreateRulePayload,
  type EvaluationType,
  type Rule,
  type ScopeKind,
} from "@/types/rule";
import {
  buildFolderIndex,
  effectiveMonitored,
} from "@/lib/folders";

interface RuleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailAccounts: EmailAccount[];
  teamId: string;
  onCreated: (rule: Rule) => void;
}

const scopeOptions: { value: ScopeKind; label: string; icon: typeof Building2 }[] = [
  { value: "TEAM", label: "Team", icon: Building2 },
  { value: "ACCOUNT", label: "Account", icon: Mail },
  { value: "FOLDER", label: "Folder", icon: Folder },
];

const evaluationOptions: EvaluationType[] = [
  "SLA_BREACH",
  "NEGATIVE_TONE",
  "NO_REPLY",
  "MANUAL_REVIEW",
];

export function RuleEditor({
  open,
  onOpenChange,
  emailAccounts,
  teamId,
  onCreated,
}: RuleEditorProps) {
  const [name, setName] = useState("");
  const [evaluationType, setEvaluationType] = useState<EvaluationType>("SLA_BREACH");
  const [scopeKind, setScopeKind] = useState<ScopeKind>("TEAM");
  const [emailAccountId, setEmailAccountId] = useState<string>("");
  const [folderId, setFolderId] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("");

  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [foldersError, setFoldersError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEvaluationType("SLA_BREACH");
      setScopeKind("TEAM");
      setEmailAccountId("");
      setFolderId("");
      setThreshold("");
      setFolders([]);
      setFoldersError(null);
      setSubmitError(null);
    }
  }, [open]);

  const microsoftAccounts = useMemo(
    () => emailAccounts.filter((a) => a.provider === "microsoft"),
    [emailAccounts],
  );

  useEffect(() => {
    if (scopeKind !== "FOLDER" || !emailAccountId) {
      setFolders([]);
      setFolderId("");
      return;
    }

    let cancelled = false;
    setFoldersLoading(true);
    setFoldersError(null);
    getEmailAccountFolders(emailAccountId, teamId)
      .then(({ folders }) => {
        if (cancelled) return;
        setFolders(folders);
      })
      .catch((err) => {
        if (cancelled) return;
        setFoldersError(
          err instanceof Error ? err.message : "Failed to load folders",
        );
      })
      .finally(() => {
        if (!cancelled) setFoldersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scopeKind, emailAccountId, teamId]);

  const folderOptions = useMemo(() => {
    if (folders.length === 0) return [];
    const byId = buildFolderIndex(folders);
    return folders
      .filter(
        (f) =>
          f.systemKind !== "JUNK_EMAIL" && f.systemKind !== "DELETED_ITEMS",
      )
      .map((f) => ({ folder: f, monitored: effectiveMonitored(f, byId) }))
      .sort((a, b) =>
        a.folder.path.localeCompare(b.folder.path, undefined, {
          sensitivity: "base",
        }),
      );
  }, [folders]);

  const hasMonitoredFolder = folderOptions.some((o) => o.monitored);

  function handleScopeChange(next: ScopeKind) {
    setScopeKind(next);
    if (next === "TEAM") {
      setEmailAccountId("");
      setFolderId("");
    } else if (next === "ACCOUNT") {
      setFolderId("");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setSubmitError("Name is required.");
      return;
    }
    if (scopeKind !== "TEAM" && !emailAccountId) {
      setSubmitError("Pick an account for this scope.");
      return;
    }
    if (scopeKind === "FOLDER" && !folderId) {
      setSubmitError("Pick a folder for this scope.");
      return;
    }

    const payload: CreateRulePayload = {
      name: trimmed,
      evaluationType,
      scopeKind,
      active: true,
    };
    if (scopeKind === "ACCOUNT" || scopeKind === "FOLDER") {
      payload.emailAccountId = emailAccountId;
    }
    if (scopeKind === "FOLDER") {
      payload.folderId = folderId;
    }
    if (threshold.trim()) {
      const n = Number(threshold);
      if (!Number.isFinite(n)) {
        setSubmitError("Threshold must be a number.");
        return;
      }
      payload.threshold = n;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { rule } = await createRule({ ...payload, teamId });
      onCreated(rule);
      onOpenChange(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create rule.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create rule</DialogTitle>
          <DialogDescription>
            Define what to evaluate and where it applies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="rule-name">Name</Label>
            <Input
              id="rule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tier-1 SLA breach"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rule-eval">Evaluation type</Label>
            <Select
              value={evaluationType}
              onValueChange={(v) => setEvaluationType(v as EvaluationType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="rule-eval" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {evaluationOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {evaluationTypeLabels[opt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Scope</Label>
            <div
              role="radiogroup"
              aria-label="Rule scope"
              className="grid grid-cols-3 gap-1 rounded-lg border bg-card p-0.5"
            >
              {scopeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = scopeKind === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleScopeChange(opt.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(scopeKind === "ACCOUNT" || scopeKind === "FOLDER") && (
            <div className="grid gap-2">
              <Label htmlFor="rule-account">Email account</Label>
              <Select
                value={emailAccountId}
                onValueChange={setEmailAccountId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="rule-account" className="w-full">
                  <SelectValue placeholder="Choose an account…" />
                </SelectTrigger>
                <SelectContent>
                  {emailAccounts.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No connected accounts.
                    </div>
                  )}
                  {emailAccounts.map((acct) => {
                    const isGmail = acct.provider === "google";
                    return (
                      <SelectItem
                        key={acct.id}
                        value={acct.id}
                        disabled={isGmail}
                        title={
                          isGmail
                            ? "Folder/account scope only available for Outlook"
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {acct.emailAddress}
                          {isGmail && (
                            <span className="text-xs text-muted-foreground">
                              (Gmail — unavailable)
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {scopeKind === "ACCOUNT" && microsoftAccounts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Connect an Outlook mailbox to use account scope.
                </p>
              )}
            </div>
          )}

          {scopeKind === "FOLDER" && emailAccountId && (
            <div className="grid gap-2">
              <Label htmlFor="rule-folder">Folder</Label>
              <Select
                value={folderId}
                onValueChange={setFolderId}
                disabled={isSubmitting || foldersLoading}
              >
                <SelectTrigger id="rule-folder" className="w-full">
                  <SelectValue
                    placeholder={
                      foldersLoading
                        ? "Loading folders…"
                        : folderOptions.length === 0
                        ? "No folders available"
                        : "Choose a folder…"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map(({ folder, monitored }) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <span className="flex items-center gap-2">
                        <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{folder.path}</span>
                        {!monitored && (
                          <span className="text-[10px] text-muted-foreground">
                            (not monitored)
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!foldersLoading && !foldersError && !hasMonitoredFolder && folderOptions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  None of these folders are currently monitored.{" "}
                  <Link
                    href={`/teams/${teamId}/email-accounts/${emailAccountId}/folders`}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => onOpenChange(false)}
                  >
                    Enable monitoring
                  </Link>{" "}
                  so the rule actually fires.
                </p>
              )}
              {foldersError && (
                <p className="text-xs text-destructive">{foldersError}</p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="rule-threshold">
              Threshold{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="rule-threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Leave blank to use defaults"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-start gap-2 rounded-md border bg-muted/30 px-3 py-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              More specific scopes win. A folder rule overrides an account
              rule of the same type, which overrides an team rule of the same
              type. Different rule types are evaluated independently.
            </p>
          </div>

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating…
                </span>
              ) : (
                "Create rule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
