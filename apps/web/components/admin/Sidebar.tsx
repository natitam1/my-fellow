"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  HeartHandshake,
  UserCheck,
  MapPin,
  Bell,
  Package,
  Briefcase,
  ClipboardList,
  BarChart3,
  UserPlus,
  ShieldCheck,
  Settings,
  ShoppingBag,
  Users2,
  Users,
  ChevronLeft,
  Menu,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useSidebar } from "@/context/admin/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export interface NavItem {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  href: string;
}

export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: DevotionsIcon, label: "Devotions", href: "/admin/devotions" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: HeartHandshake, label: "Givings", href: "/admin/givings" },
  { icon: UserCheck, label: "Leaders", href: "/admin/leaders" },
  { icon: MapPin, label: "Locations", href: "/admin/locations" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
  { icon: Package, label: "Orders", href: "/admin/orders" },
  { icon: Briefcase, label: "Programs", href: "/admin/programs" },
  { icon: ClipboardList, label: "Registrations", href: "/admin/registrations" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: UserPlus, label: "Requests", href: "/admin/requests" },
  { icon: ShieldCheck, label: "Roles", href: "/admin/roles" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
  { icon: ShoppingBag, label: "Store", href: "/admin/store" },
  { icon: Users2, label: "Teams", href: "/admin/teams" },
  { icon: Users, label: "Users", href: "/admin/users" },
];

function DevotionsIcon({ className, size }: { className?: string; size?: number }) {
  return <BookOpen className={className} size={size} />;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    router.push("/signin");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 fixed left-0 top-0 transition-all duration-300 z-50 select-none",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand & Toggle Header */}
      <div
        className={cn(
          "flex items-center border-b border-zinc-100 dark:border-zinc-800 h-16 shrink-0",
          isCollapsed ? "justify-center px-2" : "px-4 justify-between",
        )}
      >
        {!isCollapsed ? (
          <>
            <Link
              href="/admin"
              className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF6719] flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                F
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white group-hover:text-[#FF6719] transition-colors truncate">
                  Fellowship Admin
                </span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                  AAU ECSF
                </span>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Return to Fellowship Web App Quick Link */}
      <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <Link
          href="/"
          title="Return to Fellowship Web App"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#FF6719] dark:hover:text-[#FF6719] hover:bg-[#FF6719]/5 transition-all group",
            isCollapsed && "justify-center px-0",
          )}
        >
          <ArrowLeft
            size={16}
            className="text-zinc-400 group-hover:text-[#FF6719] group-hover:-translate-x-0.5 transition-transform shrink-0"
          />
          {!isCollapsed && (
            <span className="truncate">Return to Fellowship Web App</span>
          )}
        </Link>
      </div>

      {/* Navigation Items (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {adminNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                active
                  ? "bg-[#FF6719]/10 text-[#FF6719] dark:bg-[#FF6719]/15 dark:text-[#FF6719] font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
                isCollapsed && "justify-center px-0 py-2.5",
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  active
                    ? "text-[#FF6719]"
                    : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300",
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {active && (
                <span
                  className={cn(
                    "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#FF6719]",
                    isCollapsed && "left-0",
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-1">
        <button
          onClick={handleSignOut}
          title={isCollapsed ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer",
            isCollapsed && "justify-center px-0",
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
