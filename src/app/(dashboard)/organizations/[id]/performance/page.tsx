"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertOctagon,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  HelpCircle,
  Hourglass,
  Inbox,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatMinutes } from "@/lib/utils";
import { usePerformanceDashboard } from "@/hooks/usePerformanceDashboard";
import { LateResponseTable } from "@/components/late-response-table";
import { OrgTabNav } from "@/components/org-tab-nav";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  complianceColor,
  complianceBg,
} from "@/components/coverage-metrics";
import type { PerformanceDashboard } from "@/types/dashboard";

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
  if (preset === "7d") start.setDate(start.getDate() - 6);
  if (preset === "30d") start.setDate(start.getDate() - 29);
  if (preset === "90d") start.setDate(start.getDate() - 89);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export default function OrgPerformancePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orgId = params?.id ?? "";

  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset],
  );

  const { data, isLoading, error } = usePerformanceDashboard({
    orgId,
    startDate,
    endDate,
  });

  return (
    <div className="space-y-6">
      <PageHeader onBack={() => router.push("/dashboard")} />
      <OrgTabNav
        orgId={orgId}
        rightSlot={
          <DateFilter value={datePreset} onChange={setDatePreset} />
        }
      />
      <PerformanceContent data={data} isLoading={isLoading} error={error} />
    </div>
  );
}

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground">
            Historical SLA compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

function DateFilter({
  value,
  onChange,
}: {
  value: DatePreset;
  onChange: (next: DatePreset) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-card p-0.5">
      {presets.map((p) => (
        <Button
          key={p.value}
          variant={value === p.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(p.value)}
          className={cn(
            "h-7 rounded-md px-3 text-xs font-medium",
            value !== p.value && "text-muted-foreground",
          )}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}

interface PerformanceContentProps {
  data: PerformanceDashboard | null;
  isLoading: boolean;
  error: string | null;
}

function PerformanceContent({
  data,
  isLoading,
  error,
}: PerformanceContentProps) {
  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;
  if (data.totalInbound === 0) return <EmptyState />;
  return (
    <>
      <PerformanceKpis data={data} />
      <TrendChartPlaceholder />
      <LateResponseTable threads={data.lateResponseThreads} />
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex items-center gap-3 py-6">
        <AlertOctagon className="h-5 w-5 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
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
  );
}

function PerformanceKpis({ data }: { data: PerformanceDashboard }) {
  return (
    <section
      aria-label="Performance KPIs"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <ComplianceTile compliancePercent={data.compliancePercent} />
      <PerformanceTile
        label="Total Inbound"
        helpText="Threads that received their first inbound message in this window."
        helpLink="/help#coverage"
        value={data.totalInbound}
        icon={Inbox}
      />
      <PerformanceTile
        label="Late Responses"
        helpText="Threads where the first reply was sent past the SLA window."
        helpLink="/help#breach"
        value={data.lateResponses}
        icon={Hourglass}
        valueClassName={data.lateResponses > 0 ? "text-amber-600" : undefined}
      />
      <PerformanceTile
        label="Unreplied"
        helpText="Threads that still have no first reply."
        helpLink="/help#coverage"
        value={data.unreplied}
        icon={HelpCircle}
        valueClassName={data.unreplied > 0 ? "text-red-600" : undefined}
      />
    </section>
  );
}

function ComplianceTile({ compliancePercent }: { compliancePercent: number }) {
  return (
    <Card
      className={cn(
        "border transition-shadow hover:shadow-md",
        complianceBg(compliancePercent),
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <HelpTooltip
            label="Compliance"
            description="Replies within SLA divided by replies (covered + late)."
            helpLink="/help#coverage"
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

interface PerformanceTileProps {
  label: string;
  helpText: string;
  helpLink: string;
  value: string | number;
  icon: typeof Inbox;
  valueClassName?: string;
}

function PerformanceTile({
  label,
  helpText,
  helpLink,
  value,
  icon: Icon,
  valueClassName,
}: PerformanceTileProps) {
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

function TrendChartPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Compliance trend
        </CardTitle>
        <CardDescription>
          Day-over-day compliance — coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Backend trend endpoint not wired yet.
        </span>
      </CardContent>
    </Card>
  );
}
