"use client";

import { Mail, User, Folder } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";
import type { LateResponseThread } from "@/types/dashboard";

export function LateResponseTable({
  threads,
}: {
  threads: LateResponseThread[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Late responses</CardTitle>
        <CardDescription>
          Threads where the first reply landed past the SLA window.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {threads.length === 0 ? (
          <p className="px-6 py-3 text-sm text-muted-foreground">
            No late responses in this period. 🎉
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
            <th className="px-3 py-2.5 text-right">Response time</th>
            <th className="px-3 py-2.5 pr-6 text-right">Past SLA</th>
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
      <td className="px-6 py-3">
        <p className="font-medium" title={thread.subject}>
          {thread.subject}
        </p>
        <ThreadLocation
          emailAddress={thread.emailAddress}
          folderPath={thread.folderPath}
        />
      </td>
      <td className="px-3 py-3 text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {thread.ownerName}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        {formatMinutes(thread.firstResponseMinutes)}
      </td>
      <td className="px-3 py-3 pr-6 text-right font-medium text-amber-700 dark:text-amber-400">
        {formatMinutes(thread.minutesOverdue)}
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
