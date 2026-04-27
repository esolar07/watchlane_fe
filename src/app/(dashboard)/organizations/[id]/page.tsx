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
  getOrganization,
  updateOrganization,
  regenerateInviteCode,
} from "@/services/api";
import type { OrganizationDetail } from "@/types/organization";
import { OrgTabNav } from "@/components/org-tab-nav";
import { cn } from "@/lib/utils";

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

/* ── reusable section header ── */
function SectionTitle({
  icon: Icon,
  children,
  description,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <CardHeader className="border-b border-border px-5 py-3.5">
      <CardTitle className="flex items-center gap-2 text-[13px] font-semibold">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {children}
      </CardTitle>
      {description && (
        <CardDescription className="text-[12px]">
          {description}
        </CardDescription>
      )}
    </CardHeader>
  );
}

/* ── label/value row used in read-mode ── */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <div className="text-[13px]">{children}</div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orgId = params?.id ?? "";

  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlaEnabled, setEditSlaEnabled] = useState(false);
  const [editSlaMinutes, setEditSlaMinutes] = useState(120);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    getOrganization(orgId)
      .then((data) => {
        setOrg(data);
        setEditName(data.name);
        setEditSlaEnabled(data.settings.slaEnabled);
        setEditSlaMinutes(data.settings.slaMinutes);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "Organization not found") {
          setNotFound(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [orgId]);

  const canEdit = org?.role === "OWNER" || org?.role === "ADMIN";

  function startEditing() {
    if (!org) return;
    setEditName(org.name);
    setEditSlaEnabled(org.settings.slaEnabled);
    setEditSlaMinutes(org.settings.slaMinutes);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setError("");
  }

  async function handleSave() {
    if (!org || !orgId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Organization name is required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const updated = await updateOrganization(orgId, {
        name: trimmed,
        settings: { slaEnabled: editSlaEnabled, slaMinutes: editSlaMinutes },
      });
      setOrg(updated);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inviteLink = org?.inviteCode
    ? `${window.location.origin}/invite?code=${org.inviteCode}`
    : null;

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateInvite() {
    if (!orgId) return;
    setIsRegenerating(true);
    try {
      const updated = await regenerateInviteCode(orgId);
      setOrg(updated);
    } catch {
      // silently fail — user can retry
    } finally {
      setIsRegenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !org) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Building2 className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-[15px] font-semibold tracking-tight">
          Organization not found
        </h2>
        <p className="max-w-sm text-center text-[13px] text-muted-foreground">
          The organization you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to dashboard
        </Button>
      </div>
    );
  }

  const RoleIcon = roleIcons[org.role] ?? User;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/50">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight leading-none">
                {org.name}
              </h1>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Created {formatDate(org.createdAt)}
              </p>
            </div>
          </div>
          {canEdit && !isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <OrgTabNav orgId={orgId} />

      {/* ── Settings grid ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization details */}
        <Card className="gap-0 py-0 shadow-none">
          <SectionTitle description="General information about your organization.">
            Organization details
          </SectionTitle>
          <CardContent className="px-5 py-4">
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-[12px] font-medium">
                  Organization name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                <Field label="Name">
                  <span className="font-medium">{org.name}</span>
                </Field>
                <Field label="Role">
                  <span className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/50 px-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                    <RoleIcon className="h-2.5 w-2.5" />
                    {org.role}
                  </span>
                </Field>
                <Field label="Plan">
                  <span className="inline-flex h-5 items-center rounded border border-border bg-muted/50 px-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                    {org.planTier}
                  </span>
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLA */}
        <Card className="gap-0 py-0 shadow-none">
          <SectionTitle description="Configure service level agreement tracking.">
            SLA settings
          </SectionTitle>
          <CardContent className="space-y-4 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="grid gap-0.5">
                <span className="text-[13px] font-medium">SLA tracking</span>
                <span className="text-[12px] text-muted-foreground">
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
                  className={cn(
                    "inline-flex h-5 items-center rounded border px-1.5 text-[10.5px] font-medium uppercase tracking-wide",
                    org.settings.slaEnabled
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  {org.settings.slaEnabled ? "Enabled" : "Disabled"}
                </span>
              )}
            </div>

            {(isEditing ? editSlaEnabled : org.settings.slaEnabled) && (
              <div className="grid gap-2 border-t border-border pt-4">
                <span className="text-[12px] font-medium">
                  Response time target
                </span>
                {isEditing ? (
                  <>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        min={1}
                        value={editSlaMinutes}
                        onChange={(e) =>
                          setEditSlaMinutes(Number(e.target.value))
                        }
                        disabled={isSaving}
                        className="pl-8"
                      />
                    </div>
                    <span className="text-[11.5px] text-muted-foreground">
                      Time in minutes before an SLA breach.
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-[13px]">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="tabular-nums">
                      {org.settings.slaMinutes} minutes
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-[12px] text-destructive" role="alert">
                {error}
              </p>
            )}

            {isEditing && (
              <div className="flex gap-2 border-t border-border pt-4">
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  {isSaving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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

      {/* Team Members — OWNER/ADMIN only */}
      {canEdit && (
        <Card className="gap-0 py-0 shadow-none">
          <SectionTitle
            icon={Users}
            description="People who belong to this organization."
          >
            Team members
          </SectionTitle>
          <CardContent className="p-0">
            {!org.members || org.members.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <Users className="h-6 w-6 text-muted-foreground" />
                <p className="text-[12.5px] text-muted-foreground">
                  No members yet. Share the invite link below to add people.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {org.members.map((member) => {
                  const MemberRoleIcon = roleIcons[member.role] ?? User;
                  return (
                    <li
                      key={member.email}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium leading-none">
                            {member.name}
                          </p>
                          <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {member.mailboxConnected ? (
                          <span className="inline-flex h-5 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[10.5px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <Mail className="h-2.5 w-2.5" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/50 px-1.5 text-[10.5px] font-medium text-muted-foreground">
                            <MailX className="h-2.5 w-2.5" />
                            Not connected
                          </span>
                        )}
                        <span className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/50 px-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                          <MemberRoleIcon className="h-2.5 w-2.5" />
                          {member.role}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite link — OWNER/ADMIN only */}
      {canEdit && inviteLink && (
        <Card className="gap-0 py-0 shadow-none">
          <SectionTitle
            icon={LinkIcon}
            description="Share this link to invite new members. Anyone with the link can join as a member."
          >
            Team invite link
          </SectionTitle>
          <CardContent className="space-y-3 px-5 py-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="font-mono text-[12px]"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={copyInviteLink}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] text-muted-foreground">
                Regenerating will invalidate the current link.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[12px]"
                onClick={handleRegenerateInvite}
                disabled={isRegenerating}
              >
                <RefreshCw
                  className={cn(
                    "mr-1.5 h-3 w-3",
                    isRegenerating && "animate-spin",
                  )}
                />
                {isRegenerating ? "Regenerating…" : "Regenerate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
