"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Plus,
  AlertOctagon,
  Mail,
  Folder,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamTabNav } from "@/components/team-tab-nav";
import { RuleEditor } from "@/components/rule-editor";
import { getEmailAccounts, getRules } from "@/services/api";
import type { EmailAccount } from "@/types/email-account";
import {
  evaluationTypeLabels,
  type Rule,
  type ScopeKind,
} from "@/types/rule";

const scopeIcon: Record<ScopeKind, typeof Building2> = {
  TEAM: Building2,
  ACCOUNT: Mail,
  FOLDER: Folder,
};

export default function TeamRulesPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const teamId = params?.teamId ?? "";

  const [rules, setRules] = useState<Rule[] | null>(null);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [rulesRes, accountsRes] = await Promise.all([
          getRules(teamId),
          getEmailAccounts(teamId),
        ]);
        if (cancelled) return;
        setRules(rulesRes);
        setAccounts(accountsRes);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load rules");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  function handleCreated(rule: Rule) {
    setRules((prev) => (prev ? [rule, ...prev] : [rule]));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Rules</h1>
        </div>
      </div>

      <TeamTabNav
        teamId={teamId}
        rightSlot={
          <Button size="sm" onClick={() => setEditorOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New rule
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : !rules || rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No rules yet</h3>
            <p className="text-sm text-muted-foreground">
              Create a rule to start evaluating threads for breaches, tone, or
              missed responses.
            </p>
            <Button size="sm" onClick={() => setEditorOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create your first rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active rules</CardTitle>
            <CardDescription>
              Rules are matched per thread by evaluation type. Folder beats
              account beats team for the same type.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RuleTable rules={rules} accounts={accounts} />
          </CardContent>
        </Card>
      )}

      <RuleEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        emailAccounts={accounts}
        teamId={teamId}
        onCreated={handleCreated}
      />
    </div>
  );
}

function RuleTable({
  rules,
  accounts,
}: {
  rules: Rule[];
  accounts: EmailAccount[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y bg-muted/30 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-2.5">Name</th>
            <th className="px-3 py-2.5">Type</th>
            <th className="px-3 py-2.5">Scope</th>
            <th className="px-3 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} accounts={accounts} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RuleRow({
  rule,
  accounts,
}: {
  rule: Rule;
  accounts: EmailAccount[];
}) {
  const Icon = scopeIcon[rule.scopeKind];
  return (
    <tr className="hover:bg-accent/30">
      <td className="px-6 py-3 font-medium">{rule.name}</td>
      <td className="px-3 py-3">
        <Badge variant="secondary">
          {evaluationTypeLabels[rule.evaluationType]}
        </Badge>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <ScopeLabel rule={rule} accounts={accounts} />
        </span>
      </td>
      <td className="px-3 py-3">
        {rule.active ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        ) : (
          <Badge variant="outline">Paused</Badge>
        )}
      </td>
    </tr>
  );
}

function ScopeLabel({
  rule,
  accounts,
}: {
  rule: Rule;
  accounts: EmailAccount[];
}) {
  if (rule.scopeKind === "TEAM") return <span>Org-wide</span>;

  const account =
    rule.emailAccount ??
    accounts.find((a) => a.id === rule.emailAccountId) ??
    null;
  const accountLabel = account?.emailAddress ?? rule.emailAccountId ?? "—";

  if (rule.scopeKind === "ACCOUNT") return <span>{accountLabel}</span>;

  if (rule.folderId === null) {
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        Folder removed
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => {
            // intentional placeholder: edit modal not yet wired
          }}
        >
          Edit rule
        </Button>
      </span>
    );
  }

  const folderPath = rule.folder?.path ?? "(unknown folder)";
  return (
    <span className="truncate" title={`${accountLabel} · ${folderPath}`}>
      {accountLabel} · {folderPath}
    </span>
  );
}
