"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface TocEntry {
  id: string;
  title: string;
}

export type TableOfContentsVariant = "mobile" | "sidebar";

interface TableOfContentsProps {
  entries: TocEntry[];
  variant: TableOfContentsVariant;
}

const SECTION_ROOT_MARGIN = "-96px 0px -55% 0px";

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function pickTopVisibleEntry(entries: IntersectionObserverEntry[]) {
  const visible = entries.filter((entry) => entry.isIntersecting);
  visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
  return visible[0];
}

function createSectionObserver(onActiveChange: (id: string) => void) {
  return new IntersectionObserver((observed) => {
    const top = pickTopVisibleEntry(observed);
    if (top) onActiveChange(top.target.id);
  }, { rootMargin: SECTION_ROOT_MARGIN, threshold: [0, 1] });
}

function observeSectionsById(observer: IntersectionObserver, ids: string[]) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  });
}

function useActiveSectionId(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  useEffect(() => {
    const observer = createSectionObserver(setActiveId);
    observeSectionsById(observer, sectionIds);
    return () => observer.disconnect();
  }, [sectionIds]);
  return activeId;
}

export function TableOfContents({ entries, variant }: TableOfContentsProps) {
  const sectionIds = useMemo(() => entries.map((entry) => entry.id), [entries]);
  const activeId = useActiveSectionId(sectionIds);
  if (variant === "mobile") {
    return <MobileTableOfContents entries={entries} activeId={activeId} />;
  }
  return <SidebarTableOfContents entries={entries} activeId={activeId} />;
}

interface InternalTocProps {
  entries: TocEntry[];
  activeId: string | null;
}

function SidebarTableOfContents({ entries, activeId }: InternalTocProps) {
  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-20 self-start"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-0.5">
        {entries.map((entry) => (
          <SidebarTocLink
            key={entry.id}
            entry={entry}
            isActive={entry.id === activeId}
          />
        ))}
      </ul>
    </nav>
  );
}

interface SidebarTocLinkProps {
  entry: TocEntry;
  isActive: boolean;
}

function SidebarTocLink({ entry, isActive }: SidebarTocLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    scrollToSection(entry.id);
    history.replaceState(null, "", `#${entry.id}`);
  }
  return (
    <li>
      <a
        href={`#${entry.id}`}
        onClick={handleClick}
        aria-current={isActive ? "location" : undefined}
        className={cn(
          "block border-l-2 py-1.5 pl-3 text-sm transition-colors",
          isActive
            ? "border-primary font-medium text-primary"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        {entry.title}
      </a>
    </li>
  );
}

function MobileTableOfContents({ entries, activeId }: InternalTocProps) {
  const fallbackId = entries[0]?.id ?? "";
  return (
    <Select value={activeId ?? fallbackId} onValueChange={scrollToSection}>
      <SelectTrigger className="w-full" aria-label="Jump to section">
        <SelectValue placeholder="Jump to section…" />
      </SelectTrigger>
      <SelectContent>
        {entries.map((entry) => (
          <SelectItem key={entry.id} value={entry.id}>
            {entry.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
