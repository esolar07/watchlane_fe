"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, AlertOctagon, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrgCoverageDetail } from "@/hooks/useOrgCoverageDetail";
import {
  KpiCards,
  BreakdownSection,
  CoverageSkeleton,
} from "@/components/coverage-metrics";
import { ActivityFeed } from "@/components/activity-feed";
import { OrgTabNav } from "@/components/org-tab-nav";

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

  switch (preset) {
    case "today":
      break;
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "90d":
      start.setDate(start.getDate() - 89);
      break;
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export default function OrgCoveragePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orgId = params?.id ?? "";

  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset]
  );

  const { data, isLoading, error } = useOrgCoverageDetail({
    orgId,
    startDate,
    endDate,
  });

  const dateFilter = (
    <div className="flex items-center rounded-lg border bg-card p-0.5">
      {presets.map((p) => (
        <Button
          key={p.value}
          variant={datePreset === p.value ? "default" : "ghost"}
          size="sm"
          onClick={() => setDatePreset(p.value)}
          className={cn(
            "h-7 rounded-md px-3 text-xs font-medium",
            datePreset !== p.value && "text-muted-foreground"
          )}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data?.organizationName ?? "Organization"}
          </h1>
        </div>
      </div>

      {/* ── Tab nav with date filter ── */}
      <OrgTabNav orgId={orgId} rightSlot={dateFilter} />

      {/* ── Coverage content ── */}
      {isLoading ? (
        <CoverageSkeleton />
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : data && data.totalInbound === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">
              No inbound threads in this period
            </h3>
            <p className="text-sm text-muted-foreground">
              Try selecting a different date range.
            </p>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <KpiCards data={data} slaTarget={data.slaTarget} />

          {/* Two-column: breakdown + activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownSection data={data} />
            <ActivityFeed items={data.recentActivity} />
          </div>
        </>
      ) : null}
    </div>
  );
}
