export type EmailProvider = "microsoft" | "google";

export interface EmailAccount {
  id: string;
  teamId: string;
  provider: EmailProvider;
  emailAddress: string;
  displayName?: string;
  connectedAt?: string;
}

export type SystemFolderKind =
  | "INBOX"
  | "SENT_ITEMS"
  | "DRAFTS"
  | "JUNK_EMAIL"
  | "DELETED_ITEMS";

export interface EmailFolder {
  id: string;
  emailAccountId: string;
  externalId: string;
  parentId: string | null;
  name: string;
  path: string;
  isSystem: boolean;
  systemKind: SystemFolderKind | null;
  monitored: boolean | null;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}
