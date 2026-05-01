"use client";

import {
  AlertTriangle,
  Inbox,
  ShieldAlert,
  Timer,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";
import type { OrgDashboardKpis } from "@/types/dashboard";

export function NeedsAttentionKpis({ kpis }: { kpis: OrgDashboardKpis }) {
  return (
    <section
      aria-label="Needs attention"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <KpiTile
        label="Open"
        helpText="Threads currently uncovered."
        helpLink="/help#coverage"
        value={kpis.openThreads}
        icon={Inbox}
      />
      <KpiTile
        label="Overdue"
        helpText="Threads currently past SLA awaiting a reply."
        helpLink="/help#breach"
        value={kpis.overdue}
        icon={ShieldAlert}
        valueClassName={kpis.overdue > 0 ? "text-red-600" : undefined}
      />
      <KpiTile
        label="At Risk"
        helpText="Threads approaching the SLA window without a reply."
        helpLink="/help#at-risk"
        value={kpis.atRisk}
        icon={AlertTriangle}
        valueClassName={kpis.atRisk > 0 ? "text-amber-600" : undefined}
      />
      <KpiTile
        label="Oldest Gap"
        helpText="Longest-waiting open thread."
        helpLink="/help#oldest-gap"
        value={kpis.oldestGapMinutes > 0 ? kpis.oldestGapFormatted : "—"}
        icon={Timer}
      />
    </section>
  );
}

interface KpiTileProps {
  label: string;
  helpText: string;
  helpLink: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
}

function KpiTile({
  label,
  helpText,
  helpLink,
  value,
  icon: Icon,
  valueClassName,
}: KpiTileProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <HelpTooltip
            label={label}
            description={helpText}
            helpLink={helpLink}
          />
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <p className={cn("text-2xl font-bold", valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
}
