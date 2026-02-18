"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Organizations", href: "/organizations", icon: Building2 },
  { label: "Email Accounts", href: "/email-accounts", icon: Mail },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          "max-md:-translate-x-full max-md:w-[260px]",
          mobileOpen && "max-md:translate-x-0",
          "md:z-30",
          collapsed ? "md:w-[68px]" : "md:w-[240px]",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 mt-4">
          <div className="flex items-center">
            {!collapsed || mobileOpen ? (
              <Image
                src="/logo.svg"
                alt="WatchLane"
                width={140}
                height={140}
                className="shrink-0 brightness-0 invert"
                priority
              />
            ) : (
              <Image
                src="/logo-icon.svg"
                alt="WatchLane"
                width={28}
                height={28}
                className="shrink-0 brightness-0 invert"
                priority
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  collapsed && "max-md:justify-start max-md:px-3 md:justify-center md:px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {collapsed ? (
                  <span className="md:hidden">{item.label}</span>
                ) : (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-sidebar-border p-3 md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              collapsed && "px-0",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
