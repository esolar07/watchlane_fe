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

// ── Date presets ──

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

// ── Clickable org row ──

function OrgRow({ org }: { org: CoverageMetrics }) {
  const pct = org.compliancePercent;
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium leading-none">
                {org.organizationName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                SLA: {formatMinutes(org.slaTarget)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <Badge
              variant="outline"
              className={cn("text-xs font-semibold", complianceBadge(pct))}
            >
              {pct.toFixed(1)}%
            </Badge>
            <Metric label="Inbound" value={org.totalInbound} />
            <Metric
              label="Covered"
              value={org.coveredWithinSla}
              className="text-emerald-600"
            />
            <Metric
              label="Breaches"
              value={org.breaches}
              className={org.breaches > 0 ? "text-red-600" : undefined}
            />
            <Metric
              label="At Risk"
              value={org.atRisk}
              className={org.atRisk > 0 ? "text-amber-600" : undefined}
            />
            <Metric
              label="Avg Resp."
              value={formatMinutes(org.avgResponseMinutes)}
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            href={`/organizations/${org.organizationId}/coverage`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View organization details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ──

export default function DashboardPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("7d");

  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset]
  );

  const { data, isLoading, error } = useCoverageMetrics({ startDate, endDate });

  const agg = useMemo(() => aggregate(data), [data]);
  const slaTarget = data.length === 1 ? data[0].slaTarget : null;

  return (
    <div className="space-y-6">
      {/* ── Sticky header + date filter ── */}
      <div className="sticky top-0 z-10 -mx-1 bg-background/95 px-1 pb-4 pt-1 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <div className="flex items-center rounded-lg border bg-card p-0.5">
            {presets.map((p) => (
              <Button
                key={p.value}
                variant={datePreset === p.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setDatePreset(p.value)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-medium",
                  datePreset !== p.value && "text-muted-foreground"
                )}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <CoverageSkeleton />
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : agg.totalInbound === 0 ? (
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
      ) : (
        <>
          {/* KPI cards */}
          <KpiCards data={agg} slaTarget={slaTarget} />

          {/* Breakdown + donut */}
          <BreakdownSection data={agg} />

          {/* Per-org list */}
          {data.length > 1 && (
            <section aria-label="Per-organization breakdown">
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                By Organization
              </h2>
              <div className="space-y-3">
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
