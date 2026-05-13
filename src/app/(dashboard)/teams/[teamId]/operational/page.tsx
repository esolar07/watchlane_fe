"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertOctagon,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";
import { ActivityFeed } from "@/components/activity-feed";
import { NeedsAttentionKpis } from "@/components/needs-attention-kpis";
import { TeamPerformanceTile } from "@/components/team-performance-tile";
import { TeamThreadTable } from "@/components/team-thread-table";
import { TeamTabNav } from "@/components/team-tab-nav";
import { getDateRange, type DatePreset } from "@/lib/date-presets";
import type { TeamDashboard } from "@/types/dashboard";

export default function TeamOperationalPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const teamId = params?.teamId ?? "";

  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset],
  );

  const { data, isLoading, error, refetch } = useTeamDashboard({
    teamId,
    startDate,
    endDate,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        teamName={data?.teamName}
        lastSyncAt={data?.lastSyncAt}
        onBack={() => router.push("/dashboard")}
      />
      <TeamTabNav
        teamId={teamId}
        rightSlot={
          <RefreshButton onClick={refetch} isRefreshing={isLoading} />
        }
      />
      <DashboardBody
        data={data}
        isLoading={isLoading}
        error={error}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
      />
    </div>
  );
}

function PageHeader({
  teamName,
  lastSyncAt,
  onBack,
}: {
  teamName?: string;
  lastSyncAt?: string;
  onBack: () => void;
}) {
  const lastSyncedLabel = useLastSyncedLabel(lastSyncAt);
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {teamName ?? "Operational"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Live snapshot
            {lastSyncedLabel && ` · Last synced ${lastSyncedLabel}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function useLastSyncedLabel(lastSyncAt?: string): string | null {
  const [label, setLabel] = useState<string | null>(() =>
    lastSyncAt ? formatRelative(lastSyncAt) : null,
  );
  useEffect(() => {
    if (!lastSyncAt) {
      setLabel(null);
      return;
    }
    setLabel(formatRelative(lastSyncAt));
    const timer = setInterval(
      () => setLabel(formatRelative(lastSyncAt)),
      30_000,
    );
    return () => clearInterval(timer);
  }, [lastSyncAt]);
  return label;
}

function RefreshButton({
  onClick,
  isRefreshing,
}: {
  onClick: () => void;
  isRefreshing: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isRefreshing}
    >
      <RefreshCw
        className={cn("mr-1.5 h-3.5 w-3.5", isRefreshing && "animate-spin")}
      />
      Refresh
    </Button>
  );
}

function DashboardBody({
  data,
  isLoading,
  error,
  datePreset,
  onDatePresetChange,
}: {
  data: TeamDashboard | null;
  isLoading: boolean;
  error: string | null;
  datePreset: DatePreset;
  onDatePresetChange: (next: DatePreset) => void;
}) {
  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;
  return (
    <>
      <NeedsAttentionKpis kpis={data.kpis} />
      <TeamThreadTable threads={data.threads} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed items={data.activity} />
        </div>
        <TeamPerformanceTile
          performance={data.performance}
          datePreset={datePreset}
          onDatePresetChange={onDatePresetChange}
        />
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-center gap-3 py-6">
        <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}
