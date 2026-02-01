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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <div className="flex flex-col h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 px-2 py-4 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#ff6719] flex items-center justify-center">
          <span className="text-white font-bold">F</span>
        </div>
        <span className="text-xl font-bold tracking-tight">FellowAdmin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href
                ? "bg-gray-100 dark:bg-gray-900 text-[#ff6719] font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100",
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
