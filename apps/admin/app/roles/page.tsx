"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Shield,
  Users,
  Layers,
  Lock,
  Crown,
  KeyRound,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import RoleHierarchyCards from "@/components/roles/RoleHierarchyCards";
import PermissionMatrix from "@/components/roles/PermissionMatrix";
import UserRoleAssignment from "@/components/roles/UserRoleAssignment";
import api from "@/lib/api";
import { normalizeRole } from "./rbac-data";
import { Role } from "./types";

export default function RolesManagementPage() {
  const [activeTab, setActiveTab] = useState<"all" | "hierarchy" | "matrix" | "users">("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [roleCounts, setRoleCounts] = useState<Record<Role, number>>({
    super_admin: 0,
    leader: 0,
    team_leader: 0,
    coordinator: 0,
    member: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Fetch quick stats from admin users to compute role counts
  const fetchRoleStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.get("/admin/users?limit=250");
      const usersData: any[] = res.data?.data || (Array.isArray(res.data) ? res.data : []);

      const counts: Record<Role, number> = {
        super_admin: 0,
        leader: 0,
        team_leader: 0,
        coordinator: 0,
        member: 0,
      };

      usersData.forEach((u) => {
        const r = normalizeRole(u.role);
        counts[r] = (counts[r] || 0) + 1;
      });

      setRoleCounts(counts);
    } catch (err) {
      console.warn("Failed to compute role statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchRoleStats();
  }, [fetchRoleStats]);

  const handleRoleSelectFromCard = (role: string) => {
    setSelectedRoleFilter(role);
    // If user was on hierarchy tab, switch to users or all to see the filtered list
    if (activeTab === "hierarchy") {
      setActiveTab("users");
    }
    // Scroll smoothly to user console
    const userConsoleElem = document.getElementById("user-assignment-console");
    if (userConsoleElem) {
      userConsoleElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalUsersCount = Object.values(roleCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-(--screen-2xl) mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-[#ff6719]">RBAC & Security</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#ff6719]" />
            Roles & Access Control (RBAC)
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Centralized role-based access management, capability matrix inspector, and granular permissions oversight across the 4 Kilo Fellowship platform.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start lg:self-auto text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Unified View
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "hierarchy"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Role Hierarchy
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "matrix"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "users"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            User Assignments
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Super Admins
            </div>
            <div className="text-xl font-bold text-gray-900">
              {loadingStats ? "—" : roleCounts.super_admin}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Ministry Leaders
            </div>
            <div className="text-xl font-bold text-gray-900">
              {loadingStats ? "—" : roleCounts.leader}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Team Leaders
            </div>
            <div className="text-xl font-bold text-gray-900">
              {loadingStats ? "—" : roleCounts.team_leader}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Coordinators
            </div>
            <div className="text-xl font-bold text-gray-900">
              {loadingStats ? "—" : roleCounts.coordinator}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Members Pool
            </div>
            <div className="text-xl font-bold text-gray-900">
              {loadingStats ? "—" : totalUsersCount}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Overview & Role Hierarchy Cards */}
      {(activeTab === "all" || activeTab === "hierarchy") && (
        <section id="role-hierarchy-section">
          <RoleHierarchyCards
            userCounts={roleCounts}
            selectedRoleFilter={selectedRoleFilter}
            onSelectRoleFilter={handleRoleSelectFromCard}
          />
        </section>
      )}

      {/* SECTION 2: Permission Matrix Inspector */}
      {(activeTab === "all" || activeTab === "matrix") && (
        <section id="permission-matrix-section">
          <PermissionMatrix />
        </section>
      )}

      {/* SECTION 3: User Role Assignment Console */}
      {(activeTab === "all" || activeTab === "users") && (
        <section id="user-assignment-console">
          <UserRoleAssignment
            initialRoleFilter={selectedRoleFilter}
            onRoleCountsUpdated={fetchRoleStats}
          />
        </section>
      )}
    </div>
  );
}
