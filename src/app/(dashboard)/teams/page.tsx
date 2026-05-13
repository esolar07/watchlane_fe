"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Crown, Shield, User, Mail, MailCheck, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { getTeams, createTeam, getAuthMailboxUrl } from "@/services/api";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEntitlements } from "@/hooks/useEntitlements";
import { isLimitReachedError } from "@/lib/errors";
import type { TeamDetail } from "@/types/team";

const roleIcons: Record<string, typeof Crown> = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [teams, setTeams] = useState<TeamDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [slaEnabled, setSlaEnabled] = useState(true);
  const [slaMinutes, setSlaMinutes] = useState(120);
  const [error, setError] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectingTeamId, setConnectingTeamId] = useState<string | null>(null);

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setIsLoading(false));
  }, []);

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
      const newTeam = await createTeam({
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
      setTeams((prev) => [...prev, { ...newTeam, createdAt: new Date().toISOString() }]);
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

  async function handleConnectMailbox(teamId: string) {
    setConnectError(null);
    setConnectingTeamId(teamId);
    try {
      const { url } = await getAuthMailboxUrl("microsoft", teamId);
      window.location.href = url;
    } catch (caught) {
      setConnectingTeamId(null);
      if (isLimitReachedError(caught)) {
        setConnectError(formatLimitReached(caught.body));
      } else {
        setConnectError(caught instanceof Error ? caught.message : "Failed to start connection.");
      }
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
          const RoleIcon = roleIcons[team.role] ?? User;
          return (
            <Card
              key={team.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/teams/${team.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Created {formatDate(team.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <RoleIcon className="h-3 w-3" />
                    {team.role}
                  </span>
                </div>
                {team.mailboxConnected ? (
                  <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/50 dark:bg-green-900/20">
                    <MailCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Mailbox connected
                    </span>
                  </div>
                ) : mailboxLimitAvailable ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={connectingTeamId === team.id}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      handleConnectMailbox(team.id);
                    }}
                  >
                    {connectingTeamId === team.id ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Connecting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Connect mailbox
                      </span>
                    )}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
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
