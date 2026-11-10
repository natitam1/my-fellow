"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Users as UsersIcon } from "lucide-react";
import { User } from "./types";
import UsersFilter from "../../components/users/UsersFilter";
import UsersTable from "../../components/users/UsersTable";
import AdminPagination from "@/components/shared/AdminPagination";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-(--screen-2xl) mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
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

      <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-xs">
        <UsersTable users={users} loading={loading} error={error} />

        <AdminPagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
          totalItems={totalUsers}
          currentCount={users.length}
          label="Users"
        />
      </div>
    </div>
  );
}
