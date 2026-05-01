"use client";

import { CheckCircle2, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  complianceBg,
  complianceColor,
} from "@/components/coverage-metrics";
import { cn } from "@/lib/utils";
import type { OrgDashboardPerformance } from "@/types/dashboard";

export function OrgPerformanceTile({
  performance,
}: {
  performance: OrgDashboardPerformance;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance</CardTitle>
        <CardDescription>Historical · in selected period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ComplianceRow
          slaCompliancePercent={performance.slaCompliancePercent}
        />
        <AvgResponseRow
          avgResponseFormatted={performance.avgResponseFormatted}
        />
      </CardContent>
    </Card>
  );
}

function ComplianceRow({
  slaCompliancePercent,
}: {
  slaCompliancePercent: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border p-3",
        complianceBg(slaCompliancePercent),
      )}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2
          className={cn("h-4 w-4", complianceColor(slaCompliancePercent))}
        />
        <span className="text-sm font-medium">
          <HelpTooltip
            label="Compliance"
            description="Replies within SLA divided by replies in the selected period."
            helpLink="/help#coverage"
          />
        </span>
      </div>
      <p
        className={cn(
          "text-xl font-bold",
          complianceColor(slaCompliancePercent),
        )}
      >
        {slaCompliancePercent.toFixed(1)}%
      </p>
    </div>
  );
}

function AvgResponseRow({
  avgResponseFormatted,
}: {
  avgResponseFormatted: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          <HelpTooltip
            label="Avg Response Time"
            description="Average time to send the first reply over replied threads."
            helpLink="/help#response-time"
          />
        </span>
      </div>
      <p className="text-xl font-bold">{avgResponseFormatted || "—"}</p>
    </div>
  );
}
