"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  Minus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
} from "lucide-react";
import { PERMISSION_GROUPS, ROLES, roleHasPermissionInherent } from "@/app/roles/rbac-data";
import { Role } from "@/app/roles/types";

export default function PermissionMatrix() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const filteredGroups = useMemo(() => {
    return PERMISSION_GROUPS.map((group) => {
      // Check category match
      if (selectedCategory !== "all" && group.id !== selectedCategory) {
        return null;
      }

      // Check search match
      const matchedPermissions = group.permissions.filter((perm) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          perm.name.toLowerCase().includes(q) ||
          perm.key.toLowerCase().includes(q) ||
          perm.description.toLowerCase().includes(q)
        );
      });

      if (matchedPermissions.length === 0) return null;

      return {
        ...group,
        permissions: matchedPermissions,
      };
    }).filter(Boolean) as typeof PERMISSION_GROUPS;
  }, [selectedCategory, searchQuery]);

  const totalFilteredPermissions = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.permissions.length, 0);
  }, [filteredGroups]);

  const roleLabels: Record<Role, { name: string; tag: string; color: string }> = {
    super_admin: { name: "Super Admin", tag: "Full Control", color: "bg-purple-100 text-purple-700" },
    leader: { name: "Leader", tag: "Fellowship Wide", color: "bg-indigo-100 text-indigo-700" },
    team_leader: { name: "Team Leader", tag: "Team Scope", color: "bg-teal-100 text-teal-700" },
    coordinator: { name: "Coordinator", tag: "Event Scope", color: "bg-amber-100 text-amber-800" },
    member: { name: "Member", tag: "Standard Access", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Permission Matrix Inspector
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {totalFilteredPermissions} Permissions Mapped
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auditable role permission mapping illustrating inherent least-privilege policies across all fellowship operations.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by permission name or key..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#ff6719] focus:ring-1 focus:ring-[#ff6719]"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-[#ff6719] text-white shadow-2xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          All Categories
        </button>
        {PERMISSION_GROUPS.map((group) => {
          const isSelected = selectedCategory === group.id;
          return (
            <button
              key={group.id}
              onClick={() => setSelectedCategory(group.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-[#ff6719] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {group.name}
            </button>
          );
        })}
      </div>

      {/* Interactive Matrix Table */}
      <div className="border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 w-[38%]">
                Permission Capability
              </th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  className="py-3 px-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-700 min-w-[110px]"
                >
                  <div className="flex flex-col items-center">
                    <span>{roleLabels[role].name}</span>
                    <span className="text-[9px] font-medium text-gray-400 capitalize mt-0.5">
                      {roleLabels[role].tag}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredGroups.map((group) => {
              const isCollapsed = !!collapsedGroups[group.id];

              return (
                <React.Fragment key={group.id}>
                  {/* Category Group Header */}
                  <tr className="bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <td
                      colSpan={6}
                      className="py-2.5 px-4 cursor-pointer select-none"
                      onClick={() => toggleGroupCollapse(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs">
                            {group.name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-normal">
                            ({group.permissions.length} capabilities) — {group.description}
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 p-0.5">
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Rows inside group */}
                  {!isCollapsed &&
                    group.permissions.map((perm) => (
                      <tr
                        key={perm.key}
                        className="hover:bg-amber-50/30 transition-colors group"
                      >
                        {/* Permission Description */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-xs">
                                {perm.name}
                              </span>
                              {perm.sensitive && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                                  <Lock className="w-2.5 h-2.5" /> Sensitive
                                </span>
                              )}
                            </div>
                            <code className="text-[11px] font-mono text-gray-500 block">
                              {perm.key}
                            </code>
                            <p className="text-[11px] text-gray-500 leading-tight">
                              {perm.description}
                            </p>
                          </div>
                        </td>

                        {/* Role columns */}
                        {ROLES.map((role) => {
                          const hasInherent = roleHasPermissionInherent(role, perm.key);

                          return (
                            <td
                              key={role}
                              className="py-3 px-3 text-center align-middle"
                            >
                              <div className="flex flex-col items-center justify-center">
                                {hasInherent ? (
                                  <div
                                    title={`Inherently enabled for ${role}`}
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 shadow-2xs"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                ) : (
                                  <div
                                    title={
                                      perm.sensitive
                                        ? "Restricted — requires explicit permission grant or super_admin"
                                        : "Not granted by default"
                                    }
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-300 group-hover:text-gray-400"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}

            {filteredGroups.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-gray-400 italic text-xs"
                >
                  No permissions matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend & Guidance */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-500">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-700">Matrix Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
            <span>Inherently Granted</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 inline-flex items-center justify-center">
              <Minus className="w-2.5 h-2.5" />
            </span>
            <span>Restricted (Requires Granular Override)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[9px]">
              Sensitive
            </span>
            <span>High-governance capability</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <Info className="w-3.5 h-3.5" />
          <span>Explicit grants override role limitations on a per-user basis.</span>
        </div>
      </div>
    </div>
  );
}
