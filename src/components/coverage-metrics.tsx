"use client";

import type { ReactNode } from "react";
import { Target, CheckCircle2, Clock, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn, formatMinutes } from "@/lib/utils";
import { type CoverageMetrics } from "@/types/dashboard";

// ── Helpers ──

export function aggregate(items: CoverageMetrics[]) {
  const totalInbound = items.reduce((s, i) => s + i.totalInbound, 0);
  const coveredWithinSla = items.reduce((s, i) => s + i.coveredWithinSla, 0);
  const breaches = items.reduce((s, i) => s + i.breaches, 0);
  const atRisk = items.reduce((s, i) => s + i.atRisk, 0);
  const openCount = items.reduce((s, i) => s + (i.openCount ?? 0), 0);
  const overdueCount = items.reduce((s, i) => s + (i.overdueCount ?? 0), 0);
  const compliancePercent =
    totalInbound > 0 ? (coveredWithinSla / totalInbound) * 100 : 0;
  const avgResponseMinutes =
    totalInbound > 0
      ? items.reduce((s, i) => s + i.avgResponseMinutes * i.totalInbound, 0) /
        totalInbound
      : 0;
  const oldestUncoveredMinutes = Math.max(
    ...items.map((i) => i.oldestUncoveredMinutes),
    0
  );
  return {
    totalInbound,
    coveredWithinSla,
    breaches,
    atRisk,
    openCount,
    overdueCount,
    compliancePercent,
    avgResponseMinutes,
    oldestUncoveredMinutes,
  };
}

export function complianceColor(percent: number) {
  if (percent >= 90) return "text-emerald-600";
  if (percent >= 70) return "text-amber-500";
  return "text-red-500";
}

export function complianceBg(percent: number) {
  if (percent >= 90) return "bg-emerald-50 border-emerald-200";
  if (percent >= 70) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function complianceBadge(percent: number) {
  if (percent >= 90)
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (percent >= 70) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

// ── Donut chart ──

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

export function donutSegments(d: {
  coveredWithinSla: number;
  atRisk: number;
  breaches: number;
}): DonutSegment[] {
  return [
    { value: d.coveredWithinSla, color: "#10b981", label: "Covered" },
    { value: d.atRisk, color: "#f59e0b", label: "At Risk" },
    { value: d.breaches, color: "#ef4444", label: "Breached" },
  ];
}

export function DonutChart({
  segments,
  total,
  size = 160,
}: {
  segments: DonutSegment[];
  total: number;
  size?: number;
}) {
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted/50"
          strokeWidth={strokeWidth}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-muted-foreground text-xs"
        >
          No data
        </text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const pct = seg.value / total;
        const dashLength = pct * circumference;
        const dashOffset = -cumulativeOffset * circumference;
        cumulativeOffset += pct;
        if (seg.value === 0) return null;
        return (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-bold"
        style={{ fontSize: 28 }}
      >
        {total}
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-muted-foreground"
        style={{ fontSize: 11 }}
      >
        threads
      </text>
    </svg>
  );
}

// ── KPI cards ──

export function KpiCards({
  data,
  slaTarget,
}: {
  data: {
    compliancePercent: number;
    avgResponseMinutes: number;
    oldestUncoveredMinutes: number;
  };
  slaTarget: number | null;
}) {
  return (
    <section aria-label="Key performance indicators">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <HelpTooltip
                label="SLA Target"
                description="Maximum time your team has to respond to an inbound email."
                helpLink="/help#sla"
              />
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">
              {slaTarget !== null ? formatMinutes(slaTarget) : "Varies"}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "border transition-shadow hover:shadow-md",
            complianceBg(data.compliancePercent)
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <HelpTooltip
                label="Coverage"
                description="Percentage of inbound threads that received a reply within the SLA window."
                helpLink="/help#coverage"
              />
            </CardTitle>
            <CheckCircle2
              className={cn(
                "h-4 w-4",
                complianceColor(data.compliancePercent)
              )}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <p
              className={cn(
                "text-2xl font-bold",
                complianceColor(data.compliancePercent)
              )}
            >
              {data.compliancePercent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <HelpTooltip
                label="Avg Response Time"
                description="The average time it takes your team to send the first reply to an inbound email."
                helpLink="/help#response-time"
              />
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">
              {formatMinutes(data.avgResponseMinutes)}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <HelpTooltip
                label="Oldest Gap"
                description="The longest-running thread that has not yet received a reply."
                helpLink="/help#oldest-gap"
              />
            </CardTitle>
            <Timer
              className={cn(
                "h-4 w-4",
                slaTarget !== null &&
                  data.oldestUncoveredMinutes > slaTarget
                  ? "text-red-500"
                  : "text-muted-foreground"
              )}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <p
              className={cn(
                "text-2xl font-bold",
                slaTarget !== null &&
                  data.oldestUncoveredMinutes > slaTarget &&
                  "text-red-500"
              )}
            >
              {data.oldestUncoveredMinutes > 0
                ? formatMinutes(data.oldestUncoveredMinutes)
                : "---"}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ── Thread Distribution card (donut + stat rows) ──

function pct(value: number, total: number) {
  if (total === 0) return "0";
  return ((value / total) * 100).toFixed(0);
}

export function BreakdownSection({
  data,
}: {
  data: {
    totalInbound: number;
    coveredWithinSla: number;
    breaches: number;
    atRisk: number;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Thread Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          {/* Donut */}
          <div className="shrink-0">
            <DonutChart
              total={data.totalInbound}
              segments={donutSegments(data)}
            />
          </div>

          {/* Stat rows */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <HelpTooltip
                  label="Covered Within SLA"
                  description="Inbound threads that received a reply before the SLA window expired."
                  helpLink="/help#coverage"
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-emerald-600">
                  {data.coveredWithinSla}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pct(data.coveredWithinSla, data.totalInbound)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                <HelpTooltip
                  label="Breaches"
                  description="Threads that exceeded the SLA without a reply."
                  helpLink="/help#breach"
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-red-600">
                  {data.breaches}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pct(data.breaches, data.totalInbound)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                <HelpTooltip
                  label="At Risk"
                  description="Threads approaching the SLA window that have not yet been replied to."
                  helpLink="/help#at-risk"
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-amber-600">
                  {data.atRisk}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pct(data.atRisk, data.totalInbound)}%)
                </span>
              </div>
            </div>

            <div className="border-t pt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>Total inbound</span>
              <span className="font-semibold text-foreground">
                {data.totalInbound}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Loading skeleton ──

export function CoverageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Inline metric (for team rows) ──

export function Metric({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="text-center min-w-[3.5rem]">
      <p className={cn("text-sm font-semibold leading-none", className)}>
        {value}
      </p>
      <div className="mt-1 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
