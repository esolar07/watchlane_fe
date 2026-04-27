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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-primary-foreground focus:shadow-lg"
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
          "pt-12 transition-all duration-200",
          "pl-0 md:pl-[220px]",
          collapsed && "md:pl-[60px]",
        )}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
