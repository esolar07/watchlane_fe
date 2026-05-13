"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { complianceColor } from "@/components/coverage-metrics";
import { cn } from "@/lib/utils";
import {
  datePresetOptions,
  type DatePreset,
} from "@/lib/date-presets";
import type { TeamDashboardPerformance } from "@/types/dashboard";

interface TeamPerformanceTileProps {
  performance: TeamDashboardPerformance;
  datePreset: DatePreset;
  onDatePresetChange: (next: DatePreset) => void;
}

export function TeamPerformanceTile({
  performance,
  datePreset,
  onDatePresetChange,
}: TeamPerformanceTileProps) {
  const compliance = performance.slaCompliancePercent;
  const avgResponse = performance.avgResponseFormatted || "—";
  return (
    <Card className="border-border/60 bg-muted/30 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Performance
        </CardTitle>
        <PeriodSelect value={datePreset} onChange={onDatePresetChange} />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <PerfRow
          label="Compliance"
          helpText="Replies within SLA divided by replies in the selected period."
          helpLink="/help#coverage"
          value={`${compliance.toFixed(1)}%`}
          valueClassName={complianceColor(compliance)}
        />
        <PerfRow
          label="Avg response"
          helpText="Average time to send the first reply over replied threads."
          helpLink="/help#response-time"
          value={avgResponse}
        />
      </CardContent>
    </Card>
  );
}

function PeriodSelect({
  value,
  onChange,
}: {
  value: DatePreset;
  onChange: (next: DatePreset) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DatePreset)}>
      <SelectTrigger
        size="sm"
        className="h-7 w-auto gap-1 border-transparent bg-transparent px-2 text-xs font-medium text-muted-foreground hover:bg-accent/50"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {datePresetOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface PerfRowProps {
  label: string;
  helpText: string;
  helpLink: string;
  value: string;
  valueClassName?: string;
}

function PerfRow({
  label,
  helpText,
  helpLink,
  value,
  valueClassName,
}: PerfRowProps) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">
        <HelpTooltip
          label={label}
          description={helpText}
          helpLink={helpLink}
        />
      </span>
      <span className={cn("font-semibold", valueClassName)}>{value}</span>
    </div>
  );
}
