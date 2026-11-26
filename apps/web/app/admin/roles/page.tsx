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
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-[#ff6719]">RBAC & Security</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#ff6719]" />
            Roles & Access Control (RBAC)
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Centralized role-based access management, capability matrix inspector, and granular permissions oversight across the 4 Kilo Fellowship platform.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted rounded-xl border border-border self-start lg:self-auto text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unified View
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "hierarchy"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Role Hierarchy
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "matrix"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "users"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            User Assignments
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Super Admins
            </div>
            <div className="text-xl font-bold text-foreground">
              {loadingStats ? "—" : roleCounts.super_admin}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Ministry Leaders
            </div>
            <div className="text-xl font-bold text-foreground">
              {loadingStats ? "—" : roleCounts.leader}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Team Leaders
            </div>
            <div className="text-xl font-bold text-foreground">
              {loadingStats ? "—" : roleCounts.team_leader}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Coordinators
            </div>
            <div className="text-xl font-bold text-foreground">
              {loadingStats ? "—" : roleCounts.coordinator}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Members Pool
            </div>
            <div className="text-xl font-bold text-foreground">
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
