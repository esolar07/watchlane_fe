"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Coverage", href: "coverage", icon: BarChart3 },
  { label: "Settings", href: "", icon: Settings },
] as const;

export function OrgTabNav({
  orgId,
  rightSlot,
}: {
  orgId: string;
  rightSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/organizations/${orgId}`;

  return (
    <div className="flex items-end justify-between border-b border-border">
      <nav className="flex gap-0" aria-label="Organization navigation">
        {tabs.map((tab) => {
          const href = tab.href ? `${base}/${tab.href}` : base;
          const isActive = tab.href
            ? pathname.startsWith(`${base}/${tab.href}`)
            : pathname === base;

          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
      {rightSlot && <div className="pb-2">{rightSlot}</div>}
    </div>
  );
}
