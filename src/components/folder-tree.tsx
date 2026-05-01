"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Inbox,
  Send,
  FileText,
  AlertOctagon,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  buildFolderIndex,
  buildFolderTree,
  effectiveMonitored,
  flattenVisibleTree,
  isFolderEditable,
  systemFolderNote,
  type FolderNode,
} from "@/lib/folders";
import type { EmailFolder, SystemFolderKind } from "@/types/email-account";
import {
  FolderMonitoredControl,
  type MonitoredState,
} from "@/components/folder-monitored-control";

const systemIcons: Record<SystemFolderKind, typeof Folder> = {
  INBOX: Inbox,
  SENT_ITEMS: Send,
  DRAFTS: FileText,
  JUNK_EMAIL: AlertOctagon,
  DELETED_ITEMS: Trash2,
};

interface FolderTreeProps {
  folders: EmailFolder[];
  pendingIds: Set<string>;
  backfillingIds: Set<string>;
  onToggle: (folder: EmailFolder, next: MonitoredState) => void;
}

export function FolderTree({
  folders,
  pendingIds,
  backfillingIds,
  onToggle,
}: FolderTreeProps) {
  const tree = useMemo(() => buildFolderTree(folders), [folders]);
  const byId = useMemo(() => buildFolderIndex(folders), [folders]);

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const f of folders) {
      if (f.parentId === null) initial.add(f.id);
    }
    return initial;
  });

  const visible = useMemo(
    () => flattenVisibleTree(tree, expanded),
    [tree, expanded],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, node: FolderNode) => {
      const idx = visible.findIndex((n) => n.folder.id === node.folder.id);
      if (idx === -1) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = visible[idx + 1];
          if (next) focusRow(next.folder.id);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = visible[idx - 1];
          if (prev) focusRow(prev.folder.id);
          break;
        }
        case "ArrowRight": {
          if (node.children.length > 0 && !expanded.has(node.folder.id)) {
            e.preventDefault();
            toggleExpand(node.folder.id);
          }
          break;
        }
        case "ArrowLeft": {
          if (node.children.length > 0 && expanded.has(node.folder.id)) {
            e.preventDefault();
            toggleExpand(node.folder.id);
          }
          break;
        }
        case "Enter":
        case " ": {
          if (node.children.length > 0) {
            e.preventDefault();
            toggleExpand(node.folder.id);
          }
          break;
        }
      }
    },
    [visible, expanded, toggleExpand],
  );

  return (
    <ul role="tree" aria-label="Mailbox folders" className="divide-y">
      {tree.map((node) => (
        <FolderRowGroup
          key={node.folder.id}
          node={node}
          expanded={expanded}
          byId={byId}
          pendingIds={pendingIds}
          backfillingIds={backfillingIds}
          onToggle={onToggle}
          onToggleExpand={toggleExpand}
          onKey={handleKey}
        />
      ))}
    </ul>
  );
}

function focusRow(id: string) {
  const el = document.getElementById(`folder-row-${id}`);
  el?.focus();
}

interface RowGroupProps {
  node: FolderNode;
  expanded: Set<string>;
  byId: Map<string, EmailFolder>;
  pendingIds: Set<string>;
  backfillingIds: Set<string>;
  onToggle: (folder: EmailFolder, next: MonitoredState) => void;
  onToggleExpand: (id: string) => void;
  onKey: (e: React.KeyboardEvent<HTMLLIElement>, node: FolderNode) => void;
}

function FolderRowGroup({
  node,
  expanded,
  byId,
  pendingIds,
  backfillingIds,
  onToggle,
  onToggleExpand,
  onKey,
}: RowGroupProps) {
  const isOpen = expanded.has(node.folder.id);
  const hasChildren = node.children.length > 0;

  return (
    <li
      id={`folder-row-${node.folder.id}`}
      role="treeitem"
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-level={node.depth + 1}
      aria-selected={false}
      tabIndex={0}
      onKeyDown={(e) => onKey(e, node)}
      className="focus:outline-none focus-visible:bg-accent/40"
    >
      <FolderRow
        node={node}
        isOpen={isOpen}
        hasChildren={hasChildren}
        byId={byId}
        pending={pendingIds.has(node.folder.id)}
        backfilling={backfillingIds.has(node.folder.id)}
        onToggle={onToggle}
        onToggleExpand={onToggleExpand}
      />
      {hasChildren && isOpen && (
        <ul role="group" className="border-t">
          {node.children.map((child) => (
            <FolderRowGroup
              key={child.folder.id}
              node={child}
              expanded={expanded}
              byId={byId}
              pendingIds={pendingIds}
              backfillingIds={backfillingIds}
              onToggle={onToggle}
              onToggleExpand={onToggleExpand}
              onKey={onKey}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface RowProps {
  node: FolderNode;
  isOpen: boolean;
  hasChildren: boolean;
  byId: Map<string, EmailFolder>;
  pending: boolean;
  backfilling: boolean;
  onToggle: (folder: EmailFolder, next: MonitoredState) => void;
  onToggleExpand: (id: string) => void;
}

function FolderRow({
  node,
  isOpen,
  hasChildren,
  byId,
  pending,
  backfilling,
  onToggle,
  onToggleExpand,
}: RowProps) {
  const { folder, depth } = node;
  const editable = isFolderEditable(folder);
  const effective = effectiveMonitored(folder, byId);

  const Icon = folder.systemKind
    ? systemIcons[folder.systemKind]
    : isOpen && hasChildren
    ? FolderOpen
    : Folder;

  const note =
    folder.isSystem && folder.systemKind
      ? systemFolderNote(folder.systemKind)
      : "";

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2.5 pr-3 transition-colors hover:bg-accent/30",
      )}
      style={{ paddingLeft: `${12 + depth * 20}px` }}
    >
      <button
        type="button"
        aria-hidden={!hasChildren}
        tabIndex={-1}
        onClick={() => hasChildren && onToggleExpand(folder.id)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground",
          hasChildren ? "hover:bg-accent" : "invisible",
        )}
        aria-label={isOpen ? "Collapse" : "Expand"}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            isOpen && "rotate-90",
          )}
        />
      </button>

      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span
            className="truncate text-sm font-medium"
            title={folder.path}
          >
            {folder.name}
          </span>
          {folder.isNew && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              <Sparkles className="h-2.5 w-2.5" />
              New
            </Badge>
          )}
          {backfilling && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Pulling last 30 days from Outlook…
            </span>
          )}
        </div>
        <span
          className="truncate text-xs text-muted-foreground"
          title={folder.path}
        >
          {folder.path}
        </span>
        {note && (
          <span className="text-xs text-muted-foreground/80">{note}</span>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <FolderMonitoredControl
          value={folder.monitored}
          effective={effective}
          disabled={!editable}
          loading={pending}
          onChange={(next) => onToggle(folder, next)}
        />
      </div>
    </div>
  );
}
