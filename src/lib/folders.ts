import type { EmailFolder, SystemFolderKind } from "@/types/email-account";

export interface FolderNode {
  folder: EmailFolder;
  children: FolderNode[];
  depth: number;
}

const SYSTEM_ORDER: SystemFolderKind[] = [
  "INBOX",
  "SENT_ITEMS",
  "DRAFTS",
  "JUNK_EMAIL",
  "DELETED_ITEMS",
];

function compareFolders(a: EmailFolder, b: EmailFolder) {
  if (a.isSystem && b.isSystem) {
    const ai = a.systemKind ? SYSTEM_ORDER.indexOf(a.systemKind) : 99;
    const bi = b.systemKind ? SYSTEM_ORDER.indexOf(b.systemKind) : 99;
    if (ai !== bi) return ai - bi;
  } else if (a.isSystem !== b.isSystem) {
    return a.isSystem ? -1 : 1;
  }
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export function buildFolderIndex(
  folders: EmailFolder[],
): Map<string, EmailFolder> {
  const map = new Map<string, EmailFolder>();
  for (const f of folders) map.set(f.id, f);
  return map;
}

export function buildFolderTree(folders: EmailFolder[]): FolderNode[] {
  const childrenById = new Map<string | null, EmailFolder[]>();
  for (const f of folders) {
    const list = childrenById.get(f.parentId) ?? [];
    list.push(f);
    childrenById.set(f.parentId, list);
  }

  function build(parentId: string | null, depth: number): FolderNode[] {
    const list = childrenById.get(parentId) ?? [];
    return [...list].sort(compareFolders).map((folder) => ({
      folder,
      depth,
      children: build(folder.id, depth + 1),
    }));
  }

  return build(null, 0);
}

export function flattenVisibleTree(
  nodes: FolderNode[],
  expanded: Set<string>,
): FolderNode[] {
  const out: FolderNode[] = [];
  function walk(list: FolderNode[]) {
    for (const node of list) {
      out.push(node);
      if (node.children.length > 0 && expanded.has(node.folder.id)) {
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return out;
}

export function effectiveMonitored(
  folder: EmailFolder,
  byId: Map<string, EmailFolder>,
): boolean {
  if (
    folder.systemKind === "JUNK_EMAIL" ||
    folder.systemKind === "DELETED_ITEMS"
  ) {
    return false;
  }
  let cursor: EmailFolder | undefined = folder;
  while (cursor) {
    if (cursor.monitored !== null) return cursor.monitored;
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }
  return false;
}

export function isFolderEditable(folder: EmailFolder): boolean {
  if (!folder.isSystem) return true;
  return folder.systemKind === "INBOX";
}

export function systemFolderNote(kind: SystemFolderKind): string {
  switch (kind) {
    case "SENT_ITEMS":
      return "System folder — Sent items are always synced for coverage tracking.";
    case "DRAFTS":
      return "System folder — Drafts are never monitored.";
    case "JUNK_EMAIL":
      return "System folder — Junk Email is never monitored.";
    case "DELETED_ITEMS":
      return "System folder — Deleted Items are never monitored.";
    case "INBOX":
      return "";
  }
}
