"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Mail, Settings, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Operational", href: "operational", icon: Activity },
  { label: "Performance", href: "performance", icon: BarChart3 },
  { label: "Rules", href: "rules", icon: ShieldAlert },
  { label: "Email accounts", href: "email-accounts", icon: Mail },
  { label: "Settings", href: "", icon: Settings },
] as const;

export function TeamTabNav({
  teamId,
  rightSlot,
}: {
  teamId: string;
  rightSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/teams/${teamId}`;

  return (
    <div className="flex items-end justify-between border-b">
      <nav className="flex gap-1" aria-label="Team navigation">
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
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {rightSlot && <div className="pb-2">{rightSlot}</div>}
    </div>
  );
}
