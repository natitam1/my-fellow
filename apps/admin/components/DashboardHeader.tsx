"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  User,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
} from "lucide-react";
import { getUser, removeToken, setUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function DashboardHeader() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const storedUser = getUser();
      if (storedUser) {
        setAdmin(storedUser);
        return;
      }

      try {
        const response = await api.get("/admin/users");
        const raw = response.data;
        const usersData = Array.isArray(raw) ? raw : raw?.data || [];
        const foundAdmin = usersData.find((u: any) => u.role === "admin");

        if (foundAdmin) {
          setAdmin(foundAdmin);
          setUser(foundAdmin);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile", error);
      }
    };

    fetchAdminProfile();
  }, []);

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
    removeToken();
    router.push("/signin");
  };

  const handleComingSoon = () => {
    toast("Feature coming soon! ", {
      style: {
        borderRadius: "12px",
        background: "#fff",
        color: "#ff6719",
        fontSize: "13px",
        fontWeight: "600",
      },
    });
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-6">
        <button
          onClick={handleComingSoon}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-all active:scale-95 group"
        >
          <Bell
            size={20}
            className="text-gray-600 group-hover:text-[#ff6719] transition-colors"
          />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6719] rounded-full border-2 border-white ring-2 ring-orange-100"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {admin?.fullName || "Admin User"}
            </p>
            <p className="text-[10px] text-[#ff6719] font-black uppercase tracking-wider mt-0.5">
              {admin?.role || "Super Admin"}
            </p>
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-1 ring-gray-100 group-hover:ring-[#ff6719]/30 transition-all active:scale-95">
                {admin?.profileImage ? (
                  <img
                    src={admin.profileImage}
                    alt={admin.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[#ff6719] font-bold text-lg">
                    {admin?.fullName ? (
                      admin.fullName.charAt(0).toUpperCase()
                    ) : (
                      <User size={20} className="text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "text-gray-400 transition-transform duration-200",
                  isMenuOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-20 origin-top-right overflow-hidden backdrop-blur-xl bg-white/95"
                >
                  {/* User Profile Summary */}
                  <div className="px-5 py-4 border-b border-gray-50 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6719] font-bold overflow-hidden border border-orange-100">
                        {admin?.profileImage ? (
                          <img
                            src={admin.profileImage}
                            alt={admin.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          admin?.fullName?.charAt(0).toUpperCase() || "A"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {admin?.fullName || "Admin User"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {admin?.phoneNumber || "Admin Access"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 pb-2 space-y-1">
                    <button
                      onClick={handleComingSoon}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                    >
                      <User size={16} className="text-gray-400" />
                      View Profile
                    </button>
                    <button
                      onClick={handleComingSoon}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                    >
                      <Shield size={16} className="text-gray-400" />
                      Security
                    </button>
                    <button
                      onClick={handleComingSoon}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Account Settings
                    </button>

                    <div className="h-px bg-gray-50 my-2 mx-2" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold group/logout"
                    >
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover/logout:bg-red-100 transition-colors">
                        <LogOut size={16} />
                      </div>
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
