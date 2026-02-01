"use client";

import React, { useState } from "react";
import { users } from "@/lib/data";
import { Search, Filter, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

export function RecentUsers() {
  const [filter, setFilter] = useState("All");

  const departments = [
    "All",
    ...Array.from(new Set(users.map((u) => u.department).filter(Boolean))),
  ];

  const filteredUsers =
    filter === "All" ? users : users.filter((u) => u.department === filter);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold">Recent Users</h3>
          <p className="text-sm text-gray-500">
            Manage and filter community members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md px-2 py-1">
            <Filter size={14} className="text-gray-400 mr-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-sm outline-none cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-900">
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500">
                Name
              </th>
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500">
                Department
              </th>
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500">
                Team
              </th>
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-zinc-900">
            {filteredUsers.map((user, index) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-sm">{user.department || "N/A"}</span>
                </td>
                <td className="py-4 text-sm">
                  <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
                    {user.team || "No Team"}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
