export type IntOrUnlimited = number | null;
export type PriceInterval = "MONTH" | "YEAR";

export interface PlanFeatureRow {
  key: string;
  value: string;
}

export interface PlanPrice {
  id: string;
  stripePriceId: string;
  interval: PriceInterval;
  unitAmount: number;
  currency: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeatureRow[];
  prices: PlanPrice[];
}

const LIMIT_KEYS = new Set<string>(["mailbox_limit", "org_limit", "history_days"]);

export function decodeFeatureValue(key: string, raw: string): number | null | boolean {
  if (LIMIT_KEYS.has(key)) return raw === "unlimited" ? null : Number.parseInt(raw, 10);
  return raw === "true";
}

export function humanizeFeatureKey(key: string): string {
  if (key === "mailbox_limit") return "Mailboxes";
  if (key === "org_limit") return "Organizations";
  if (key === "history_days") return "History (days)";
  if (key === "weekly_reports") return "Weekly reports";
  if (key === "folder_monitoring") return "Folder monitoring";
  if (key === "priority_support") return "Priority support";
  return key.replace(/_/g, " ");
}
