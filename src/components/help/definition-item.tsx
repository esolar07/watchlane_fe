"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { HelpDefinition } from "@/lib/help-content";

const HIGHLIGHT_DURATION_MS = 1800;

interface DefinitionItemProps {
  definition: HelpDefinition;
}

function isCurrentHash(id: string): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash === `#${id}`;
}

function useHashHighlight(id: string): boolean {
  const [isHighlighted, setIsHighlighted] = useState(() => isCurrentHash(id));
  useEffect(() => {
    if (!isHighlighted) return;
    const timer = setTimeout(() => setIsHighlighted(false), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isHighlighted]);
  useEffect(() => {
    const handleHashChange = () => {
      if (isCurrentHash(id)) setIsHighlighted(true);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [id]);
  return isHighlighted;
}

export function DefinitionItem({ definition }: DefinitionItemProps) {
  const isHighlighted = useHashHighlight(definition.id);
  return (
    <article
      id={definition.id}
      className={cn(
        "scroll-mt-24 rounded-md p-2 transition-colors duration-700",
        isHighlighted ? "bg-primary/10" : "bg-transparent",
      )}
    >
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold leading-snug tracking-tight">
          {definition.question}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {definition.answer}
        </p>
        {definition.example && (
          <p className="text-xs italic leading-relaxed text-muted-foreground/80">
            Example: {definition.example}
          </p>
        )}
      </div>
    </article>
  );
}
