"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Mail, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createMailboxInvite,
  listMailboxInvites,
  revokeMailboxInvite,
} from "@/services/api";
import type { MailboxInvite } from "@/types/mailbox-invite";

interface MailboxInvitePanelProps {
  teamId: string;
}

export function MailboxInvitePanel({ teamId }: MailboxInvitePanelProps) {
  const state = useMailboxInvitesState(teamId);
  return (
    <Card>
      <PanelHeader />
      <CardContent className="space-y-6">
        <GenerateInviteForm teamId={teamId} onCreated={state.prepend} />
        <InviteList
          invites={state.invites}
          isLoading={state.isLoading}
          loadError={state.loadError}
          teamId={teamId}
          onRevoked={state.markRevoked}
        />
      </CardContent>
    </Card>
  );
}

function PanelHeader() {
  return (
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Mailbox Invite Links
      </CardTitle>
      <CardDescription>
        Generate a link to invite an external mailbox owner to connect their
        inbox without creating a Watchlane account.
      </CardDescription>
    </CardHeader>
  );
}

function useMailboxInvitesState(teamId: string) {
  const [invites, setInvites] = useState<MailboxInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    return loadInvites(teamId, { setInvites, setIsLoading, setLoadError });
  }, [teamId]);
  const prepend = (invite: MailboxInvite) =>
    setInvites((rows) => [invite, ...rows]);
  const markRevoked = (id: string) =>
    setInvites((rows) => rows.map(applyRevokeTo(id)));
  return { invites, isLoading, loadError, prepend, markRevoked };
}

interface LoaderSetters {
  setInvites: (rows: MailboxInvite[]) => void;
  setIsLoading: (v: boolean) => void;
  setLoadError: (msg: string | null) => void;
}

function loadInvites(teamId: string, s: LoaderSetters) {
  let cancelled = false;
  s.setIsLoading(true);
  listMailboxInvites(teamId)
    .then((rows) => {
      if (cancelled) return;
      s.setInvites(rows);
      s.setLoadError(null);
    })
    .catch((err) => {
      if (!cancelled) s.setLoadError(toMessage(err, "Failed to load invites"));
    })
    .finally(() => {
      if (!cancelled) s.setIsLoading(false);
    });
  return () => {
    cancelled = true;
  };
}

function applyRevokeTo(id: string) {
  return (row: MailboxInvite): MailboxInvite =>
    row.id === id ? { ...row, revokedAt: new Date().toISOString() } : row;
}

interface GenerateInviteFormProps {
  teamId: string;
  onCreated: (invite: MailboxInvite) => void;
}

function GenerateInviteForm({ teamId, onCreated }: GenerateInviteFormProps) {
  const submission = useGenerateInviteSubmission(teamId, onCreated);
  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="invite-email">Email this link to (optional)</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="invite-email"
            type="email"
            placeholder="name@example.com"
            value={submission.email}
            onChange={(e) => submission.setEmail(e.target.value)}
            disabled={submission.isSubmitting}
          />
          <Button
            onClick={submission.submit}
            disabled={submission.isSubmitting}
            className="shrink-0"
          >
            {submission.isSubmitting ? "Generating…" : "Generate link"}
          </Button>
        </div>
      </div>
      {submission.error && (
        <p className="text-sm text-destructive">{submission.error}</p>
      )}
      {submission.result && (
        <GeneratedLinkResult result={submission.result} />
      )}
    </div>
  );
}

interface GenerateResult {
  url: string;
  emailed: boolean;
  attemptedEmail: string | null;
}

function useGenerateInviteSubmission(
  teamId: string,
  onCreated: (invite: MailboxInvite) => void,
) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const submit = () =>
    runGenerate(teamId, email, onCreated, {
      setIsSubmitting, setError, setResult, setEmail,
    });
  return { email, setEmail, isSubmitting, error, result, submit };
}

interface GenerateSetters {
  setIsSubmitting: (v: boolean) => void;
  setError: (m: string | null) => void;
  setResult: (r: GenerateResult | null) => void;
  setEmail: (v: string) => void;
}

async function runGenerate(
  teamId: string,
  rawEmail: string,
  onCreated: (invite: MailboxInvite) => void,
  s: GenerateSetters,
) {
  const sendToEmail = rawEmail.trim() || undefined;
  s.setIsSubmitting(true);
  s.setError(null);
  try {
    const out = await createMailboxInvite(teamId, sendToEmail);
    onCreated(out.invite);
    s.setResult({ url: out.invite.url, emailed: out.emailed, attemptedEmail: sendToEmail ?? null });
    s.setEmail("");
  } catch (err) {
    s.setError(toMessage(err, "Could not generate invite link."));
  } finally {
    s.setIsSubmitting(false);
  }
}

function GeneratedLinkResult({ result }: { result: GenerateResult }) {
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
      <CopyableLinkRow url={result.url} />
      <DeliveryStatus result={result} />
    </div>
  );
}

function DeliveryStatus({ result }: { result: GenerateResult }) {
  if (!result.attemptedEmail) return null;
  if (result.emailed) {
    return (
      <p className="text-xs text-muted-foreground">
        Sent to {result.attemptedEmail}.
      </p>
    );
  }
  return (
    <p className="text-xs text-amber-600">
      We couldn&apos;t email this — copy the link instead.
    </p>
  );
}

function CopyableLinkRow({ url }: { url: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={url} className="font-mono text-xs" />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => copy(url)}
        className="shrink-0"
        aria-label="Copy invite link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

interface InviteListProps {
  invites: MailboxInvite[];
  isLoading: boolean;
  loadError: string | null;
  teamId: string;
  onRevoked: (id: string) => void;
}

function InviteList({
  invites,
  isLoading,
  loadError,
  teamId,
  onRevoked,
}: InviteListProps) {
  if (isLoading) return <ListSkeleton />;
  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;
  if (invites.length === 0) return <EmptyInvitesState />;
  return (
    <ul className="divide-y rounded-md border">
      {invites.map((invite) => (
        <InviteRow
          key={invite.id}
          invite={invite}
          teamId={teamId}
          onRevoked={onRevoked}
        />
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyInvitesState() {
  return (
    <p className="text-sm text-muted-foreground">
      No invite links yet. Generate one above to get started.
    </p>
  );
}

interface InviteRowProps {
  invite: MailboxInvite;
  teamId: string;
  onRevoked: (id: string) => void;
}

function InviteRow({ invite, teamId, onRevoked }: InviteRowProps) {
  const isRevoked = Boolean(invite.revokedAt);
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <InviteRowSummary invite={invite} isRevoked={isRevoked} />
      <InviteRowActions
        invite={invite}
        teamId={teamId}
        isRevoked={isRevoked}
        onRevoked={onRevoked}
      />
    </li>
  );
}

function InviteRowSummary({
  invite,
  isRevoked,
}: {
  invite: MailboxInvite;
  isRevoked: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <StatusBadge isRevoked={isRevoked} />
        <span className="text-xs text-muted-foreground">
          Created {formatRelative(invite.createdAt)}
        </span>
      </div>
      <p className="truncate text-sm">
        {invite.sentToEmail ? (
          <span className="font-medium">{invite.sentToEmail}</span>
        ) : (
          <span className="text-muted-foreground">— no email recipient</span>
        )}
      </p>
    </div>
  );
}

function StatusBadge({ isRevoked }: { isRevoked: boolean }) {
  if (isRevoked) {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground">
        Revoked
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 text-[10px] dark:bg-green-900/30 dark:text-green-400">
      Active
    </Badge>
  );
}

interface InviteRowActionsProps {
  invite: MailboxInvite;
  teamId: string;
  isRevoked: boolean;
  onRevoked: (id: string) => void;
}

function InviteRowActions({
  invite,
  teamId,
  isRevoked,
  onRevoked,
}: InviteRowActionsProps) {
  const { copied, copy } = useCopy();
  if (isRevoked) return null;
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copy(invite.url)}
      >
        {copied ? (
          <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="mr-1.5 h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <RevokeButton invite={invite} teamId={teamId} onRevoked={onRevoked} />
    </div>
  );
}

interface RevokeButtonProps {
  invite: MailboxInvite;
  teamId: string;
  onRevoked: (id: string) => void;
}

function RevokeButton({ invite, teamId, onRevoked }: RevokeButtonProps) {
  const dialog = useRevokeDialog(invite, teamId, onRevoked);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={dialog.open}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Revoke
      </Button>
      <RevokeConfirmDialog state={dialog} />
    </>
  );
}

function useRevokeDialog(
  invite: MailboxInvite,
  teamId: string,
  onRevoked: (id: string) => void,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = () => { setError(null); setIsOpen(true); };
  const close = () => { if (!isRevoking) setIsOpen(false); };
  const confirm = () =>
    runRevoke(invite, teamId, onRevoked, { setIsRevoking, setError, setIsOpen });
  return { isOpen, isRevoking, error, open, close, confirm };
}

interface RevokeSetters {
  setIsRevoking: (v: boolean) => void;
  setError: (m: string | null) => void;
  setIsOpen: (v: boolean) => void;
}

async function runRevoke(
  invite: MailboxInvite,
  teamId: string,
  onRevoked: (id: string) => void,
  s: RevokeSetters,
) {
  s.setIsRevoking(true);
  s.setError(null);
  try {
    await revokeMailboxInvite(teamId, invite.id);
    onRevoked(invite.id);
    s.setIsOpen(false);
  } catch (err) {
    s.setError(toMessage(err, "Could not revoke this invite."));
  } finally {
    s.setIsRevoking(false);
  }
}

interface RevokeDialogState {
  isOpen: boolean;
  isRevoking: boolean;
  error: string | null;
  close: () => void;
  confirm: () => void;
}

function RevokeConfirmDialog({ state }: { state: RevokeDialogState }) {
  return (
    <Dialog open={state.isOpen} onOpenChange={(o) => !o && state.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke invite link?</DialogTitle>
          <DialogDescription>
            Anyone who hasn&apos;t already used this link will no longer be able
            to connect a mailbox. Mailboxes already connected stay connected.
          </DialogDescription>
        </DialogHeader>
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={state.close}
            disabled={state.isRevoking}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={state.confirm}
            disabled={state.isRevoking}
          >
            {state.isRevoking ? "Revoking…" : "Revoke link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
