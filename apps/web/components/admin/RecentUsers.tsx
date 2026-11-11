"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
  team?: string;
  profileImage?: string | null;
}

export function RecentUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        const raw = response.data;
        const usersData = Array.isArray(raw) ? raw : raw?.data || [];
        // Sort by id or createdAt if available, but take latest 5
        setUsers(usersData.slice(-5).reverse());
      } catch (error) {
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
      <div className="p-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-[#ff6719]" />
        <p className="mt-2 text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex flex-col mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
        <p className="text-sm text-gray-500">Latest registered members</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="h-10 w-10 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[#ff6719]">
                      {user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-700">
                  {user.department || "N/A"}
                </p>
                <p className="text-[10px] text-[#ff6719] font-medium">
                  {user.team || "No Team"}
                </p>
              </div>
            </motion.div>
          ))}
          {users.length === 0 && (
            <div className="py-8 text-center bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
