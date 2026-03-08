"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Loader2,
  Phone,
  Calendar,
  Shield,
  Users as UsersIcon,
  MessageSquare,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
  team?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
  profileImage?: string | null;
  role?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/users");
        const raw = response.data;
        const usersData = Array.isArray(raw) ? raw : raw?.data || [];
        setUsers(usersData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTelegram = (username: string) => {
    if (!username) return "";
    return username.startsWith("@") ? username : `@${username}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-[#ff6719] w-10 h-10" />
        <p className="text-gray-500 font-medium">Loading registered users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-xl border border-red-100">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <Shield className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-red-900">Error</h3>
        <p className="text-red-600 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Users
          </h1>
          <p className="text-gray-500 mt-1">
            Browse and manage all registered community members.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100">
          <div className="bg-[#ff6719]/10 p-2 rounded-xl">
            <UsersIcon className="text-[#ff6719] w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-xl font-black text-gray-900 leading-none">
              {users.length}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden border border-gray-100 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  User Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Contact & Social
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Academics
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50/80 transition-all duration-200 group relative"
                >
                  <td className="px-6 py-5 whitespace-nowrap relative">
                    {/* Hover accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6719] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center">
                      <div className="relative h-11 w-11 flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="h-11 w-11 rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-base group-hover:bg-[#ff6719]/10 group-hover:text-[#ff6719] transition-colors">
                            {user.fullName
                              ? user.fullName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${user.role === "admin" ? "bg-indigo-500" : "bg-emerald-500"}`}
                        ></span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 group-hover:translate-x-0.5 transition-transform duration-200">
                          {user.fullName || "Unnamed User"}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {user._id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1.5">
                      <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
                          <Phone size={12} className="text-gray-400" />
                        </div>
                        {user.phoneNumber}
                      </div>
                      {user.telegramUserName && (
                        <div className="text-xs text-blue-500 flex items-center gap-2 hover:underline cursor-pointer">
                          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                            <MessageSquare
                              size={12}
                              className="text-blue-400"
                            />
                          </div>
                          {formatTelegram(user.telegramUserName)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-gray-800">
                        {user.department || "No Department"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          {user.yearOfStudy || "N/A"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-[#ff6719] font-medium">
                          {user.team || "No Team"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {user.role === "admin" && (
                        <Shield size={10} className="mr-1.5" />
                      )}
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-gray-400" />
                      {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <UsersIcon className="text-gray-300 w-8 h-8" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No registered users found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center italic">
            Displaying only authorized information. Personal data is encrypted
            on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
