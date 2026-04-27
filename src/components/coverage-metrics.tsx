"use client";

import { Target, CheckCircle2, Clock, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatMinutes } from "@/lib/utils";
import { type CoverageMetrics } from "@/types/dashboard";

// ── Helpers ──

export function aggregate(items: CoverageMetrics[]) {
  const totalInbound = items.reduce((s, i) => s + i.totalInbound, 0);
  const coveredWithinSla = items.reduce((s, i) => s + i.coveredWithinSla, 0);
  const breaches = items.reduce((s, i) => s + i.breaches, 0);
  const atRisk = items.reduce((s, i) => s + i.atRisk, 0);
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
    compliancePercent,
    avgResponseMinutes,
    oldestUncoveredMinutes,
  };
}

export function complianceColor(percent: number) {
  if (percent >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (percent >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function complianceBadge(percent: number) {
  if (percent >= 90)
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400";
  if (percent >= 70)
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400";
}

// Soft tinted card backgrounds — keep subtle, no heavy fills
export function complianceBg(percent: number) {
  if (percent >= 90) return "";
  if (percent >= 70) return "";
  return "";
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
    { value: d.coveredWithinSla, color: "var(--color-chart-2)", label: "Covered" },
    { value: d.atRisk,           color: "var(--color-chart-3)", label: "At Risk" },
    { value: d.breaches,         color: "var(--color-chart-4)", label: "Breached" },
  ];
}

export function DonutChart({
  segments,
  total,
  size = 168,
}: {
  segments: DonutSegment[];
  total: number;
  size?: number;
}) {
  const strokeWidth = 14;
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
          className="text-muted"
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

  // Track ring (very subtle)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-muted"
        strokeWidth={strokeWidth}
      />
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
        className="wl-num fill-foreground"
        style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        {total}
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-muted-foreground"
        style={{ fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase" }}
      >
        Threads
      </text>
    </svg>
  );
}

// ── KPI cards ──

function KpiTile({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  valueClass?: string;
  hint?: string;
}) {
  return (
    <Card className="gap-0 border-border py-0 shadow-none transition-colors hover:bg-muted/40">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {label}
          </span>
          <Icon className={cn("h-3.5 w-3.5 text-muted-foreground", iconClass)} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("wl-num text-[26px] font-semibold leading-none tracking-tight", valueClass)}>
            {value}
          </span>
          {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </Card>
  );
}

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
  const oldestOverdue =
    slaTarget !== null && data.oldestUncoveredMinutes > slaTarget;

  return (
    <section aria-label="Key performance indicators">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="SLA Target"
          value={slaTarget !== null ? formatMinutes(slaTarget) : "Varies"}
          icon={Target}
        />
        <KpiTile
          label="Compliance"
          value={`${data.compliancePercent.toFixed(1)}%`}
          icon={CheckCircle2}
          iconClass={complianceColor(data.compliancePercent)}
          valueClass={complianceColor(data.compliancePercent)}
        />
        <KpiTile
          label="Avg Response"
          value={formatMinutes(data.avgResponseMinutes)}
          icon={Clock}
        />
        <KpiTile
          label="Oldest Uncovered"
          value={data.oldestUncoveredMinutes > 0 ? formatMinutes(data.oldestUncoveredMinutes) : "—"}
          icon={Timer}
          iconClass={oldestOverdue ? "text-red-600 dark:text-red-400" : ""}
          valueClass={oldestOverdue ? "text-red-600 dark:text-red-400" : ""}
        />
      </div>
    </section>
  );
}

// ── Thread Distribution card (donut + stat rows) ──

function pct(value: number, total: number) {
  if (total === 0) return "0";
  return ((value / total) * 100).toFixed(0);
}

function DistRow({
  swatchVar,
  label,
  value,
  total,
  valueClass,
}: {
  swatchVar: string;
  label: string;
  value: number;
  total: number;
  valueClass?: string;
}) {
  const p = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: swatchVar }}
          />
          <span className="text-[13px] font-medium">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("wl-num text-[14px] font-semibold tabular-nums", valueClass)}>
            {value}
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {pct(value, total)}%
          </span>
        </div>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, backgroundColor: swatchVar }}
        />
      </div>
    </div>
  );
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
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="border-b border-border px-5 py-3.5">
        <CardTitle className="text-[13px] font-semibold">Thread Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-stretch">
          <div className="flex shrink-0 items-center justify-center">
            <DonutChart
              total={data.totalInbound}
              segments={donutSegments(data)}
            />
          </div>
          <div className="flex-1 space-y-4">
            <DistRow
              swatchVar="var(--color-chart-2)"
              label="Covered Within SLA"
              value={data.coveredWithinSla}
              total={data.totalInbound}
              valueClass="text-emerald-600 dark:text-emerald-400"
            />
            <DistRow
              swatchVar="var(--color-chart-3)"
              label="At Risk"
              value={data.atRisk}
              total={data.totalInbound}
              valueClass="text-amber-600 dark:text-amber-400"
            />
            <DistRow
              swatchVar="var(--color-chart-4)"
              label="Breaches"
              value={data.breaches}
              total={data.totalInbound}
              valueClass="text-red-600 dark:text-red-400"
            />
            <div className="flex items-center justify-between border-t border-border pt-3 text-[13px]">
              <span className="text-muted-foreground">Total inbound</span>
              <span className="wl-num font-semibold">{data.totalInbound}</span>
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
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 py-0 shadow-none">
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="gap-0 py-0 shadow-none">
        <CardHeader className="border-b border-border px-5 py-3.5">
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Skeleton className="h-[168px] w-[168px] shrink-0 rounded-full" />
            <div className="w-full flex-1 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Inline metric (for org rows) ──

export function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="min-w-[3.25rem] text-center">
      <p className={cn("wl-num text-[13.5px] font-semibold leading-none tabular-nums", className)}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
