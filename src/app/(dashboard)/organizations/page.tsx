"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Crown,
  Shield,
  User,
  Mail,
  MailCheck,
  Clock,
  ChevronRight,
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
import { useAuth } from "@/components/AuthProvider";
import type { OrganizationDetail } from "@/types/organization";
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

export default function OrganizationsPage() {
  const router = useRouter();
  const { organizations: authOrgs } = useAuth();
  const canCreateOrg =
    authOrgs.some((o) => o.role === "OWNER" || o.role === "ADMIN") ||
    authOrgs.length === 0;
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
        { ...newOrg, planTier: "FREE", createdAt: new Date().toISOString() },
      ]);
      setName("");
      setSlaEnabled(true);
      setSlaMinutes(120);
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConnectMailbox(orgId: string) {
    setConnectingOrgId(orgId);
    try {
      const { url } = await getAuthMailboxUrl("microsoft", orgId);
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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Card className="gap-0 py-0 shadow-none">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">
                {canCreateOrg
                  ? "Create your first organization"
                  : "No organizations yet"}
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {canCreateOrg
                  ? "Organizations group mailboxes and team members."
                  : "Ask an admin to invite you to one."}
              </p>
            </div>
            {canCreateOrg && (
              <form
                onSubmit={handleCreate}
                className="w-full space-y-5 pt-2 text-left"
              >
                <div className="grid gap-2">
                  <Label
                    htmlFor="org-name"
                    className="text-[12px] font-medium"
                  >
                    Organization name
                  </Label>
                  <Input
                    id="org-name"
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="sla-enabled"
                      className="text-[12px] font-medium"
                    >
                      Enable SLA tracking
                    </Label>
                    <Switch
                      id="sla-enabled"
                      checked={slaEnabled}
                      onCheckedChange={setSlaEnabled}
                      disabled={isSubmitting}
                    />
                  </div>
                  {slaEnabled && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="sla-minutes"
                        className="text-[12px] font-medium"
                      >
                        SLA target (minutes)
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="sla-minutes"
                          type="number"
                          min={1}
                          placeholder="120"
                          value={slaMinutes}
                          onChange={(e) =>
                            setSlaMinutes(Number(e.target.value))
                          }
                          disabled={isSubmitting}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-[12px] text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Creating…" : "Create organization"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            Organizations
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Manage your organizations and team access.
          </p>
        </div>
        {canCreateOrg && (
          <Dialog open={dialogOpen} onOpenChange={resetAndClose}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="text-[15px]">
                  Create organization
                </DialogTitle>
                <DialogDescription className="text-[12.5px]">
                  Organizations group mailboxes and team members.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-5">
                <div className="grid gap-2">
                  <Label
                    htmlFor="new-org-name"
                    className="text-[12px] font-medium"
                  >
                    Organization name
                  </Label>
                  <Input
                    id="new-org-name"
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="dialog-sla-enabled"
                      className="text-[12px] font-medium"
                    >
                      Enable SLA tracking
                    </Label>
                    <Switch
                      id="dialog-sla-enabled"
                      checked={slaEnabled}
                      onCheckedChange={setSlaEnabled}
                      disabled={isSubmitting}
                    />
                  </div>
                  {slaEnabled && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="dialog-sla-minutes"
                        className="text-[12px] font-medium"
                      >
                        SLA target (minutes)
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dialog-sla-minutes"
                          type="number"
                          min={1}
                          placeholder="120"
                          value={slaMinutes}
                          onChange={(e) =>
                            setSlaMinutes(Number(e.target.value))
                          }
                          disabled={isSubmitting}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-[12px] text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting ? "Creating…" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="gap-0 py-0 shadow-none">
        <ul className="divide-y divide-border">
          {orgs.map((org) => {
            const RoleIcon = roleIcons[org.role] ?? User;
            return (
              <li key={org.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/organizations/${org.id}`)}
                  className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13.5px] font-medium leading-none">
                        {org.name}
                      </p>
                      <span className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/50 px-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                        <RoleIcon className="h-2.5 w-2.5" />
                        {org.role}
                      </span>
                      <span className="inline-flex h-5 items-center rounded border border-border bg-muted/50 px-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                        {org.planTier}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                      Created {formatDate(org.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {org.mailboxConnected ? (
                      <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <MailCheck className="h-3.5 w-3.5" />
                        Connected
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-[12px]"
                        disabled={connectingOrgId === org.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectMailbox(org.id);
                        }}
                      >
                        {connectingOrgId === org.id ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Connecting…
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            Connect
                          </span>
                        )}
                      </Button>
                    )}
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5",
                      )}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
