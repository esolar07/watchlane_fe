export type IntOrUnlimited = number | null;

export interface PlanFeatureRow {
  key: string;
  value: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeatureRow[];
}

const LIMIT_FEATURE_KEYS = new Set([
  "workspace_limit",
  "team_limit",
  "mailbox_limit",
  "history_days",
]);

export function decodeFeatureValue(key: string, raw: string): number | null | boolean {
  if (LIMIT_FEATURE_KEYS.has(key)) return raw === "unlimited" ? null : Number.parseInt(raw, 10);
  return raw === "true";
}

export function humanizeFeatureKey(key: string): string {
  if (key === "workspace_limit") return "Workspaces";
  if (key === "team_limit") return "Teams";
  if (key === "mailbox_limit") return "Mailboxes";
  if (key === "history_days") return "History (days)";
  if (key === "weekly_reports") return "Weekly reports";
  if (key === "folder_monitoring") return "Folder monitoring";
  if (key === "priority_support") return "Priority support";
  return key.replace(/_/g, " ");
}
