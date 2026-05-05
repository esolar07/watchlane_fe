"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";
import type { LateResponseThread } from "@/types/dashboard";

const FALLBACK_FOLDER = "Inbox";
const OWNER_PLACEHOLDER = "Unassigned";

function safeFolder(folderPath: string | null): string {
  if (!folderPath || folderPath === "Sent Items") return FALLBACK_FOLDER;
  return folderPath;
}

function abbreviateOwner(name: string | null | undefined): string {
  if (!name) return OWNER_PLACEHOLDER;
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

export function LateResponseTable({
  threads,
}: {
  threads: LateResponseThread[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Late Replies</CardTitle>
        <CardDescription>
          Threads where the first reply landed past the SLA window.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {threads.length === 0 ? (
          <p className="px-6 py-3 text-sm text-muted-foreground">
            No late replies in this period. 🎉
          </p>
        ) : (
          <LateResponseRows threads={threads} />
        )}
      </CardContent>
    </Card>
  );
}

function LateResponseRows({ threads }: { threads: LateResponseThread[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y bg-muted/30 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-2.5">Thread</th>
            <th className="px-3 py-2.5">Owner</th>
            <th className="px-3 py-2.5 text-right">Response Time</th>
            <th className="px-3 py-2.5 pr-6 text-right">Over SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {threads.map((thread) => (
            <LateResponseRow key={thread.threadId} thread={thread} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LateResponseRow({ thread }: { thread: LateResponseThread }) {
  return (
    <tr className="hover:bg-accent/30">
      <td className="px-6 py-3 align-top">
        <p className="font-medium" title={thread.subject}>
          {thread.subject}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {thread.emailAddress} · {safeFolder(thread.folderPath)}
        </p>
      </td>
      <td className="px-3 py-3 align-top text-sm text-muted-foreground">
        {abbreviateOwner(thread.ownerName)}
      </td>
      <td className="px-3 py-3 text-right align-top">
        <span className="font-medium">
          {formatMinutes(thread.firstResponseMinutes)}
        </span>
        <span className="ml-1 text-xs text-muted-foreground">response</span>
      </td>
      <td className="px-3 py-3 pr-6 text-right align-top">
        <span className="font-medium text-amber-700 dark:text-amber-400">
          {formatMinutes(thread.minutesOverdue)}
        </span>
        <span className="ml-1 text-xs text-muted-foreground">late</span>
      </td>
    </tr>
  );
}
