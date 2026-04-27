"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Inbox,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoverageMetrics } from "@/hooks/useCoverageMetrics";
import { cn, formatMinutes } from "@/lib/utils";
import { type CoverageMetrics } from "@/types/dashboard";
import {
  aggregate,
  complianceBadge,
  KpiCards,
  BreakdownSection,
  CoverageSkeleton,
  Metric,
} from "@/components/coverage-metrics";

type DatePreset = "today" | "7d" | "30d" | "90d";

const presets: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
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

function OrgRow({ org }: { org: CoverageMetrics }) {
  const pct = org.compliancePercent;
  return (
    <Link
      href={`/organizations/${org.organizationId}/coverage`}
      className="group block"
    >
      <Card className="gap-0 border-border py-0 shadow-none transition-colors hover:bg-muted/40">
        <CardContent className="px-4 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium leading-none">
                  {org.organizationName}
                </p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  SLA · {formatMinutes(org.slaTarget)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Badge
                variant="outline"
                className={cn(
                  "h-6 rounded-md border px-2 text-[11.5px] font-semibold tabular-nums",
                  complianceBadge(pct),
                )}
              >
                {pct.toFixed(1)}%
              </Badge>
              <Metric label="Inbound" value={org.totalInbound} />
              <Metric
                label="Covered"
                value={org.coveredWithinSla}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <Metric
                label="Breaches"
                value={org.breaches}
                className={
                  org.breaches > 0 ? "text-red-600 dark:text-red-400" : undefined
                }
              />
              <Metric
                label="At Risk"
                value={org.atRisk}
                className={
                  org.atRisk > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : undefined
                }
              />
              <Metric
                label="Avg Resp"
                value={formatMinutes(org.avgResponseMinutes)}
              />
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset],
  );
  const { data, isLoading, error } = useCoverageMetrics({ startDate, endDate });
  const agg = useMemo(() => aggregate(data), [data]);
  const slaTarget = data.length === 1 ? data[0].slaTarget : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            SLA coverage and response performance.
          </p>
        </div>

        <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
          {presets.map((p) => (
            <Button
              key={p.value}
              variant={datePreset === p.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDatePreset(p.value)}
              className={cn(
                "h-7 rounded px-3 text-[12px] font-medium",
                datePreset !== p.value &&
                  "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <CoverageSkeleton />
      ) : error ? (
        <Card className="gap-0 border-destructive/30 bg-destructive/5 py-0 shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertOctagon className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-[13px] text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : agg.totalInbound === 0 ? (
        <Card className="gap-0 py-0 shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-[14px] font-medium">
              No inbound threads in this period
            </h3>
            <p className="text-[13px] text-muted-foreground">
              Try a different date range.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <KpiCards data={agg} slaTarget={slaTarget} />
          <BreakdownSection data={agg} />

          {data.length > 1 && (
            <section
              aria-label="Per-organization breakdown"
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  By Organization
                </h2>
                <span className="wl-num text-[11.5px] tabular-nums text-muted-foreground">
                  {data.length}
                </span>
              </div>
              <div className="space-y-2">
                {data.map((org) => (
                  <OrgRow key={org.organizationId} org={org} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
