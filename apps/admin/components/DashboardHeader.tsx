"use client";

import React from "react";
import { Bell, User } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6719] rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
            <User size={24} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
