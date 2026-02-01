"use client";

import React from "react";
import { Search, Bell, User } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search something..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-[#ff6719] transition-all outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
          <Bell size={20} className="text-gray-600 dark:text-gray-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6719] rounded-full border-2 border-white dark:border-black"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-white dark:border-black shadow-sm overflow-hidden">
            <User size={24} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
