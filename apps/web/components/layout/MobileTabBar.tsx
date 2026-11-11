"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users, Calendar, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Devotions", href: "/devotions", icon: BookOpen },
  { name: "Community", href: "/community", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // If in admin dashboard, mobile tab bar should yield to admin navigation
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 block border-t border-border/80 bg-background/90 backdrop-blur-lg md:hidden pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid h-14 grid-cols-5 items-center px-1">
        {TABS.map((tab) => {
          const active = isTabActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "relative flex h-full flex-col items-center justify-center gap-1 py-1 transition-colors select-none",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active Tab Indicator Top Pill */}
              {active && (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-primary" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-150",
                    active && "scale-110 stroke-[2.25]"
                  )}
                />
                {/* Auth indicator dot on profile icon */}
                {tab.name === "Profile" && isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
                )}
              </div>

              <span className="text-[10px] tracking-tight leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileTabBar;
