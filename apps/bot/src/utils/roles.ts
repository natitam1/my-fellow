export const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "leader",
  "coordinator",
] as const;

export function isAdminRole(role?: string | null): boolean {
  return (
    typeof role === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(role)
  );
}
