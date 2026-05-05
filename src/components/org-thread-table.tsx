"use client";

import {
  AlertTriangle,
  Circle,
  Inbox,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  OrgDashboardThread,
  OrgThreadStatus,
} from "@/types/dashboard";

const FROM_PLACEHOLDER = "(unknown sender)";
const OWNER_PLACEHOLDER = "Unassigned";

const STATUS_BADGE_CLASSES: Record<OrgThreadStatus, string> = {
  Overdue:
    "bg-red-600 text-white border-transparent shadow-sm hover:bg-red-600/90",
  "At Risk":
    "bg-amber-500 text-white border-transparent shadow-sm hover:bg-amber-500/90",
  Open: "bg-muted text-foreground border border-border",
};

const STATUS_ICONS: Record<OrgThreadStatus, LucideIcon> = {
  Overdue: ShieldAlert,
  "At Risk": AlertTriangle,
  Open: Circle,
};

const STATUS_COUNTDOWN_CLASSES: Record<OrgThreadStatus, string> = {
  Overdue: "text-red-600",
  "At Risk": "text-amber-700",
  Open: "text-muted-foreground",
};

function rephraseSlaCountdown(formatted: string): string {
  return formatted
    .replace(/\s+past\s+SLA\s*$/i, " overdue")
    .replace(/\s+until\s+breach\s*$/i, " remaining");
}

function abbreviateOwner(name: string | null): string {
  if (!name) return OWNER_PLACEHOLDER;
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

export function OrgThreadTable({ threads }: { threads: OrgDashboardThread[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Open Threads</CardTitle>
        <CardDescription>
          Sorted by longest waiting. Status reflects the live SLA state.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {threads.length === 0 ? (
          <EmptyThreadsState />
        ) : (
          <ul className="divide-y border-t">
            {threads.map((thread) => (
              <ThreadRow key={thread.threadId} thread={thread} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyThreadsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <Inbox className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-sm font-medium">All caught up.</p>
      <p className="text-xs text-muted-foreground">
        No open threads need attention right now.
      </p>
    </div>
  );
}

function ThreadRow({ thread }: { thread: OrgDashboardThread }) {
  const StatusIcon = STATUS_ICONS[thread.status];
  return (
    <li className="px-6 py-4 transition-colors hover:bg-accent/30">
      <div className="flex flex-wrap items-start gap-3">
        <Badge
          className={cn(
            "shrink-0 gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
            STATUS_BADGE_CLASSES[thread.status],
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {thread.status}
        </Badge>
        <p
          className="min-w-0 flex-1 truncate text-sm font-medium"
          title={thread.subject}
        >
          {thread.subject}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2 pl-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <ThreadOriginBlock thread={thread} />
        <ThreadAssignmentBlock thread={thread} />
      </div>
    </li>
  );
}

function ThreadOriginBlock({ thread }: { thread: OrgDashboardThread }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p
        className={cn(
          "truncate text-xs",
          thread.from ? "text-foreground" : "italic text-muted-foreground/70",
        )}
        title={thread.from ?? undefined}
      >
        {thread.from ?? FROM_PLACEHOLDER}
      </p>
      <p
        className="truncate text-xs text-muted-foreground"
        title={
          thread.folderPath
            ? `${thread.emailAddress} · ${thread.folderPath}`
            : thread.emailAddress
        }
      >
        {thread.emailAddress}
        {thread.folderPath && ` · ${thread.folderPath}`}
      </p>
    </div>
  );
}

function ThreadAssignmentBlock({ thread }: { thread: OrgDashboardThread }) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5 sm:items-end">
      <p
        className={cn(
          "text-xs",
          thread.owner
            ? "font-medium text-foreground"
            : "italic text-muted-foreground/70",
        )}
      >
        {abbreviateOwner(thread.owner)}
      </p>
      <p
        className={cn(
          "text-xs font-semibold",
          STATUS_COUNTDOWN_CLASSES[thread.status],
        )}
      >
        {rephraseSlaCountdown(thread.slaCountdownFormatted)}
      </p>
    </div>
  );
}
