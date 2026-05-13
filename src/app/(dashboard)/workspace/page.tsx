"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  getCurrentWorkspace,
  updateCurrentWorkspace,
  listWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "@/services/api";
import type {
  AssignableWorkspaceRole,
  WorkspaceDetail,
  WorkspaceMember,
} from "@/types/workspace";

const ASSIGNABLE_WORKSPACE_ROLES: AssignableWorkspaceRole[] = ["ADMIN", "MEMBER"];

export default function WorkspacePage() {
  const { activeWorkspace, refetch: refetchWorkspaces } = useWorkspace();
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canManage = activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailResponse, membersResponse] = await Promise.all([
        getCurrentWorkspace(),
        listWorkspaceMembers(),
      ]);
      setDetail(detailResponse);
      setMembers(membersResponse.members);
      setName(detailResponse.name);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load workspace");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    loadAll();
  }, [activeWorkspace, loadAll]);

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === detail?.name) return;
    setIsSaving(true);
    try {
      const updated = await updateCurrentWorkspace(trimmed);
      setDetail(updated);
      await refetchWorkspaces();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to update name");
    } finally {
      setIsSaving(false);
    }
  }

  if (!activeWorkspace) return <EmptyWorkspaceState />;
  if (isLoading && !detail) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace and team.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Workspace name</CardTitle>
          <CardDescription>Visible to all members.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(changeEvent) => setName(changeEvent.target.value)}
              disabled={!canManage || isSaving}
            />
          </div>
          {canManage && (
            <Button onClick={handleSaveName} disabled={isSaving || name.trim() === detail?.name}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>People with access to this workspace.</CardDescription>
          </div>
          <Badge variant="outline">{members.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <MembersTable
            members={members}
            canManage={canManage}
            onRoleChange={async (memberId, role) => {
              await updateWorkspaceMemberRole(memberId, role);
              await loadAll();
            }}
            onRemove={async (memberId) => {
              await removeWorkspaceMember(memberId);
              await loadAll();
            }}
          />
          {canManage && (
            <AddMemberForm
              onAdded={async () => {
                await loadAll();
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyWorkspaceState() {
  return (
    <Card>
      <CardContent className="py-16 text-center text-sm text-muted-foreground">
        Select or create a workspace to manage its settings.
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

interface MembersTableProps {
  members: WorkspaceMember[];
  canManage: boolean;
  onRoleChange: (memberId: string, role: AssignableWorkspaceRole) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

function MembersTable({ members, canManage, onRoleChange, onRemove }: MembersTableProps) {
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet.</p>;
  }
  return (
    <ul className="divide-y rounded-md border">
      {members.map((member) => (
        <li key={member.userId} className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{member.name || member.email}</p>
            <p className="truncate text-xs text-muted-foreground">{member.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {canManage ? (
              <Select
                value={member.role}
                onValueChange={(nextRole) =>
                  onRoleChange(member.userId, nextRole as AssignableWorkspaceRole)
                }
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_WORKSPACE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="text-xs">{member.role}</Badge>
            )}
            {canManage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(member.userId)}
                aria-label="Remove member"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

interface AddMemberFormProps {
  onAdded: () => Promise<void>;
}

function AddMemberForm({ onAdded }: AddMemberFormProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AssignableWorkspaceRole>("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = userId.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await addWorkspaceMember(trimmed, role);
      setUserId("");
      await onAdded();
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 border-t pt-4">
      <Label className="text-xs uppercase text-muted-foreground">Add member</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(changeEvent) => setUserId(changeEvent.target.value)}
          disabled={submitting}
          className="flex-1"
        />
        <Select
          value={role}
          onValueChange={(nextRole) => setRole(nextRole as AssignableWorkspaceRole)}
        >
          <SelectTrigger className="sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNABLE_WORKSPACE_ROLES.map((roleOption) => (
              <SelectItem key={roleOption} value={roleOption}>{roleOption}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={submitting || !userId.trim()}>
          <UserPlus className="mr-2 h-4 w-4" />
          {submitting ? "Adding…" : "Add"}
        </Button>
      </div>
      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
    </div>
  );
}
