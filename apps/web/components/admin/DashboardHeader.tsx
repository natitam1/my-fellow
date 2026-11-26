"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  Search,
  Database,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/admin/CommandPalette";

interface DashboardHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_demo_mode");
      setIsDemoMode(stored === "true");
    }
  }, []);

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_demo_mode", String(next));
    }
    toast.success(next ? "Demo seed data enabled" : "Live API data mode enabled", {
      description: next
        ? "Mock seed fallbacks active for testing empty DB states."
        : "Direct network requests active.",
    });
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMenuOpen]);

  const handleSignOut = () => {
    logout();
    router.push("/signin");
  };

  const displayName = user?.fullName || "Fellowship Administrator";
  const displayRole = (user?.role || "super_admin").replace(/_/g, " ");

  return (
    <>
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all select-none gap-4">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenMobileMenu}
              className="md:hidden h-9 w-9 text-muted-foreground"
              title="Open navigation menu"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="h-9 px-3 gap-2 text-xs text-muted-foreground bg-muted/30 border-dashed hover:border-solid hover:bg-muted/60 transition-all font-normal hidden sm:flex items-center"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search or jump to...</span>
            <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandOpen(true)}
            className="sm:hidden h-9 w-9 text-muted-foreground"
            title="Search"
            aria-label="Search command palette"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Data Mode Pill */}
          <button
            onClick={toggleDemoMode}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer",
              isDemoMode
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
            )}
            title="Toggle Demo Seed Data Fallback"
          >
            <Database className="h-3 w-3" />
            <span className="hidden md:inline font-medium">
              {isDemoMode ? "Demo Seeds: Active" : "Live API"}
            </span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => router.push("/admin/notifications")}
            className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-primary transition-all cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-zinc-900" />
          </button>

          {/* User Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-zinc-200 dark:border-zinc-800">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                {displayRole}
              </p>
            </div>

            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                aria-label="Open user menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                  {displayName.charAt(0)}
                </div>
                <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
              </button>

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] capitalize truncate">
                      {displayRole}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                    >
                      <UserIcon size={14} />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/admin/settings");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                    >
                      <Settings size={14} />
                      <span>Admin Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/admin/roles");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                    >
                      <Shield size={14} />
                      <span>Permissions & RBAC</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors text-left font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
