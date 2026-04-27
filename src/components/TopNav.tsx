"use client";

import { Search, LogOut, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title: string;
  sidebarCollapsed: boolean;
  onMobileMenuOpen: () => void;
}

export function TopNav({ title, sidebarCollapsed, onMobileMenuOpen }: TopNavProps) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md transition-all duration-200 md:px-5",
        "left-0 md:left-[220px]",
        sidebarCollapsed && "md:left-[60px]",
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuOpen}
          className="md:hidden -ml-1.5 h-8 w-8 p-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-[13.5px] font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search…"
            className="h-8 w-56 rounded-md border-border/80 bg-muted/40 pl-8 text-[13px] placeholder:text-muted-foreground/70 focus-visible:bg-card"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:flex">
            ⌘K
          </kbd>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7 cursor-pointer ring-1 ring-border">
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-lg p-1.5">
            <div className="px-2 py-1.5">
              <p className="truncate text-[13px] font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="text-[13px]">
              <User className="mr-2 h-3.5 w-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={logout} className="text-[13px]">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
