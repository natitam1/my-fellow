import { useUserStore } from "@/stores/user.store";

export const useIsAdmin = (): boolean => {
  const user = useUserStore((s) => s.user);
  if (!user) return false;
  const role = user.role?.toLowerCase()?.replace(/-/g, "_");
  return (
    role === "super_admin" ||
    role === "superadmin" ||
    role === "admin" ||
    role === "leader" ||
    role === "team_leader" ||
    role === "coordinator" ||
    Boolean((user as any)?.isAdmin) ||
    Boolean((user as any)?.isLeader)
  );
};

export const useCanManageMarketplace = useIsAdmin;
