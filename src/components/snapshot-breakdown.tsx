"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DonutChart } from "@/components/coverage-metrics";

const SAFE_COLOR = "#10b981";
const AT_RISK_COLOR = "#f59e0b";
const OVERDUE_COLOR = "#ef4444";

interface SnapshotBreakdownProps {
  openCount: number;
  overdueCount: number;
  atRiskCount: number;
}

export function SnapshotBreakdown({
  openCount,
  overdueCount,
  atRiskCount,
}: SnapshotBreakdownProps) {
  const safeCount = Math.max(openCount - overdueCount - atRiskCount, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Open Thread Status</CardTitle>
      </CardHeader>
      <CardContent>
        {openCount === 0 ? (
          <CaughtUpState />
        ) : (
          <BreakdownContent
            openCount={openCount}
            overdueCount={overdueCount}
            atRiskCount={atRiskCount}
            safeCount={safeCount}
          />
        )}
      </CardContent>
    </Card>
  );
}

function CaughtUpState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-sm font-medium">No open threads — all caught up.</p>
    </div>
  );
}

interface BreakdownContentProps {
  openCount: number;
  overdueCount: number;
  atRiskCount: number;
  safeCount: number;
}

function BreakdownContent({
  openCount,
  overdueCount,
  atRiskCount,
  safeCount,
}: BreakdownContentProps) {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div className="shrink-0">
        <DonutChart
          total={openCount}
          segments={[
            { value: overdueCount, color: OVERDUE_COLOR, label: "Overdue" },
            { value: atRiskCount, color: AT_RISK_COLOR, label: "At Risk" },
            { value: safeCount, color: SAFE_COLOR, label: "On Track" },
          ]}
        />
      </div>
      <div className="w-full flex-1 space-y-4">
        <BreakdownRow
          label="Overdue"
          color={OVERDUE_COLOR}
          value={overdueCount}
          total={openCount}
          valueClassName="text-red-600"
        />
        <BreakdownRow
          label="At Risk"
          color={AT_RISK_COLOR}
          value={atRiskCount}
          total={openCount}
          valueClassName="text-amber-600"
        />
        <BreakdownRow
          label="On Track"
          color={SAFE_COLOR}
          value={safeCount}
          total={openCount}
          valueClassName="text-emerald-600"
        />
        <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <span>Total open</span>
          <span className="font-semibold text-foreground">{openCount}</span>
        </div>
      </div>
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  color: string;
  value: number;
  total: number;
  valueClassName: string;
}

function BreakdownRow({
  label,
  color,
  value,
  total,
  valueClassName,
}: BreakdownRowProps) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-lg font-bold ${valueClassName}`}>{value}</span>
        <span className="text-xs text-muted-foreground">({percent}%)</span>
      </div>
    </div>
  );
}
