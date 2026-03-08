"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Users as UsersIcon } from "lucide-react";
import { User } from "./types";
import UsersFilter from "../../components/users/UsersFilter";
import UsersTable from "../../components/users/UsersTable";
import UsersPagination from "../../components/users/UsersPagination";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Debounce search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (teamFilter !== "all") params.append("team", teamFilter);
      if (yearFilter !== "all") params.append("yearOfStudy", yearFilter);
      if (departmentFilter !== "all")
        params.append("department", departmentFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      const raw = response.data;

      if (raw.pagination) {
        setUsers(raw.data || []);
        setTotalPages(raw.pagination.totalPages);
        setTotalUsers(raw.pagination.total);
      } else {
        const usersData = Array.isArray(raw) ? raw : raw?.data || [];
        setUsers(usersData);
        setTotalUsers(usersData.length);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, teamFilter, yearFilter, departmentFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page to 1 when any filter or debounced search changes
  useEffect(() => {
    setPage(1);
  }, [teamFilter, yearFilter, departmentFilter, debouncedSearch]);

  const handleReset = () => {
    setSearch("");
    setTeamFilter("all");
    setYearFilter("all");
    setDepartmentFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Users
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Browse and manage all registered community members with advanced
            filters.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-4xl border border-gray-100 shadow-xl shadow-orange-50/40 transition-all duration-300 hover:shadow-orange-100/50">
          <div className="bg-orange-50 p-4 rounded-2xl group transition-all duration-300 hover:rotate-6">
            <UsersIcon className="text-[#ff6719] w-7 h-7" />
          </div>
          <div className="flex flex-col justify-center min-w-[120px]">
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] leading-none mb-3 font-mono">
              Total Community
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                {totalUsers}
              </span>
              <div className="h-6 w-[2px] bg-emerald-100 rounded-full" />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-600 font-black tracking-widest leading-none mb-1">
                  ACTIVE
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">
                  Real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UsersFilter
        search={search}
        setSearch={setSearch}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        onReset={handleReset}
      />

      <UsersTable users={users} loading={loading} error={error} />

      <UsersPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        totalUsers={totalUsers}
        currentCount={users.length}
      />
    </div>
  );
}
