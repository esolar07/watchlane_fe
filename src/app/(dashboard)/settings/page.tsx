"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LimitBadge } from "@/components/LimitBadge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useMe } from "@/hooks/useMe";
import { humanizeFeatureKey } from "@/types/plan";
import type { BooleanFeatureKey, LimitFeatureKey } from "@/types/entitlements";

const BOOLEAN_FEATURE_KEYS: BooleanFeatureKey[] = [
  "weekly_reports",
  "folder_monitoring",
  "priority_support",
];

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();
  const { entitlements, isLoading } = useEntitlements();
  const { user } = useMe();

  if (isLoading && !entitlements) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your workspace, current plan, and usage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>The workspace these settings apply to.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1">
          <span className="text-sm font-medium">{activeWorkspace?.name ?? "—"}</span>
          {activeWorkspace && (
            <span className="text-xs text-muted-foreground">Role: {activeWorkspace.role}</span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Your current plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{user?.currentPlan.name ?? "—"}</span>
            {user && (
              <Badge variant="outline" className="text-xs">{user.currentPlan.slug}</Badge>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <UsageRow label="Mailboxes" feature="mailbox_limit" />
            <UsageRow label="Teams" feature="team_limit" />
            <UsageRow label="History" feature="history_days" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Capabilities enabled on your plan.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {BOOLEAN_FEATURE_KEYS.map((key) => {
            const enabled = entitlements?.features[key] ?? false;
            return (
              <Badge
                key={key}
                variant={enabled ? "default" : "outline"}
                className={enabled ? "" : "text-muted-foreground"}
              >
                {humanizeFeatureKey(key)}
              </Badge>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageRow({ label, feature }: { label: string; feature: LimitFeatureKey }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1">
        <LimitBadge feature={feature} />
      </div>
    </div>
  );
}
