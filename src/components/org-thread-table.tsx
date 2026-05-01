"use client";

import { Folder, Inbox, Mail, User } from "lucide-react";
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
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "At Risk":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Open: "bg-muted text-muted-foreground",
};

const STATUS_COUNTDOWN_CLASSES: Record<OrgThreadStatus, string> = {
  Overdue: "text-red-600",
  "At Risk": "text-amber-700",
  Open: "text-muted-foreground",
};

export function OrgThreadTable({ threads }: { threads: OrgDashboardThread[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Open Threads</CardTitle>
        <CardDescription>
          Sorted oldest-waiting first. Status reflects the live SLA state.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {threads.length === 0 ? <EmptyThreadsState /> : <ThreadRows threads={threads} />}
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

function ThreadRows({ threads }: { threads: OrgDashboardThread[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y bg-muted/30 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-2.5">Status</th>
            <th className="px-3 py-2.5">Thread</th>
            <th className="px-3 py-2.5">From</th>
            <th className="px-3 py-2.5">Owner</th>
            <th className="px-3 py-2.5 pr-6 text-right">SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {threads.map((thread) => (
            <ThreadRow key={thread.threadId} thread={thread} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThreadRow({ thread }: { thread: OrgDashboardThread }) {
  return (
    <tr className="hover:bg-accent/30">
      <td className="px-6 py-3 align-top">
        <Badge className={cn("text-xs font-medium", STATUS_BADGE_CLASSES[thread.status])}>
          {thread.status}
        </Badge>
      </td>
      <td className="px-3 py-3 align-top">
        <p className="font-medium" title={thread.subject}>
          {thread.subject}
        </p>
        <ThreadLocation
          emailAddress={thread.emailAddress}
          folderPath={thread.folderPath}
        />
      </td>
      <td className="px-3 py-3 align-top text-muted-foreground">
        {thread.from ?? (
          <span className="italic text-muted-foreground/70">
            {FROM_PLACEHOLDER}
          </span>
        )}
      </td>
      <td className="px-3 py-3 align-top text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {thread.owner ?? OWNER_PLACEHOLDER}
        </span>
      </td>
      <td
        className={cn(
          "px-3 py-3 pr-6 text-right align-top text-xs font-medium",
          STATUS_COUNTDOWN_CLASSES[thread.status],
        )}
      >
        {thread.slaCountdownFormatted}
      </td>
    </tr>
  );
}

function ThreadLocation({
  emailAddress,
  folderPath,
}: {
  emailAddress: string;
  folderPath: string | null;
}) {
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Mail className="h-3 w-3 shrink-0" />
      <span className="truncate">{emailAddress}</span>
      {folderPath && (
        <>
          <Folder className="h-3 w-3 shrink-0" />
          <span className="truncate">{folderPath}</span>
        </>
      )}
    </p>
  );
}
