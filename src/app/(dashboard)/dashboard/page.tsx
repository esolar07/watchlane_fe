"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Inbox,
  Lock,
  RefreshCw,
  ShieldAlert,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTeams } from "@/services/api";
import { useAggregateDashboard } from "@/hooks/useAggregateDashboard";
import {
  useAllOperationalDashboards,
  type OperationalEntry,
} from "@/hooks/useAllOperationalDashboards";
import { useEntitlements } from "@/hooks/useEntitlements";
import { Metric, complianceColor } from "@/components/coverage-metrics";
import { SnapshotBreakdown } from "@/components/snapshot-breakdown";
import { cn, formatMinutes } from "@/lib/utils";
import type { AggregateDashboard } from "@/types/dashboard";
import type { Team } from "@/types/team";

type DatePreset = "today" | "7d" | "30d" | "90d";

const presets: { value: DatePreset; label: string; requiredDays: number }[] = [
  { value: "today", label: "Today", requiredDays: 1 },
  { value: "7d", label: "7 days", requiredDays: 7 },
  { value: "30d", label: "30 days", requiredDays: 30 },
  { value: "90d", label: "90 days", requiredDays: 90 },
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

export default function DashboardPage() {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  useEffect(() => {
    getTeams()
      .then((rows) => setTeams(rows.map((row) => ({ id: row.id, name: row.name }))))
      .catch(() => setTeams([]))
      .finally(() => setTeamsLoading(false));
  }, []);
  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset],
  );

  const aggregate = useAggregateDashboard({ startDate, endDate });
  const perTeam = useAllOperationalDashboards(teams);
  const { entitlements } = useEntitlements();
  const historyDays = entitlements?.features.history_days ?? null;

  const isRefreshing = aggregate.isLoading || perTeam.isLoading;

  function refetchAll() {
    aggregate.refetch();
    perTeam.refetch();
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        onRefresh={refetchAll}
        isRefreshing={isRefreshing}
      />
      {teamsLoading || (aggregate.isLoading && !aggregate.data) ? (
        <LoadingState />
      ) : teams.length === 0 ? (
        <EmptyOrgsState />
      ) : aggregate.error ? (
        <ErrorBanner message={aggregate.error} />
      ) : aggregate.data ? (
        <>
          <SnapshotSection data={aggregate.data} />
          <PeriodSection
            data={aggregate.data}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            historyDays={historyDays}
          />
          {teams.length > 1 && (
            <TeamList teams={teams} entries={perTeam.entries} />
          )}
        </>
      ) : null}
    </div>
  );
}

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

function DashboardHeader({
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-4 bg-background/95 px-1 pb-4 pt-1 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Snapshot across all teams.
        </p>
      </div>
      <div className="flex items-center gap-2">
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
    </div>
  );
}

function DateFilter({
  value,
  onChange,
  historyDays,
}: {
  value: DatePreset;
  onChange: (next: DatePreset) => void;
  historyDays: number | null;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-card p-0.5">
      {presets.map((p) => {
        const isLocked =
          historyDays !== null && p.requiredDays > historyDays;
        if (isLocked) {
          return (
            <Tooltip key={p.value}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground opacity-60"
                  >
                    {p.label}
                    <Lock
                      className="ml-1 h-3 w-3"
                      aria-hidden="true"
                    />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Upgrade your plan to access {p.label}.
                </p>
              </TooltipContent>
            </Tooltip>
          );
        }
        return (
          <Button
            key={p.value}
            variant={value === p.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(p.value)}
            className={cn(
              "h-8 rounded-md px-3 text-xs font-medium",
              value !== p.value && "text-muted-foreground",
            )}
          >
            {p.label}
          </Button>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyOrgsState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No teams</h3>
        <p className="text-sm text-muted-foreground">
          Create or join an team to see live activity here.
        </p>
      </CardContent>
    </Card>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-center gap-3 py-6">
        <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  title,
  hint,
  rightSlot,
}: {
  title: string;
  hint: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground/70">{hint}</span>
      </div>
      {rightSlot}
    </div>
  );
}

function SnapshotSection({ data }: { data: AggregateDashboard }) {
  return (
    <section aria-label="Snapshot" className="space-y-4">
      <SectionHeading title="Right now" hint="Live snapshot" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Open"
          helpText="Threads currently uncovered across all teams."
          helpLink="/help#coverage"
          value={data.totalOpenThreads}
          icon={Inbox}
        />
        <KpiTile
          label="Overdue"
          helpText="Threads currently past SLA awaiting a reply."
          helpLink="/help#breach"
          value={data.totalOverdue}
          icon={ShieldAlert}
          valueClassName={data.totalOverdue > 0 ? "text-red-600" : undefined}
          footer={
            <ImpactedOrgsLine
              impactedCount={data.impactedTeams?.length ?? 0}
              totalTeams={data.totalTeams ?? 0}
            />
          }
        />
        <KpiTile
          label="At Risk"
          helpText="Threads approaching the SLA window without a reply."
          helpLink="/help#at-risk"
          value={data.totalAtRisk}
          icon={AlertTriangle}
          valueClassName={data.totalAtRisk > 0 ? "text-amber-600" : undefined}
        />
        <KpiTile
          label="Oldest Gap"
          helpText="Longest-waiting open thread across all teams."
          helpLink="/help#oldest-gap"
          value={data.oldestGapMinutes > 0 ? data.oldestGapFormatted : "—"}
          icon={Timer}
        />
      </div>
      <SnapshotBreakdown
        openCount={data.totalOpenThreads}
        overdueCount={data.totalOverdue}
        atRiskCount={data.totalAtRisk}
      />
    </section>
  );
}

function PeriodSection({
  data,
  datePreset,
  onDatePresetChange,
  historyDays,
}: {
  data: AggregateDashboard;
  datePreset: DatePreset;
  onDatePresetChange: (next: DatePreset) => void;
  historyDays: number | null;
}) {
  return (
    <section aria-label="Performance" className="space-y-4">
      <SectionHeading
        title="Performance"
        hint="Historical · changes with date filter"
        rightSlot={
          <DateFilter
            value={datePreset}
            onChange={onDatePresetChange}
            historyDays={historyDays}
          />
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <ComplianceTile compliancePercent={data.slaCompliancePercent} />
        <KpiTile
          label="Avg Response Time"
          helpText="Average time to send the first reply, across replied threads in the selected period."
          helpLink="/help#response-time"
          value={data.avgResponseFormatted || "—"}
          icon={Clock}
        />
      </div>
    </section>
  );
}

interface KpiTileProps {
  label: string;
  helpText: string;
  helpLink: string;
  value: string | number;
  icon: typeof Inbox;
  valueClassName?: string;
  footer?: React.ReactNode;
}

function KpiTile({
  label,
  helpText,
  helpLink,
  value,
  icon: Icon,
  valueClassName,
  footer,
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
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className={cn("text-2xl font-bold", valueClassName)}>{value}</p>
          {footer}
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactedOrgsLine({
  impactedCount,
  totalTeams,
}: {
  impactedCount: number;
  totalTeams: number;
}) {
  return (
    <p className="text-xs text-muted-foreground">
      {impactedCount} of {totalTeams}{" "}
      {totalTeams === 1 ? "team" : "teams"} impacted
    </p>
  );
}

function ComplianceTile({ compliancePercent }: { compliancePercent: number }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <HelpTooltip
            label="SLA Compliance"
            description="Replies within SLA divided by replies in the selected period."
            helpLink="/help#sla-compliance"
          />
        </CardTitle>
        <CheckCircle2
          className={cn("h-4 w-4", complianceColor(compliancePercent))}
        />
      </CardHeader>
      <CardContent className="pt-0">
        <p
          className={cn(
            "text-2xl font-bold",
            complianceColor(compliancePercent),
          )}
        >
          {compliancePercent.toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  );
}

function TeamList({
  teams,
  entries,
}: {
  teams: { id: string; name: string }[];
  entries: OperationalEntry[];
}) {
  const entryByTeamId = new Map(entries.map((e) => [e.teamId, e]));
  return (
    <section aria-label="Per-team snapshot" className="space-y-3">
      <SectionHeading title="Teams" hint="Live snapshot per team" />
      <div className="space-y-3">
        {teams.map((team) => (
          <TeamRow
            key={team.id}
            team={team}
            entry={entryByTeamId.get(team.id)}
          />
        ))}
      </div>
    </section>
  );
}

type TeamSeverity = "red" | "amber" | "neutral";

function severityFor(entry?: OperationalEntry): TeamSeverity {
  if (!entry?.data) return "neutral";
  if (entry.data.overdueCount > 0) return "red";
  if (entry.data.atRiskCount > 0) return "amber";
  return "neutral";
}

const SEVERITY_BORDER: Record<TeamSeverity, string> = {
  red: "border-l-4 border-l-red-500",
  amber: "border-l-4 border-l-amber-500",
  neutral: "border-l-4 border-l-transparent",
};

function TeamRow({
  team,
  entry,
}: {
  team: { id: string; name: string };
  entry?: OperationalEntry;
}) {
  const severity = severityFor(entry);
  return (
    <Card className={cn("relative pb-10", SEVERITY_BORDER[severity])}>
      <CardContent className="py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TeamIdentity
            team={team}
            entry={entry}
            severity={severity}
          />
          {entry?.data ? (
            <TeamRowMetrics data={entry.data} />
          ) : entry?.error ? (
            <span className="text-xs text-destructive">{entry.error}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Loading…</span>
          )}
        </div>
      </CardContent>
      <Link
        href={`/teams/${team.id}/operational`}
        className="absolute bottom-3 right-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Open dashboard
        <ChevronRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function TeamIdentity({
  team,
  entry,
  severity,
}: {
  team: { id: string; name: string };
  entry?: OperationalEntry;
  severity: TeamSeverity;
}) {
  const slaTarget = entry?.data?.slaTarget;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium leading-none">{team.name}</p>
          {severity === "red" && (
            <ShieldAlert
              className="h-4 w-4 text-red-500"
              aria-label="Has overdue threads"
            />
          )}
          {severity === "amber" && (
            <AlertTriangle
              className="h-4 w-4 text-amber-500"
              aria-label="Has at-risk threads"
            />
          )}
        </div>
        {slaTarget !== undefined && (
          <p className="mt-1 text-xs text-muted-foreground">
            SLA: {formatMinutes(slaTarget)}
          </p>
        )}
      </div>
    </div>
  );
}

function TeamRowMetrics({
  data,
}: {
  data: NonNullable<OperationalEntry["data"]>;
}) {
  const overdueClasses =
    data.overdueCount > 0 ? "text-red-600 text-base font-bold" : undefined;
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-5">
      <Metric
        label={
          <HelpTooltip
            label="Open"
            description="Threads currently uncovered."
            helpLink="/help#coverage"
          />
        }
        value={data.openCount}
      />
      <Metric
        label={
          <HelpTooltip
            label="Overdue"
            description="Threads currently past SLA awaiting a reply."
            helpLink="/help#breach"
          />
        }
        value={data.overdueCount}
        className={overdueClasses}
      />
      <Metric
        label={
          <HelpTooltip
            label="At Risk"
            description="Threads approaching the SLA window without a reply."
            helpLink="/help#at-risk"
          />
        }
        value={data.atRiskCount}
        className={data.atRiskCount > 0 ? "text-amber-600" : undefined}
      />
    </div>
  );
}
