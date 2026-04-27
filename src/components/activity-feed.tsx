"use client";

import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/utils";
import { type ActivityItem } from "@/types/dashboard";

const ACTIVITY_PRIORITY: Record<string, number> = {
  breach: 0,
  at_risk: 1,
  covered: 2,
  sync_failed: 3,
  sync_success: 4,
};

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "breach":
      return <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
    case "at_risk":
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
    case "covered":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    case "sync_success":
      return <RefreshCw className="h-3.5 w-3.5 text-primary" />;
    case "sync_failed":
      return <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
  }
}

function dotColor(type: ActivityItem["type"]) {
  switch (type) {
    case "breach":       return "bg-red-500";
    case "at_risk":      return "bg-amber-500";
    case "covered":      return "bg-emerald-500";
    case "sync_success": return "bg-primary";
    case "sync_failed":  return "bg-red-400";
  }
}

function activityDetail(item: ActivityItem) {
  switch (item.type) {
    case "breach":
      return (
        <span className="font-medium text-red-600 dark:text-red-400">
          {formatMinutes(item.minutesOverdue)} overdue
        </span>
      );
    case "at_risk":
      return (
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {formatMinutes(item.minutesRemaining)} left
        </span>
      );
    case "covered":
      return (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {formatMinutes(item.responseMinutes)}
        </span>
      );
    case "sync_success":
    case "sync_failed":
      return <span className="text-muted-foreground">{item.emailAddress}</span>;
  }
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "1d";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sortActivities(items: ActivityItem[]): ActivityItem[] {
  return [...items].sort((a, b) => {
    const pa = ACTIVITY_PRIORITY[a.type] ?? 99;
    const pb = ACTIVITY_PRIORITY[b.type] ?? 99;
    if (pa !== pb) return pa - pb;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const sorted = sortActivities(items);

  if (sorted.length === 0) {
    return (
      <Card className="gap-0 py-0 shadow-none">
        <CardHeader className="border-b border-border px-5 py-3.5">
          <CardTitle className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[13px] text-muted-foreground">
              No activity in this period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-0 py-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-5 py-3.5">
        <CardTitle className="flex items-center gap-1.5 text-[13px] font-semibold">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <Badge variant="outline" className="h-5 rounded-md border-border px-1.5 text-[10.5px] font-medium tabular-nums text-muted-foreground">
          {sorted.length}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 px-2 py-2">
        <div className="max-h-[480px] space-y-px overflow-y-auto pr-1">
          {sorted.map((item, idx) => (
            <div
              key={`${item.type}-${item.timestamp}-${idx}`}
              className="group flex items-start gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
            >
              <div className="relative mt-1 shrink-0">
                <span className={cn("absolute -left-0.5 -top-0.5 h-4 w-4 rounded-full opacity-15", dotColor(item.type))} />
                <div className="relative">{activityIcon(item.type)}</div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug">
                  {"subject" in item ? (
                    <>
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-muted-foreground"> · {item.ownerName}</span>
                    </>
                  ) : (
                    <span>{item.message}</span>
                  )}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px]">
                  {activityDetail(item)}
                  <span className="text-muted-foreground/70">·</span>
                  <span className="tabular-nums text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
