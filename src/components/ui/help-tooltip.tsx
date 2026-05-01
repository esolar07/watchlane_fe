"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface HelpTooltipProps {
  label: string;
  description: string;
  helpLink?: string;
  className?: string;
  children?: React.ReactNode;
}

export function HelpTooltip({
  label,
  description,
  helpLink,
  className,
  children,
}: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children ?? (
          <button
            type="button"
            aria-label={`More info about ${label}`}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded text-current focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            <span>{label}</span>
            <HelpCircle
              className="h-3 w-3 text-muted-foreground/70"
              aria-hidden="true"
            />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <HelpTooltipBody
          label={label}
          description={description}
          helpLink={helpLink}
        />
      </TooltipContent>
    </Tooltip>
  );
}

function HelpTooltipBody({
  label,
  description,
  helpLink,
}: {
  label: string;
  description: string;
  helpLink?: string;
}) {
  return (
    <div className="max-w-xs space-y-1.5">
      <p className="text-sm font-semibold leading-tight">{label}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {helpLink && <LearnMoreLink href={helpLink} />}
    </div>
  );
}

function LearnMoreLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
    >
      Learn more
      <ArrowRight className="h-3 w-3" aria-hidden="true" />
    </Link>
  );
}
