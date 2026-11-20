"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Mail, Clock, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTeam } from "@/services/api";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useWorkspaceMailboxes } from "@/hooks/useWorkspaceMailboxes";
import { useConnectMailbox } from "@/hooks/useConnectMailbox";
import { isLimitReachedError } from "@/lib/errors";

function formatRelativeTime(dateString: string): string {
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatLimitReached(body: { feature?: string; limit?: number; current?: number }): string {
  return `You've used ${body.current ?? "all"} of ${body.limit ?? "your"} ${body.feature ?? "teams"}.`;
}

export default function TeamsPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const { isWithinLimit, refetch: refetchEntitlements } = useEntitlements();
  const canManageWorkspace =
    activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";
  const teamLimitAvailable = isWithinLimit("team_limit");
  const mailboxLimitAvailable = isWithinLimit("mailbox_limit");
  const showCreateButton = canManageWorkspace && teamLimitAvailable;
  const { teams, mailboxCounts, isLoading, refetch: refetchTeams } = useWorkspaceMailboxes();
  const { connectingTeamId, connectError, connectMailbox } = useConnectMailbox();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [slaEnabled, setSlaEnabled] = useState(true);
  const [slaMinutes, setSlaMinutes] = useState(120);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Team name is required.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await createTeam({
        name: trimmed,
        role: "OWNER",
        settings: {
          slaMinutes,
          slaEnabled,
          weeklyReportEnabled: false,
          weeklyReportDay: null,
          notifyOnBreach: false,
        },
      });
      refetchTeams();
      setName("");
      setSlaEnabled(true);
      setSlaMinutes(120);
      setDialogOpen(false);
      refetchEntitlements();
    } catch (caught) {
      if (isLimitReachedError(caught)) {
        setError(formatLimitReached(caught.body));
      } else {
        setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetAndClose(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setName("");
      setSlaEnabled(true);
      setSlaMinutes(120);
      setError("");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <EmptyTeamsState
        canCreate={showCreateButton}
        onSubmit={handleCreate}
        name={name}
        setName={setName}
        slaEnabled={slaEnabled}
        setSlaEnabled={setSlaEnabled}
        slaMinutes={slaMinutes}
        setSlaMinutes={setSlaMinutes}
        error={error}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage teams in your workspace.</p>
        </div>
        {showCreateButton && (
          <Dialog open={dialogOpen} onOpenChange={resetAndClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New team
              </Button>
            </DialogTrigger>
            <CreateTeamDialogContent
              onSubmit={handleCreate}
              name={name}
              setName={setName}
              slaEnabled={slaEnabled}
              setSlaEnabled={setSlaEnabled}
              slaMinutes={slaMinutes}
              setSlaMinutes={setSlaMinutes}
              error={error}
              isSubmitting={isSubmitting}
            />
          </Dialog>
        )}
      </div>

      {canManageWorkspace && !teamLimitAvailable && (
        <p className="text-sm text-muted-foreground">
          You&rsquo;ve reached your plan&rsquo;s team limit. Available on higher plan.
        </p>
      )}

      {connectError && <p className="text-sm text-destructive">{connectError}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const memberCount = team.memberCount ?? team.members?.length;
          const hasStats = Boolean(team.coverage) || Boolean(team.lastActivityAt);
          return (
            <Card key={team.id} className="gap-0 py-5 transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold text-foreground">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-none">{team.name}</p>
                    {typeof memberCount === "number" && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                      </p>
                    )}
                  </div>
                </div>

                <TeamMailboxStatus
                  mailboxCount={mailboxCounts[team.id] ?? null}
                  canConnect={mailboxLimitAvailable}
                  isConnecting={connectingTeamId === team.id}
                  onConnect={() => connectMailbox(team.id)}
                />

                {hasStats && (
                  <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                    {team.coverage && (
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Coverage
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {team.coverage.covered}/{team.coverage.total}
                        </p>
                      </div>
                    )}
                    {team.lastActivityAt && (
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Last activity
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {formatRelativeTime(team.lastActivityAt)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/teams/${team.id}`)}
                >
                  View team
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface TeamMailboxStatusProps {
  mailboxCount: number | null;
  canConnect: boolean;
  isConnecting: boolean;
  onConnect: () => void;
}

function StatusDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function TeamMailboxStatus({ mailboxCount, canConnect, isConnecting, onConnect }: TeamMailboxStatusProps) {
  if (mailboxCount === null) return <StatusDot className="bg-muted-foreground/40" label="Mailbox status unavailable" />;
  if (mailboxCount > 0) return <StatusDot className="bg-green-500" label={formatMailboxCount(mailboxCount)} />;
  return (
    <div className="flex flex-col gap-2">
      <StatusDot className="bg-amber-500" label="No mailbox connected" />
      {canConnect && <ConnectMailboxButton isConnecting={isConnecting} onConnect={onConnect} />}
    </div>
  );
}

function formatMailboxCount(count: number): string {
  return `${count} ${count === 1 ? "mailbox" : "mailboxes"} connected`;
}

function ConnectMailboxButton({ isConnecting, onConnect }: { isConnecting: boolean; onConnect: () => void }) {
  return (
    <Button variant="outline" size="sm" className="w-full" disabled={isConnecting} onClick={onConnect}>
      <Mail className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect mailbox"}
    </Button>
  );
}

interface TeamFormFieldsProps {
  onSubmit: (event: FormEvent) => void;
  name: string;
  setName: (value: string) => void;
  slaEnabled: boolean;
  setSlaEnabled: (value: boolean) => void;
  slaMinutes: number;
  setSlaMinutes: (value: number) => void;
  error: string;
  isSubmitting: boolean;
}

function EmptyTeamsState(props: TeamFormFieldsProps & { canCreate: boolean }) {
  return (
    <div className="flex items-center justify-center py-24">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {props.canCreate ? "Create your first team" : "No teams yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {props.canCreate
                ? "Teams hold email accounts, threads, and rules."
                : "You don’t belong to any teams yet. Ask an admin to invite you."}
            </p>
          </div>
          {props.canCreate && <InlineTeamForm {...props} />}
        </CardContent>
      </Card>
    </div>
  );
}

function InlineTeamForm(props: TeamFormFieldsProps) {
  return (
    <form onSubmit={props.onSubmit} className="w-full space-y-5 text-left">
      <TeamFormBody {...props} />
      <Button type="submit" disabled={props.isSubmitting} className="w-full">
        {props.isSubmitting ? "Creating..." : "Create team"}
      </Button>
    </form>
  );
}

function CreateTeamDialogContent(props: TeamFormFieldsProps) {
  return (
    <DialogContent className="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>Create team</DialogTitle>
        <DialogDescription>A team owns email accounts, rules, and SLA settings.</DialogDescription>
      </DialogHeader>
      <form onSubmit={props.onSubmit} className="grid gap-5">
        <TeamFormBody {...props} />
        <DialogFooter>
          <Button type="submit" disabled={props.isSubmitting}>
            {props.isSubmitting ? "Creating..." : "Create team"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function TeamFormBody(props: TeamFormFieldsProps) {
  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Team Details</h4>
        <div className="grid gap-2">
          <Label htmlFor="team-name">Team name</Label>
          <Input
            id="team-name"
            placeholder="Customer Support"
            value={props.name}
            onChange={(changeEvent) => props.setName(changeEvent.target.value)}
            disabled={props.isSubmitting}
            autoFocus
          />
        </div>
      </div>
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-medium text-muted-foreground">SLA Settings</h4>
        <div className="flex items-center justify-between">
          <Label htmlFor="sla-enabled">Enable SLA tracking</Label>
          <Switch
            id="sla-enabled"
            checked={props.slaEnabled}
            onCheckedChange={props.setSlaEnabled}
            disabled={props.isSubmitting}
          />
        </div>
        {props.slaEnabled && (
          <div className="grid gap-2">
            <Label htmlFor="sla-minutes">SLA response time (minutes)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sla-minutes"
                type="number"
                min={1}
                placeholder="120"
                value={props.slaMinutes}
                onChange={(changeEvent) => props.setSlaMinutes(Number(changeEvent.target.value))}
                disabled={props.isSubmitting}
                className="pl-9"
              />
            </div>
          </div>
        )}
      </div>
      {props.error && (
        <p className="text-sm text-destructive" role="alert">{props.error}</p>
      )}
    </>
  );
}
