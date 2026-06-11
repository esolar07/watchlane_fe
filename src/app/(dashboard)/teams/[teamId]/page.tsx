"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Copy,
  Crown,
  Mail,
  MailX,
  Pencil,
  RefreshCw,
  Shield,
  User,
  Users,
  Link as LinkIcon,
} from "lucide-react";
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
  getTeam,
  updateTeam,
  regenerateInviteCode,
} from "@/services/api";
import type { TeamDetail } from "@/types/team";
import { TeamTabNav } from "@/components/team-tab-nav";
import { MailboxInvitePanel } from "@/components/MailboxInvitePanel";

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

export default function OrganizationSettingsPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const teamId = params?.teamId ?? "";

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlaEnabled, setEditSlaEnabled] = useState(false);
  const [editSlaMinutes, setEditSlaMinutes] = useState(120);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    getTeam(teamId)
      .then((data) => {
        setTeam(data);
        setEditName(data.name);
        setEditSlaEnabled(data.settings.slaEnabled);
        setEditSlaMinutes(data.settings.slaMinutes);
      })
      .catch((err) => {
        if (
          err instanceof Error &&
          err.message === "Team not found"
        ) {
          setNotFound(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [teamId]);

  const canEdit = team?.role === "OWNER" || team?.role === "ADMIN";

  function startEditing() {
    if (!team) return;
    setEditName(team.name);
    setEditSlaEnabled(team.settings.slaEnabled);
    setEditSlaMinutes(team.settings.slaMinutes);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setError("");
  }

  async function handleSave() {
    if (!team || !teamId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Team name is required.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const updated = await updateTeam(teamId, {
        name: trimmed,
        settings: {
          slaEnabled: editSlaEnabled,
          slaMinutes: editSlaMinutes,
        },
      });
      setTeam(updated);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inviteLink = team?.inviteCode
    ? `${window.location.origin}/invite?code=${team.inviteCode}`
    : null;

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateInvite() {
    if (!teamId) return;
    setIsRegenerating(true);
    try {
      const updated = await regenerateInviteCode(teamId);
      setTeam(updated);
    } catch {
      // silently fail — user can retry
    } finally {
      setIsRegenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !team) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Team not found</h2>
        <p className="text-sm text-muted-foreground">
          The team you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>
      </div>
    );
  }

  const RoleIcon = roleIcons[team.role] ?? User;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created {formatDate(team.createdAt)}
              </p>
            </div>
          </div>
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={startEditing}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* ── Tab nav ── */}
      <TeamTabNav teamId={teamId} />

      {/* ── Settings content ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Details</CardTitle>
            <CardDescription>
              General information about your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Team name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                />
              </div>
            ) : (
              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium">{team.name}</span>
              </div>
            )}
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <RoleIcon className="h-3 w-3" />
                {team.role}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* SLA Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SLA Settings</CardTitle>
            <CardDescription>
              Configure service level agreement tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">SLA tracking</span>
                <span className="text-xs text-muted-foreground">
                  Monitor response time against your SLA target.
                </span>
              </div>
              {isEditing ? (
                <Switch
                  checked={editSlaEnabled}
                  onCheckedChange={setEditSlaEnabled}
                  disabled={isSaving}
                />
              ) : (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    team.settings.slaEnabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {team.settings.slaEnabled ? "Enabled" : "Disabled"}
                </span>
              )}
            </div>

            {(isEditing ? editSlaEnabled : team.settings.slaEnabled) && (
              <div className="grid gap-2">
                <span className="text-sm font-medium">
                  Response time target
                </span>
                {isEditing ? (
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      value={editSlaMinutes}
                      onChange={(e) =>
                        setEditSlaMinutes(Number(e.target.value))
                      }
                      disabled={isSaving}
                      className="pl-9"
                    />
                    <span className="mt-1 text-xs text-muted-foreground">
                      Time in minutes before an SLA breach.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{team.settings.slaMinutes} minutes</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {isEditing && (
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members Card — OWNER/ADMIN only */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </CardTitle>
            <CardDescription>
              People who belong to this team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!team.members || team.members.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No members yet. Share the invite link to add team members.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {team.members.map((member) => {
                  const MemberRoleIcon = roleIcons[member.role] ?? User;
                  return (
                    <div
                      key={member.email}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {member.mailboxConnected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Mail className="h-3 w-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            <MailX className="h-3 w-3" />
                            Not connected
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <MemberRoleIcon className="h-3 w-3" />
                          {member.role}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mailbox Invite Links — OWNER/ADMIN only */}
      {canEdit && <MailboxInvitePanel teamId={teamId} />}

      {/* Invite Link Card — OWNER/ADMIN only */}
      {canEdit && inviteLink && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Team Invite Link
            </CardTitle>
            <CardDescription>
              Share this link to invite new members to your team. Anyone
              with the link can join as a member.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyInviteLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Regenerating will invalidate the current link.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateInvite}
                disabled={isRegenerating}
              >
                <RefreshCw
                  className={`mr-2 h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`}
                />
                {isRegenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
