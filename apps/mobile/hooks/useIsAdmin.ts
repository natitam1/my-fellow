import { useEffect } from "react";
import { authService } from "@/services/authService";
import { useUserStore } from "@/stores/user.store";

let lastRoleSyncAt = 0;

export const useIsAdmin = (): boolean => {
  const user = useUserStore((s) => s.user);
  const role = user?.role?.toLowerCase()?.replace(/-/g, "_");
  const isAdmin =
    Boolean(user) &&
    (role === "super_admin" ||
      role === "superadmin" ||
      role === "admin" ||
      role === "leader" ||
      role === "team_leader" ||
      role === "coordinator" ||
      Boolean((user as any)?.isAdmin) ||
      Boolean((user as any)?.isLeader));

  useEffect(() => {
    if (user && !isAdmin && Date.now() - lastRoleSyncAt > 15_000) {
      lastRoleSyncAt = Date.now();
      authService
        .getCurrentUser()
        .then((fresh) => {
          if (fresh && fresh.role !== user.role) {
            useUserStore.getState().setUser(fresh);
          }
        })
        .catch(() => {});
    }
  }, [user, isAdmin]);

  return isAdmin;
};

export const useCanManageMarketplace = useIsAdmin;
