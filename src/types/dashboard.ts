export interface DashboardSummary {
  coveredCount: number;
  uncoveredCount: number;
  avgResponseTimeMinutes: number;
  oldestUncoveredMinutes: number;
}

export interface CoverageMetrics {
  teamId: string;
  teamName: string;
  slaTarget: number;
  compliancePercent: number;
  totalInbound: number;
  coveredWithinSla: number;
  breaches: number;
  atRisk: number;
  avgResponseMinutes: number;
  oldestUncoveredMinutes: number;
  openCount?: number;
  overdueCount?: number;
}

interface BaseActivity {
  type: string;
  message: string;
  timestamp: string;
}

interface BaseThreadActivity extends BaseActivity {
  threadId: string;
  subject: string;
  ownerName: string;
  folderPath?: string | null;
}

export interface BreachActivity extends BaseThreadActivity {
  type: "breach";
  minutesOverdue: number;
}

export interface AtRiskActivity extends BaseThreadActivity {
  type: "at_risk";
  minutesRemaining: number;
}

export interface CoveredActivity extends BaseThreadActivity {
  type: "covered";
  responseMinutes?: number;
}

export interface LateResponseActivity extends BaseThreadActivity {
  type: "late_response";
  minutesOverdue: number;
  responseMinutes?: number;
}

export interface OverdueActivity extends BaseThreadActivity {
  type: "overdue";
  minutesOverdue: number;
}

export interface DismissedActivity extends BaseThreadActivity {
  type: "dismissed";
}

export interface SyncActivity extends BaseActivity {
  type: "sync_success" | "sync_failed";
  emailAddress: string;
}

export type ActivityItem =
  | BreachActivity
  | AtRiskActivity
  | CoveredActivity
  | LateResponseActivity
  | OverdueActivity
  | DismissedActivity
  | SyncActivity;

export interface OpenThread {
  threadId: string;
  subject: string;
  ownerName: string;
  emailAddress: string;
  folderPath: string | null;
  lastInboundAt?: string;
  minutesWaiting: number;
  isPastSla: boolean;
  isAtRisk: boolean;
}

export interface OperationalDashboard {
  slaTarget: number;
  lastSyncAt: string;
  overdueCount: number;
  atRiskCount: number;
  openCount: number;
  oldestUncoveredMinutes: number;
  overdueThreads: OpenThread[];
  atRiskThreads: OpenThread[];
  recentActivity: ActivityItem[];
}

export interface LateResponseThread {
  threadId: string;
  subject: string;
  ownerName: string;
  emailAddress: string;
  folderPath: string | null;
  firstInboundAt: string;
  firstOutboundAt: string;
  firstResponseMinutes: number;
  minutesOverdue: number;
}

export type TeamThreadStatus = "Overdue" | "At Risk" | "Open";

export interface TeamDashboardThread {
  threadId: string;
  status: TeamThreadStatus;
  subject: string;
  from: string | null;
  owner: string | null;
  emailAddress: string;
  folderPath: string | null;
  timeOpenMinutes: number;
  timeOpenFormatted: string;
  slaCountdownMinutes: number;
  slaCountdownFormatted: string;
}

export interface TeamDashboardKpis {
  openThreads: number;
  overdue: number;
  atRisk: number;
  oldestGapMinutes: number;
  oldestGapFormatted: string;
}

export interface TeamDashboardPerformance {
  slaCompliancePercent: number;
  avgResponseMinutes: number;
  avgResponseFormatted: string;
}

export interface TeamDashboard {
  teamId: string;
  teamName: string;
  slaTarget: number;
  lastSyncAt: string;
  kpis: TeamDashboardKpis;
  threads: TeamDashboardThread[];
  activity: ActivityItem[];
  performance: TeamDashboardPerformance;
}

export interface AggregateImpactedTeam {
  teamId: string;
  teamName: string;
  overdueCount: number;
}

export interface AggregateDashboard {
  windowStart: string;
  windowEnd: string;
  totalOpenThreads: number;
  totalOverdue: number;
  totalAtRisk: number;
  totalOnTrack: number;
  avgResponseMinutes: number;
  avgResponseFormatted: string;
  oldestGapMinutes: number;
  oldestGapFormatted: string;
  slaCompliancePercent: number;
  totalTeams: number;
  impactedTeams: AggregateImpactedTeam[];
}

export interface PerformanceDashboard {
  slaTarget: number;
  windowStart: string;
  windowEnd: string;
  totalInbound: number;
  coveredWithinSla: number;
  lateResponses: number;
  unreplied: number;
  compliancePercent: number;
  avgResponseMinutes: number;
  lateResponseThreads: LateResponseThread[];
}
