"use client";

import { Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatWaitingTime } from "@/lib/utils";
import type { OpenThread } from "@/types/dashboard";

export function OpenThreadRow({ thread }: { thread: OpenThread }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium" title={thread.subject}>
          {thread.subject}
        </p>
        <ThreadLocation
          emailAddress={thread.emailAddress}
          folderPath={thread.folderPath}
        />
        {thread.ownerName && <ThreadOwner ownerName={thread.ownerName} />}
      </div>
      <WaitingBadge thread={thread} />
    </li>
  );
}

function ThreadLocation({
  emailAddress,
  folderPath,
}: {
  emailAddress: string;
  folderPath: string | null;
}) {
  const display = folderPath ? `${emailAddress} · ${folderPath}` : emailAddress;
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <Mail className="h-3 w-3 shrink-0" />
      <span className="truncate" title={display}>
        {display}
      </span>
    </p>
  );
}

function ThreadOwner({ ownerName }: { ownerName: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <User className="h-3 w-3 shrink-0" />
      <span className="truncate">{ownerName}</span>
    </p>
  );
}

function WaitingBadge({ thread }: { thread: OpenThread }) {
  const waitingClasses = cn(
    "shrink-0 text-xs font-semibold",
    thread.isPastSla
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : thread.isAtRisk
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-muted text-muted-foreground",
  );
  return (
    <Badge className={waitingClasses}>
      {formatWaitingTime(thread.minutesWaiting)}
    </Badge>
  );
}
