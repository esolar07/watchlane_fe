import type { HelpTopic } from "@/lib/help-content";
import { DefinitionItem } from "./definition-item";

interface HelpSectionProps {
  topic: HelpTopic;
}

export function HelpSection({ topic }: HelpSectionProps) {
  const titleId = `${topic.id}-title`;
  return (
    <section
      id={topic.id}
      aria-labelledby={titleId}
      className="scroll-mt-24"
    >
      <h2
        id={titleId}
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        {topic.title}
      </h2>
      <div className="mt-6 space-y-6">
        {topic.definitions.map((definition) => (
          <DefinitionItem key={definition.id} definition={definition} />
        ))}
      </div>
    </section>
  );
}
