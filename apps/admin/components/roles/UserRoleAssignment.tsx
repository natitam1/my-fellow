"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Phone,
  MessageSquare,
  Sliders,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AdminPagination from "@/components/shared/AdminPagination";
import UserGrantsModal from "./UserGrantsModal";
import { ROLES, getRoleBadge, normalizeRole } from "@/app/roles/rbac-data";
import { Role, UserRoleRecord } from "@/app/roles/types";

interface UserRoleAssignmentProps {
  initialRoleFilter?: string;
  onRoleCountsUpdated?: (counts: Record<Role, number>) => void;
}

export default function UserRoleAssignment({
  initialRoleFilter = "all",
  onRoleCountsUpdated,
}: UserRoleAssignmentProps) {
  const [users, setUsers] = useState<UserRoleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>(initialRoleFilter);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Role updating state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Grants Modal
  const [selectedUserForGrants, setSelectedUserForGrants] = useState<UserRoleRecord | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync roleFilter when parent prop changes
  useEffect(() => {
    if (initialRoleFilter) {
      setRoleFilter(initialRoleFilter);
      setPage(1);
    }
  }, [initialRoleFilter]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      const raw = response.data;

      if (raw.pagination) {
        setUsers(raw.data || []);
        setTotalPages(raw.pagination.totalPages);
        setTotalUsers(raw.pagination.total);
      } else {
        const usersData: UserRoleRecord[] = Array.isArray(raw) ? raw : raw?.data || [];
        setUsers(usersData);
        setTotalUsers(usersData.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Failed to fetch users for RBAC console", err);
      setError(
        err.response?.data?.message ||
          "Failed to load user directory. Please check network and permissions."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when search or roleFilter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    const userToUpdate = users.find((u) => u._id === userId);
    if (!userToUpdate || userToUpdate.role === newRole) return;

    // Warning confirmation for Super Admin promotion
    if (newRole === "super_admin") {
      const confirmed = window.confirm(
        `Are you sure you want to promote "${userToUpdate.fullName}" to Super Administrator?\n\nThis grants full, unrestricted access to the entire fellowship platform, financial gateways, and security controls.`
      );
      if (!confirmed) return;
    }

    try {
      setUpdatingUserId(userId);
      await api.patch(`/rbac/users/${userId}/role`, {
        role: newRole,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );

      toast.success(
        `Updated role for ${userToUpdate.fullName} to ${newRole.replace("_", " ")}`
      );
      // Trigger parent count update or refresh
      fetchUsers();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to update user role";
      toast.error(msg);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#ff6719]" />
            User Role Assignment Console
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Search members, appoint ministry hierarchy roles, and manage granular permission overrides.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by full name, phone number, or Telegram..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#ff6719] focus:ring-1 focus:ring-[#ff6719]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-xs text-gray-600">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-900 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="leader">Leader</option>
              <option value="team_leader">Team Leader</option>
              <option value="coordinator">Coordinator</option>
              <option value="member">Member</option>
            </select>
          </div>

          {(search || roleFilter !== "all") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-gray-900 underline font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#ff6719] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">
              Loading user directory and role states...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3 bg-red-50/50">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-xs font-semibold text-rose-800">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Fellowship Member
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Contact & Identifiers
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Department & Team
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Current Role
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Assign Role Action
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">
                    Granular Overrides
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const normalizedCurrentRole = normalizeRole(user.role);
                  const isUpdating = updatingUserId === user._id;

                  const teamName =
                    typeof user.team === "object" && user.team
                      ? user.team.name
                      : user.team || "No Team Assigned";

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600 shrink-0">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (user.fullName || "U").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors">
                              {user.fullName || "Unnamed Member"}
                            </div>
                            <code className="text-[10px] text-gray-400 font-mono block">
                              {user._id.substring(0, 8)}...
                            </code>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {user.phoneNumber ? (
                            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No phone</span>
                          )}
                          {user.telegramUserName && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <MessageSquare className="w-3 h-3 text-[#ff6719]/70" />
                              <span>@{user.telegramUserName.replace("@", "")}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Department & Team */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-gray-800">
                            {user.department || "No Department"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                              {teamName}
                            </span>
                            {user.yearOfStudy && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                Year {user.yearOfStudy}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.className}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Assign Role Dropdown */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block w-40">
                          {isUpdating ? (
                            <div className="flex items-center gap-1.5 text-gray-500 py-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff6719]" />
                              <span>Saving...</span>
                            </div>
                          ) : (
                            <select
                              value={normalizedCurrentRole}
                              onChange={(e) =>
                                handleRoleChange(user._id, e.target.value as Role)
                              }
                              className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:outline-hidden focus:border-[#ff6719] focus:ring-1 focus:ring-[#ff6719] cursor-pointer"
                            >
                              <option value="super_admin">Super Admin</option>
                              <option value="leader">Leader</option>
                              <option value="team_leader">Team Leader</option>
                              <option value="coordinator">Coordinator</option>
                              <option value="member">Member</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Granular Grants / Override Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedUserForGrants(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
                        >
                          <Sliders className="w-3.5 h-3.5 text-gray-500" />
                          <span>Overrides</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-gray-400 italic text-xs"
                    >
                      No users match the search and role filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <AdminPagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
          totalItems={totalUsers}
          currentCount={users.length}
          label="Members"
        />
      </div>

      {/* Granular Grants Modal */}
      <UserGrantsModal
        user={selectedUserForGrants}
        isOpen={!!selectedUserForGrants}
        onClose={() => setSelectedUserForGrants(null)}
        onGrantsUpdated={fetchUsers}
      />
    </div>
  );
}
