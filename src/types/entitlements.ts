import type { IntOrUnlimited } from "./plan";

export type LimitFeatureKey = "mailbox_limit" | "org_limit" | "history_days";
export type BooleanFeatureKey = "weekly_reports" | "folder_monitoring" | "priority_support";
export type FeatureKey = LimitFeatureKey | BooleanFeatureKey;

export interface EntitlementFeatures {
  mailbox_limit: IntOrUnlimited;
  org_limit: IntOrUnlimited;
  history_days: IntOrUnlimited;
  weekly_reports: boolean;
  folder_monitoring: boolean;
  priority_support: boolean;
}

export interface Entitlements {
  workspace: { id: string; name: string };
  plan: { slug: string; name: string };
  features: EntitlementFeatures;
  usage: { mailboxes_used: number; orgs_used: number };
}
