"use client";

import { useState, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/organizations": "Organizations",
  "/email-accounts": "Email Accounts",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return title;
    }
  }
  return "Dashboard";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const handleMobileClose = useCallback(() => setMobileOpen(false), []);
  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <TopNav
        title={title}
        sidebarCollapsed={collapsed}
        onMobileMenuOpen={handleMobileOpen}
      />

      <main
        id="main-content"
        className={cn(
          "pt-16 transition-all duration-300",
          "pl-0 md:pl-[240px]",
          collapsed && "md:pl-[68px]",
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
