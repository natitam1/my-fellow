export type Role =
  | "super_admin"
  | "leader"
  | "team_leader"
  | "coordinator"
  | "member";

export type Permission =
  | "members.view"
  | "members.edit"
  | "members.contact.view"
  | "teams.view"
  | "teams.manage"
  | "team.members.manage"
  | "team.coordinators.assign"
  | "events.view"
  | "events.manage"
  | "attendance.view"
  | "attendance.record"
  | "announcements.publish"
  | "sermons.media.manage"
  | "prayer_requests.submit"
  | "prayer_requests.manage"
  | "finance.give"
  | "finance.view"
  | "pastoral_notes.view"
  | "pastoral_notes.edit"
  | "minors_data.view"
  | "reports.view"
  | "reports.export"
  | "roles.assign"
  | "roles.assign_super_admin"
  | "settings.manage"
  | "audit_logs.view"
  | "audit_logs.export"
  | "devotions.manage";

export interface PermissionDefinition {
  key: Permission;
  name: string;
  description: string;
  sensitive?: boolean;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: PermissionDefinition[];
}

export interface RoleHierarchyCardData {
  role: Role;
  name: string;
  rank: number;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    ring: string;
  };
  summary: string;
  description: string;
  keyResponsibilities: string[];
  scope: string;
  inherentPermissionsCount: number;
}

export interface UserRoleRecord {
  _id: string;
  fullName: string;
  phoneNumber?: string;
  telegramUserName?: string;
  role: string;
  department?: string;
  yearOfStudy?: string;
  team?: string | { _id: string; name: string };
  profileImage?: string | null;
  createdAt?: string;
}

export interface RoleGrantRecord {
  _id: string;
  userId: string;
  permission: Permission;
  grantedBy: string;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}
