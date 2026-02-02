"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
  team?: string;
}

export function RecentUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        setUsers(response.data.slice(0, 5)); // Take top 5
      } catch (error) {
        // Silently fail or log warning if admin endpoint is not ready
        console.warn(
          "Could not fetch recent users (admin endpoint may be missing)",
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold">Recent Users</h3>
          <p className="text-sm text-gray-500">Latest registered members</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500">
                Name
              </th>
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500">
                Department
              </th>
              <th className="pb-4 pt-2 font-medium text-sm text-gray-500">
                Team
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user, index) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-gray-50 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#ff6719]">
                      {user.fullName ? user.fullName.charAt(0) : "U"}
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
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                    {user.team || "No Team"}
                  </span>
                </td>
              </motion.tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
