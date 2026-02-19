"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  Crown,
  Pencil,
  Shield,
  User,
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
import { getOrganization, updateOrganization } from "@/services/api";
import type { OrganizationDetail } from "@/types/organization";

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

export default function OrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSlaEnabled, setEditSlaEnabled] = useState(false);
  const [editSlaMinutes, setEditSlaMinutes] = useState(120);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    getOrganization(params.id)
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
  }, [params?.id]);

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
    if (!org || !params?.id) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Organization name is required.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const updated = await updateOrganization(params.id, {
        name: trimmed,
        settings: {
          slaEnabled: editSlaEnabled,
          slaMinutes: editSlaMinutes,
        },
      });
      setOrg(updated);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !org) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Organization not found</h2>
        <p className="text-sm text-muted-foreground">
          The organization you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
        <Button variant="outline" onClick={() => router.push("/organizations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to organizations
        </Button>
      </div>
    );
  }

  const RoleIcon = roleIcons[org.role] ?? User;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/organizations")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created {formatDate(org.createdAt)}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Details</CardTitle>
            <CardDescription>
              General information about your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Organization name</Label>
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
                <span className="font-medium">{org.name}</span>
              </div>
            )}
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <RoleIcon className="h-3 w-3" />
                {org.role}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {org.planTier}
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
                    org.settings.slaEnabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {org.settings.slaEnabled ? "Enabled" : "Disabled"}
                </span>
              )}
            </div>

            {(isEditing ? editSlaEnabled : org.settings.slaEnabled) && (
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
                    <span>{org.settings.slaMinutes} minutes</span>
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
    </div>
  );
}
