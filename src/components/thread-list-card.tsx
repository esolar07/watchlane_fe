"use client";

import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OpenThreadRow } from "@/components/open-thread-row";
import type { OpenThread } from "@/types/dashboard";

export type ThreadListAccent = "red" | "amber" | "neutral";

interface ThreadListCardProps {
  title: string;
  icon: LucideIcon;
  threads: OpenThread[];
  accent: ThreadListAccent;
  emptyMessage: string;
  count?: number;
}

export function ThreadListCard({
  title,
  icon: Icon,
  threads,
  accent,
  emptyMessage,
  count,
}: ThreadListCardProps) {
  const total = count ?? threads.length;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <CountBadge count={total} accent={accent} />
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {threads.length === 0 ? (
          <EmptyMessage message={emptyMessage} />
        ) : (
          <ul className="divide-y">
            {threads.map((thread) => (
              <OpenThreadRow key={thread.threadId} thread={thread} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function CountBadge({
  count,
  accent,
}: {
  count: number;
  accent: ThreadListAccent;
}) {
  const isHot = count > 0 && accent !== "neutral";
  const classes = cn(
    "text-xs font-medium",
    isHot && accent === "red"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : isHot && accent === "amber"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-muted text-muted-foreground",
  );
  return <Badge className={classes}>{count}</Badge>;
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <p className="px-4 py-3 text-sm text-muted-foreground">{message}</p>
  );
}
