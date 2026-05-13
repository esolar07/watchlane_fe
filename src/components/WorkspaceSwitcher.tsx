"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEntitlements } from "@/hooks/useEntitlements";
import { createWorkspace } from "@/services/api";
import { isLimitReachedError } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const { workspaces, activeWorkspace, isLoading, selectWorkspace, refetch } = useWorkspace();
  const { isWithinLimit } = useEntitlements();
  const [createOpen, setCreateOpen] = useState(false);
  const canCreateWorkspace = isWithinLimit("workspace_limit");

  if (isLoading && !activeWorkspace) return <SwitcherSkeleton collapsed={collapsed} />;
  if (!activeWorkspace) {
    return (
      <CreateFirstWorkspace
        canCreate={canCreateWorkspace}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        onCreated={refetch}
      />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between gap-2 bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent/60",
              collapsed && "h-9 w-9 p-0",
            )}
          >
            {collapsed ? (
              <span className="text-sm font-semibold">
                {activeWorkspace.name.slice(0, 1).toUpperCase()}
              </span>
            ) : (
              <SwitcherLabel workspaceName={activeWorkspace.name} isOwner={activeWorkspace.role === "OWNER"} />
            )}
            {!collapsed && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[240px]">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => selectWorkspace(workspace.id)}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">
                  {workspace.role === "OWNER" ? "Owner" : workspace.role}
                </span>
              </div>
              {workspace.id === activeWorkspace.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          {canCreateWorkspace && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Create workspace…</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async (newWorkspaceId) => {
          await refetch();
          selectWorkspace(newWorkspaceId);
        }}
      />
    </>
  );
}

function SwitcherLabel({ workspaceName, isOwner }: { workspaceName: string; isOwner: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
      <span className="truncate text-sm font-medium">{workspaceName}</span>
      {isOwner && <Badge variant="outline" className="text-[10px]">Owner</Badge>}
    </div>
  );
}

function SwitcherSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md bg-sidebar-accent/30 px-3 py-2",
        collapsed && "h-9 w-9 justify-center p-0",
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin opacity-60" />
    </div>
  );
}

interface CreateFirstWorkspaceProps {
  canCreate: boolean;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  onCreated: () => Promise<void>;
}

function CreateFirstWorkspace({ canCreate, createOpen, setCreateOpen, onCreated }: CreateFirstWorkspaceProps) {
  if (!canCreate) return null;
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setCreateOpen(true)}
        className="w-full justify-start gap-2 text-sidebar-foreground/80"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">New workspace</span>
      </Button>
      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async () => {
          await onCreated();
        }}
      />
    </>
  );
}

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (newWorkspaceId: string) => Promise<void> | void;
}

function CreateWorkspaceDialog({ open, onOpenChange, onCreated }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setName("");
    setErrorMessage(null);
  }

  function handleClose(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createWorkspace(trimmed);
      await onCreated(created.id);
      handleClose(false);
    } catch (caught) {
      setErrorMessage(formatCreateError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>Workspaces hold your teams.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(changeEvent) => setName(changeEvent.target.value)}
              placeholder="Acme Corp"
              autoFocus
              disabled={submitting}
            />
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleClose(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatCreateError(caught: unknown): string {
  if (isLimitReachedError(caught)) {
    const body = caught.body;
    return `You've used ${body.current ?? "all"} of ${body.limit ?? "your"} workspaces.`;
  }
  return caught instanceof Error ? caught.message : "Failed to create workspace";
}
