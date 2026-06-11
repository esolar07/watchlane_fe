export interface MailboxInviteRecord {
  id: string;
  teamId: string;
  token: string;
  createdByUserId: string;
  sentToEmail: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface MailboxInvite extends MailboxInviteRecord {
  url: string;
}

export interface CreateMailboxInviteResult {
  invite: MailboxInvite;
  emailed: boolean;
}
