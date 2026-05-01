"use client";

import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Activity,
  Hourglass,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/utils";
import { type ActivityItem } from "@/types/dashboard";

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "overdue":
    case "breach":
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    case "at_risk":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "late_response":
      return <Hourglass className="h-4 w-4 text-amber-500" />;
    case "covered":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "dismissed":
      return <Trash2 className="h-4 w-4 text-muted-foreground" />;
    case "sync_success":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case "sync_failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function activityAccent(type: ActivityItem["type"]) {
  switch (type) {
    case "overdue":
    case "breach":
      return "border-l-red-500";
    case "at_risk":
      return "border-l-amber-500";
    case "late_response":
      return "border-l-amber-400";
    case "covered":
      return "border-l-emerald-500";
    case "dismissed":
      return "border-l-border";
    case "sync_success":
      return "border-l-blue-500";
    case "sync_failed":
      return "border-l-red-400";
  }
}

function activityDetail(item: ActivityItem) {
  switch (item.type) {
    case "overdue":
      return (
        <span className="text-red-600 font-medium">
          {formatMinutes(item.minutesOverdue)} overdue · awaiting reply
        </span>
      );
    case "breach":
      return (
        <span className="text-red-600 font-medium">
          {formatMinutes(item.minutesOverdue)} overdue
        </span>
      );
    case "at_risk":
      return (
        <span className="text-amber-600 font-medium">
          {formatMinutes(item.minutesRemaining)} remaining
        </span>
      );
    case "late_response":
      return (
        <span className="text-amber-600 font-medium">
          replied {formatMinutes(item.minutesOverdue)} past SLA
          {item.responseMinutes
            ? ` · took ${formatMinutes(item.responseMinutes)}`
            : ""}
        </span>
      );
    case "covered":
      return (
        <span className="text-emerald-600">
          {typeof item.responseMinutes === "number"
            ? `Replied · ${formatMinutes(item.responseMinutes)}`
            : "Replied"}
        </span>
      );
    case "dismissed":
      return <span className="text-muted-foreground">Deleted</span>;
    case "sync_success":
    case "sync_failed":
      return (
        <span className="text-muted-foreground">{item.emailAddress}</span>
      );
  }
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No activity in this period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
        <Badge variant="secondary" className="text-xs font-medium">
          {items.length}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4 pt-0">
        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={`${item.type}-${item.timestamp}-${idx}`}
              className={cn(
                "flex items-start gap-3 rounded-lg border-l-[3px] bg-muted/30 px-3 py-2.5",
                activityAccent(item.type)
              )}
            >
              <div className="mt-0.5 shrink-0">{activityIcon(item.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-snug">
                  {"subject" in item ? (
                    <>
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        &middot; {item.ownerName}
                      </span>
                    </>
                  ) : (
                    <span>{item.message}</span>
                  )}
                </p>
                {"subject" in item && item.folderPath && (
                  <p
                    className="truncate text-xs text-muted-foreground/80"
                    title={item.folderPath}
                  >
                    {item.folderPath}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {activityDetail(item)}
                  <span className="text-muted-foreground">
                    &middot; {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
