"use client";

import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronLeft,
  ClipboardList,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  UserCheck,
  UserPlus,
  Users,
  Users2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: ClipboardList, label: "Registrations", href: "/registrations" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Briefcase, label: "Programs", href: "/programs" },
  { icon: MapPin, label: "Locations", href: "/locations" },
  { icon: UserCheck, label: "Leaders", href: "/leaders" },
  { icon: Users2, label: "Teams", href: "/teams" },
  { icon: HeartHandshake, label: "Givings", href: "/givings" },
  { icon: BookOpen, label: "Devotions", href: "/devotions" },
  { icon: ShoppingBag, label: "Store", href: "/store" },
  { icon: Package, label: "Orders", href: "/orders" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: UserPlus, label: "Join Requests", href: "/requests" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleSignOut = () => {
    removeToken();
    router.push("/signin");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-gray-200 bg-white fixed left-0 top-0 transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "flex items-center border-b border-gray-100 h-24",
          isCollapsed ? "justify-center" : "px-4 justify-between",
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="w-64 h-40 relative pointer-events-none overflow-hidden">
              <Image
                src="/images/logo-primary.png"
                alt="FellowAdmin"
                fill
                className="object-contain"
                priority
              />
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-900 transition-colors p-1"
            >
              <ChevronLeft size={24} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 transition-colors p-2"
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 px-2 py-6 relative z-10">
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

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-md text-red-600 hover:bg-red-50 transition-colors",
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
