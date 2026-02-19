"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Crown, Shield, User, Mail, Clock } from "lucide-react";
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
import {
  getOrganizations,
  createOrganization,
  getAuthMailboxUrl,
} from "@/services/api";
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

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrganizationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [slaEnabled, setSlaEnabled] = useState(true);
  const [slaMinutes, setSlaMinutes] = useState(120);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectingOrgId, setConnectingOrgId] = useState<string | null>(null);

  useEffect(() => {
    getOrganizations()
      .then(setOrgs)
      .catch(() => setOrgs([]))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Organization name is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const newOrg = await createOrganization({
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
      setOrgs((prev) => [
        ...prev,
        {
          ...newOrg,
          planTier: "FREE",
          createdAt: new Date().toISOString(),
        },
      ]);
      setName("");
      setSlaEnabled(true);
      setSlaMinutes(120);
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConnectMailbox(orgId: string) {
    setConnectingOrgId(orgId);
    try {
      const { url } = await getAuthMailboxUrl("microsoft");
      window.location.href = url;
    } catch {
      setConnectingOrgId(null);
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

  if (orgs.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Create your first organization
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Organizations help you manage email accounts and collaborate
                with your team.
              </p>
            </div>
            <form onSubmit={handleCreate} className="w-full space-y-5 text-left">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Organization Details</h4>
                <div className="grid gap-2">
                  <Label htmlFor="org-name">Organization name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
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
                    checked={slaEnabled}
                    onCheckedChange={setSlaEnabled}
                    disabled={isSubmitting}
                  />
                </div>
                {slaEnabled && (
                  <div className="grid gap-2">
                    <Label htmlFor="sla-minutes">SLA response time (minutes)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sla-minutes"
                        type="number"
                        min={1}
                        placeholder="120"
                        value={slaMinutes}
                        onChange={(e) => setSlaMinutes(Number(e.target.value))}
                        disabled={isSubmitting}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  "Create organization"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organizations and team access.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={resetAndClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription>
                Add a new organization to manage email accounts and team
                members.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-5">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Organization Details</h4>
                <div className="grid gap-2">
                  <Label htmlFor="new-org-name">Organization name</Label>
                  <Input
                    id="new-org-name"
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">SLA Settings</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dialog-sla-enabled">Enable SLA tracking</Label>
                  <Switch
                    id="dialog-sla-enabled"
                    checked={slaEnabled}
                    onCheckedChange={setSlaEnabled}
                    disabled={isSubmitting}
                  />
                </div>
                {slaEnabled && (
                  <div className="grid gap-2">
                    <Label htmlFor="dialog-sla-minutes">SLA response time (minutes)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="dialog-sla-minutes"
                        type="number"
                        min={1}
                        placeholder="120"
                        value={slaMinutes}
                        onChange={(e) => setSlaMinutes(Number(e.target.value))}
                        disabled={isSubmitting}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating...
                    </span>
                  ) : (
                    "Create organization"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((org) => {
          const RoleIcon = roleIcons[org.role] ?? User;
          return (
            <Card
              key={org.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/organizations/${org.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Created {formatDate(org.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <RoleIcon className="h-3 w-3" />
                    {org.role}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {org.planTier}
                  </span>
                </div>
                {(org.role === "OWNER" || org.role === "ADMIN") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={connectingOrgId === org.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectMailbox(org.id);
                    }}
                  >
                    {connectingOrgId === org.id ? (
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
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
