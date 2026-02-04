"use client";

import React, { useEffect, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { getUser, removeToken, setUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";

export function DashboardHeader() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleSignOut = () => {
    removeToken();
    router.push("/signin");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-6">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-all active:scale-95 group">
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-1 ring-gray-100 hover:ring-[#ff6719]/30 transition-all active:scale-90"
            >
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
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Account
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
