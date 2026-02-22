export interface DashboardSummary {
  coveredCount: number;
  uncoveredCount: number;
  avgResponseTimeMinutes: number;
  oldestUncoveredMinutes: number;
}

export interface CoverageMetrics {
  organizationId: string;
  organizationName: string;
  slaTarget: number;
  compliancePercent: number;
  totalInbound: number;
  coveredWithinSla: number;
  breaches: number;
  atRisk: number;
  avgResponseMinutes: number;
  oldestUncoveredMinutes: number;
}

// ── Activity types (returned in single-org coverage detail) ──

interface BaseActivity {
  type: string;
  message: string;
  timestamp: string;
}

export interface BreachActivity extends BaseActivity {
  type: "breach";
  threadId: string;
  subject: string;
  ownerName: string;
  minutesOverdue: number;
}

export interface AtRiskActivity extends BaseActivity {
  type: "at_risk";
  threadId: string;
  subject: string;
  ownerName: string;
  minutesRemaining: number;
}

export interface CoveredActivity extends BaseActivity {
  type: "covered";
  threadId: string;
  subject: string;
  ownerName: string;
  responseMinutes: number;
}

export interface SyncActivity extends BaseActivity {
  type: "sync_success" | "sync_failed";
  emailAddress: string;
}

export type ActivityItem =
  | BreachActivity
  | AtRiskActivity
  | CoveredActivity
  | SyncActivity;

export interface OrgCoverageDetail extends CoverageMetrics {
  recentActivity: ActivityItem[];
}