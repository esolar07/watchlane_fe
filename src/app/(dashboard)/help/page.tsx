import { HelpSection } from "@/components/help/help-section";
import {
  TableOfContents,
  type TocEntry,
} from "@/components/help/table-of-contents";
import { helpTopics } from "@/lib/help-content";

function buildTocEntries(): TocEntry[] {
  return helpTopics.map(({ id, title }) => ({ id, title }));
}

export default function HelpPage() {
  const tocEntries = buildTocEntries();
  return (
    <div className="mx-auto max-w-4xl">
      <HelpPageHeader />
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_180px] md:gap-12">
        <main className="min-w-0">
          <div className="mb-8 md:hidden">
            <TableOfContents entries={tocEntries} variant="mobile" />
          </div>
          <HelpTopicList />
        </main>
        <aside className="hidden md:block">
          <TableOfContents entries={tocEntries} variant="sidebar" />
        </aside>
      </div>
    </div>
  );
}

function HelpPageHeader() {
  return (
    <header className="mb-10 space-y-2 md:mb-12">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Help &amp; Definitions
      </h1>
      <p className="text-base text-muted-foreground">
        Understand how Watchlane measures email performance.
      </p>
    </header>
  );
}

function HelpTopicList() {
  return (
    <div className="divide-y divide-border [&>section]:py-10 first:[&>section]:pt-0 last:[&>section]:pb-0">
      {helpTopics.map((topic) => (
        <HelpSection key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
