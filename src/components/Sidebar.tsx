"use client";

import { useState } from "react";
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
  RefreshCw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { triggerSync } from "@/services/api";

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
  const { organizations } = useAuth();

  const canSync = organizations.some(
    (o) => o.role === "OWNER" || o.role === "ADMIN"
  );

  const [syncState, setSyncState] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  async function handleSync() {
    if (syncState === "syncing") return;
    setSyncState("syncing");
    try {
      await triggerSync();
      setSyncState("success");
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 3000);
    }
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          "max-md:-translate-x-full max-md:w-[240px]",
          mobileOpen && "max-md:translate-x-0",
          "md:z-30",
          collapsed ? "md:w-[60px]" : "md:w-[220px]",
        )}
      >
        {/* Brand */}
        <div className="flex h-12 items-center justify-between px-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
              W
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="text-[13.5px] font-semibold tracking-tight">Watchlane</span>
            )}
            <Image src="/logo.svg" alt="" width={0} height={0} className="hidden" priority />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="mt-3 flex flex-1 flex-col gap-px px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  collapsed && "md:justify-center md:px-0",
                )}
              >
                <item.icon className={cn("h-[15px] w-[15px] shrink-0", isActive ? "text-primary" : "")} />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sync */}
        {canSync && (
          <div className="border-t border-sidebar-border px-2 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncState === "syncing" || syncState === "success"}
              title={collapsed ? "Sync Mail" : undefined}
              aria-label={collapsed ? "Sync Mail" : undefined}
              className={cn(
                "w-full justify-start text-[12.5px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                collapsed && "md:justify-center md:px-0",
                syncState === "success" && "text-emerald-500 hover:text-emerald-500",
                syncState === "error" && "text-red-500 hover:text-red-500",
              )}
            >
              {syncState === "syncing" ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                  {!collapsed && <span className="ml-2">Syncing…</span>}
                </>
              ) : syncState === "success" ? (
                <>
                  <Check className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="ml-2">Synced</span>}
                </>
              ) : syncState === "error" ? (
                <>
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="ml-2">Sync failed</span>}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="ml-2">Sync mail</span>}
                </>
              )}
            </Button>
          </div>
        )}

        <div className="hidden border-t border-sidebar-border p-2 md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full justify-start text-[12.5px] text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "px-0 justify-center",
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
