"use client";

import React from "react";
import {
  ShieldAlert,
  Crown,
  Users2,
  CalendarCheck,
  User,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { ROLE_HIERARCHY } from "@/app/roles/rbac-data";
import { Role } from "@/app/roles/types";

interface RoleHierarchyCardsProps {
  userCounts?: Record<Role, number>;
  selectedRoleFilter?: string;
  onSelectRoleFilter?: (role: string) => void;
}

const roleIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  leader: ShieldAlert,
  team_leader: Users2,
  coordinator: CalendarCheck,
  member: User,
};

export default function RoleHierarchyCards({
  userCounts = {
    super_admin: 0,
    leader: 0,
    team_leader: 0,
    coordinator: 0,
    member: 0,
  },
  selectedRoleFilter = "all",
  onSelectRoleFilter,
}: RoleHierarchyCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#ff6719]" />
            Role Hierarchy & Access Levels
          </h2>
          <p className="text-xs text-gray-500">
            Tiered privilege hierarchy governing fellowship data access, actions, and administrative oversight.
          </p>
        </div>
        {selectedRoleFilter !== "all" && (
          <button
            onClick={() => onSelectRoleFilter?.("all")}
            className="text-xs text-[#ff6719] hover:underline font-semibold self-start sm:self-auto"
          >
            Show All Roles Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {ROLE_HIERARCHY.map((item) => {
          const Icon = roleIcons[item.role];
          const isSelected = selectedRoleFilter === item.role;
          const count = userCounts[item.role] || 0;

          return (
            <div
              key={item.role}
              onClick={() => onSelectRoleFilter?.(isSelected ? "all" : item.role)}
              className={`group relative rounded-xl border p-4.5 bg-white transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                isSelected
                  ? "border-[#ff6719] ring-2 ring-[#ff6719]/20 shadow-xs"
                  : "border-gray-200/80 hover:border-gray-300 shadow-2xs"
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`p-2.5 rounded-xl border ${item.badgeColor.bg} ${item.badgeColor.border} ${item.badgeColor.text}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      Tier {item.rank}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {count} {count === 1 ? "User" : "Users"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors">
                    {item.name}
                  </h3>
                  <code className="text-[11px] font-mono text-gray-400 block mt-0.5">
                    {item.role}
                  </code>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {item.summary}
                </p>

                {/* Key Responsibilities */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Key Authority
                  </div>
                  <ul className="space-y-1">
                    {item.keyResponsibilities.slice(0, 3).map((resp, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-gray-600 flex items-start gap-1.5 leading-tight"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>{item.inherentPermissionsCount} Permissions</span>
                </div>
                <span
                  className={`text-[11px] font-bold inline-flex items-center gap-0.5 ${
                    isSelected ? "text-[#ff6719]" : "text-gray-400 group-hover:text-gray-700"
                  }`}
                >
                  {isSelected ? "Filtered" : "Filter"}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
