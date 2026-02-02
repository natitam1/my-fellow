"use client";

import React from "react";
import {
  BarChart3,
  Users,
  Calendar,
  HeartHandshake,
  Settings,
  LogOut,
  LayoutDashboard,
  Bell,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: HeartHandshake, label: "Donations", href: "/donations" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-gray-200 bg-white fixed left-0 top-0 transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Toggle Button & Logo Area */}
      <div
        className={cn(
          "flex items-center border-b border-gray-100",
          isCollapsed ? "justify-center p-4" : "justify-between px-4 py-4",
        )}
      >
        {/* Logo - only shown when sidebar is expanded */}
        {!isCollapsed && (
          <div className="w-32 h-12 relative">
            <Image
              src="/images/logo.png"
              alt="FellowAdmin"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors",
            isCollapsed && "mx-auto",
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-md transition-colors",
              pathname === item.href
                ? "bg-gray-100 text-[#ff6719] font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              isCollapsed && "justify-center",
            )}
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
