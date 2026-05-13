import type { IntOrUnlimited } from "./plan";

export type LimitFeatureKey =
  | "workspace_limit"
  | "team_limit"
  | "mailbox_limit"
  | "history_days";
export type BooleanFeatureKey =
  | "weekly_reports"
  | "folder_monitoring"
  | "priority_support";
export type FeatureKey = LimitFeatureKey | BooleanFeatureKey;

export interface EntitlementFeatures {
  workspace_limit: IntOrUnlimited;
  team_limit: IntOrUnlimited;
  mailbox_limit: IntOrUnlimited;
  history_days: IntOrUnlimited;
  weekly_reports: boolean;
  folder_monitoring: boolean;
  priority_support: boolean;
}

export interface EntitlementsUsage {
  workspaces_used: number;
  teams_used: number;
  mailboxes_used: number;
}

export interface Entitlements {
  workspace: { id: string; name: string };
  plan: { slug: string; name: string };
  features: EntitlementFeatures;
  usage: EntitlementsUsage;
}
