"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Activity as ActivityIcon,
  AlertOctagon,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrgDashboard } from "@/hooks/useOrgDashboard";
import { ActivityFeed } from "@/components/activity-feed";
import { NeedsAttentionKpis } from "@/components/needs-attention-kpis";
import { OrgPerformanceTile } from "@/components/org-performance-tile";
import { OrgThreadTable } from "@/components/org-thread-table";
import { OrgTabNav } from "@/components/org-tab-nav";
import type { OrgDashboard } from "@/types/dashboard";

type DatePreset = "today" | "7d" | "30d" | "90d";

const presets: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

function getDateRange(preset: DatePreset) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (preset === "7d") start.setDate(start.getDate() - 6);
  if (preset === "30d") start.setDate(start.getDate() - 29);
  if (preset === "90d") start.setDate(start.getDate() - 89);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export default function OrgOperationalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orgId = params?.id ?? "";

  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset],
  );

  const { data, isLoading, error, refetch } = useOrgDashboard({
    orgId,
    startDate,
    endDate,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        organizationName={data?.organizationName}
        onBack={() => router.push("/dashboard")}
      />
      <OrgTabNav
        orgId={orgId}
        rightSlot={
          <TabRightSlot
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            onRefresh={refetch}
            isRefreshing={isLoading}
          />
        }
      />
      <DashboardBody data={data} isLoading={isLoading} error={error} />
    </div>
  );
}

function PageHeader({
  organizationName,
  onBack,
}: {
  organizationName?: string;
  onBack: () => void;
}) {
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
            {organizationName ?? "Operational"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Live snapshot · period filter only affects the Performance tile.
          </p>
        </div>
      </div>
    </div>
  );
}

interface TabRightSlotProps {
  datePreset: DatePreset;
  onDatePresetChange: (next: DatePreset) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function TabRightSlot({
  datePreset,
  onDatePresetChange,
  onRefresh,
  isRefreshing,
}: TabRightSlotProps) {
  return (
    <div className="flex items-center gap-2">
      <DateFilter value={datePreset} onChange={onDatePresetChange} />
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={cn("mr-1.5 h-3.5 w-3.5", isRefreshing && "animate-spin")}
        />
        Refresh
      </Button>
    </div>
  );
}

function DateFilter({
  value,
  onChange,
}: {
  value: DatePreset;
  onChange: (next: DatePreset) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-card p-0.5">
      {presets.map((p) => (
        <Button
          key={p.value}
          variant={value === p.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(p.value)}
          className={cn(
            "h-7 rounded-md px-3 text-xs font-medium",
            value !== p.value && "text-muted-foreground",
          )}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}

function DashboardBody({
  data,
  isLoading,
  error,
}: {
  data: OrgDashboard | null;
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;
  return (
    <>
      <LastSyncedLine lastSyncAt={data.lastSyncAt} />
      <NeedsAttentionKpis kpis={data.kpis} />
      <OrgThreadTable threads={data.threads} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed items={data.activity} />
        </div>
        <OrgPerformanceTile performance={data.performance} />
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

function LastSyncedLine({ lastSyncAt }: { lastSyncAt: string }) {
  const [label, setLabel] = useState(() => formatRelative(lastSyncAt));
  useEffect(() => {
    const timer = setInterval(
      () => setLabel(formatRelative(lastSyncAt)),
      30_000,
    );
    return () => clearInterval(timer);
  }, [lastSyncAt]);
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ActivityIcon className="h-3 w-3" />
      Last synced {label}
    </p>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}
