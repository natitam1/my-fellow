"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} coming soon`, {
      description: "This setting panel is being rolled out in the next update.",
    });
    setIsMenuOpen(false);
  };

  const displayName = user?.fullName || "Admin User";
  const displayRole = (user?.role || "super_admin").replace(/_/g, " ");

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-all select-none">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          Admin Portal
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => toast.info("No unread notifications")}
          className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#FF6719] transition-all cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6719] rounded-full ring-2 ring-white dark:ring-zinc-900" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-[#FF6719] font-bold uppercase tracking-wider mt-0.5">
              {displayRole}
            </p>
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 group focus:outline-hidden cursor-pointer"
              aria-expanded={isMenuOpen}
              aria-label="Admin user menu"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden ring-1 ring-transparent group-hover:ring-[#FF6719]/40 transition-all">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[#FF6719] font-bold text-sm">
                    {user?.fullName ? (
                      user.fullName.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon size={16} className="text-zinc-400" />
                    )}
                  </div>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "text-zinc-400 transition-transform duration-200",
                  isMenuOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 origin-top-right overflow-hidden p-1.5"
                >
                  {/* User Profile Summary */}
                  <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {user?.phoneNumber || user?.email || "Admin Access"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/admin/settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Settings size={15} className="text-zinc-400" />
                      Settings & Preferences
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/admin/roles");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Shield size={15} className="text-zinc-400" />
                      Roles & RBAC
                    </button>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
