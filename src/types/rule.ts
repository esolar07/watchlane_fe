export type EvaluationType =
  | "SLA_BREACH"
  | "NEGATIVE_TONE"
  | "NO_REPLY"
  | "MANUAL_REVIEW";

export type ScopeKind = "TEAM" | "ACCOUNT" | "FOLDER";

export interface Rule {
  id: string;
  teamId: string;
  name: string;
  evaluationType: EvaluationType;
  scopeKind: ScopeKind;
  emailAccountId: string | null;
  folderId: string | null;
  threshold: number | null;
  config: Record<string, unknown> | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  emailAccount?: {
    id: string;
    emailAddress: string;
  } | null;
  folder?: {
    id: string;
    path: string;
  } | null;
}

export interface CreateRulePayload {
  name: string;
  evaluationType: EvaluationType;
  scopeKind: ScopeKind;
  threshold?: number | null;
  config?: Record<string, unknown>;
  active?: boolean;
  emailAccountId?: string;
  folderId?: string;
}

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  SLA_BREACH: "SLA breach",
  NEGATIVE_TONE: "Negative tone",
  NO_REPLY: "No reply",
  MANUAL_REVIEW: "Manual review",
};
