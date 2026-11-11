"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  PERMISSION_GROUPS,
  getRoleBadge,
  roleHasPermissionInherent,
  normalizeRole,
} from "@/app/roles/rbac-data";
import { Permission, RoleGrantRecord, UserRoleRecord } from "@/app/roles/types";

interface UserGrantsModalProps {
  user: UserRoleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onGrantsUpdated?: () => void;
}

export default function UserGrantsModal({
  user,
  isOpen,
  onClose,
  onGrantsUpdated,
}: UserGrantsModalProps) {
  const [activeGrants, setActiveGrants] = useState<Set<Permission>>(new Set());
  const [loadingGrants, setLoadingGrants] = useState<boolean>(false);
  const [togglingPermission, setTogglingPermission] = useState<Permission | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchGrants = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoadingGrants(true);
      const res = await api.get(`/rbac/users/${user._id}/grants`);
      const grantsData: RoleGrantRecord[] = res.data?.data || [];
      const permSet = new Set<Permission>(grantsData.map((g) => g.permission));
      setActiveGrants(permSet);
    } catch (err: any) {
      console.warn("Could not fetch user grants from backend:", err);
      // If endpoint returns empty or is not supported, start with empty grants
      setActiveGrants(new Set());
    } finally {
      setLoadingGrants(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchGrants();
      setSearch("");
      setSelectedCategory("all");
    }
  }, [isOpen, user?._id, fetchGrants]);

  const handleToggleGrant = async (permission: Permission) => {
    if (!user?._id) return;
    const isGranted = activeGrants.has(permission);

    try {
      setTogglingPermission(permission);
      if (isGranted) {
        // Revoke grant
        await api.delete(`/rbac/users/${user._id}/grants/${permission}`);
        setActiveGrants((prev) => {
          const next = new Set(prev);
          next.delete(permission);
          return next;
        });
        toast.success(`Revoked "${permission}" grant for ${user.fullName}`);
      } else {
        // Grant permission
        await api.post(`/rbac/users/${user._id}/grants`, {
          permission,
        });
        setActiveGrants((prev) => {
          const next = new Set(prev);
          next.add(permission);
          return next;
        });
        toast.success(`Granted "${permission}" to ${user.fullName}`);
      }
      onGrantsUpdated?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update grant";
      toast.error(msg);
    } finally {
      setTogglingPermission(null);
    }
  };

  const filteredGroups = useMemo(() => {
    return PERMISSION_GROUPS.map((group) => {
      if (selectedCategory !== "all" && group.id !== selectedCategory) {
        return null;
      }
      const matched = group.permissions.filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      });
      if (matched.length === 0) return null;
      return { ...group, permissions: matched };
    }).filter(Boolean) as typeof PERMISSION_GROUPS;
  }, [selectedCategory, search]);

  if (!isOpen || !user) return null;

  const role = normalizeRole(user.role);
  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-gray-900">
                Granular Permissions & Overrides
              </h3>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.className}`}
              >
                {roleBadge.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              User: <strong className="text-gray-900">{user.fullName}</strong>{" "}
              {user.phoneNumber && `(${user.phoneNumber})`} • ID:{" "}
              <code className="text-gray-600 font-mono text-[11px]">
                {user._id.substring(0, 10)}...
              </code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Notice Banner */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Explicit grants add granular capabilities without changing the member&apos;s base role.
              All overrides are securely audited.
            </span>
          </div>
          {loadingGrants && (
            <div className="flex items-center gap-1.5 text-amber-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing grants...</span>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3 bg-white">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permission by name or key..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#ff6719] focus:ring-1 focus:ring-[#ff6719]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:border-[#ff6719] w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {PERMISSION_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    {group.name}
                  </h4>
                  <p className="text-[11px] text-gray-500">{group.description}</p>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">
                  {group.permissions.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {group.permissions.map((perm) => {
                  const isInherited = roleHasPermissionInherent(role, perm.key);
                  const isExplicitGrant = activeGrants.has(perm.key);
                  const isPending = togglingPermission === perm.key;

                  return (
                    <div
                      key={perm.key}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                        isInherited
                          ? "bg-gray-50/70 border-gray-200 text-gray-700"
                          : isExplicitGrant
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-gray-200/80 hover:border-gray-300"
                      }`}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-900">
                            {perm.name}
                          </span>
                          {perm.sensitive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Sensitive
                            </span>
                          )}
                          {isInherited && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-gray-600" />
                              Inherited from {role}
                            </span>
                          )}
                          {!isInherited && isExplicitGrant && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Explicit Override Active
                            </span>
                          )}
                        </div>
                        <code className="text-[11px] font-mono text-gray-500 block truncate">
                          {perm.key}
                        </code>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {perm.description}
                        </p>
                      </div>

                      {/* Action Control */}
                      <div className="shrink-0 flex items-center">
                        {isInherited ? (
                          <div
                            title="This capability is already active by default through the user's role."
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-[11px] font-medium flex items-center gap-1 cursor-default"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleGrant(perm.key)}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                              isExplicitGrant
                                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            } disabled:opacity-50`}
                          >
                            {isPending ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : isExplicitGrant ? (
                              <>
                                <X className="w-3.5 h-3.5" />
                                <span>Revoke Override</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Grant Override</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs italic">
              No permissions found matching query.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            Active Grants: <strong className="text-gray-900">{activeGrants.size}</strong>{" "}
            override(s) applied
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
