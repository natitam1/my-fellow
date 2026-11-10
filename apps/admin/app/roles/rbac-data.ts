import {
  Permission,
  PermissionGroup,
  Role,
  RoleHierarchyCardData,
} from "./types";

export const ROLES: Role[] = [
  "super_admin",
  "leader",
  "team_leader",
  "coordinator",
  "member",
];

export const ROLE_HIERARCHY: RoleHierarchyCardData[] = [
  {
    role: "super_admin",
    name: "Super Administrator",
    rank: 5,
    badgeColor: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      iconBg: "bg-purple-100 text-purple-600",
      ring: "focus:ring-purple-500",
    },
    summary:
      "Full system control across all modules, payments, members, and configurations.",
    description:
      "Unrestricted administrative authority across all fellowship campuses, financial gateways, member records, and security controls.",
    scope: "Entire Fellowship Ecosystem",
    keyResponsibilities: [
      "Manage all system roles & security grants",
      "Full access to financial transactions & payout logs",
      "Manage sensitive pastoral records & minors data",
      "System configurations, audit logs & system health",
    ],
    inherentPermissionsCount: 28,
  },
  {
    role: "leader",
    name: "Ministry Leader",
    rank: 4,
    badgeColor: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      iconBg: "bg-indigo-100 text-indigo-600",
      ring: "focus:ring-indigo-500",
    },
    summary:
      "Fellowship ministry leader — access to members, teams, events, media, announcements, attendance.",
    description:
      "Core leadership oversee cross-functional fellowship activities, discipleship cohorts, ministries, events, and sermon broadcasts.",
    scope: "Fellowship-wide Ministries & Events",
    keyResponsibilities: [
      "Oversee members, teams, and event operations",
      "Publish announcements and sermon media",
      "Assign roles up to team leader / coordinator",
      "Review high-level ministry reports and prayer requests",
    ],
    inherentPermissionsCount: 18,
  },
  {
    role: "team_leader",
    name: "Team / Department Head",
    rank: 3,
    badgeColor: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      iconBg: "bg-teal-100 text-teal-600",
      ring: "focus:ring-teal-500",
    },
    summary:
      "Department / Team head — manages specific team members, attendance, events.",
    description:
      "Dedicated leaders guiding specific ministry units (e.g. Worship, Media, Ushering, Prayer) and departmental cohorts.",
    scope: "Assigned Ministry Team",
    keyResponsibilities: [
      "Manage members belonging to assigned team",
      "Record and review meeting attendance",
      "Coordinate department events and activities",
      "Assign team coordinators within ministry scope",
    ],
    inherentPermissionsCount: 16,
  },
  {
    role: "coordinator",
    name: "Event / Program Coordinator",
    rank: 2,
    badgeColor: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      iconBg: "bg-amber-100 text-amber-700",
      ring: "focus:ring-amber-500",
    },
    summary:
      "Event & program organizer — coordinates schedules and registrations.",
    description:
      "Operational organizers ensuring fellowship services, conferences, and outreach registrations execute smoothly.",
    scope: "Event Schedules & Check-ins",
    keyResponsibilities: [
      "View member directory and team rosters",
      "Manage event schedules and track check-ins",
      "Record physical and QR-code attendance",
      "Broadcast operational event announcements",
    ],
    inherentPermissionsCount: 8,
  },
  {
    role: "member",
    name: "Fellowship Member",
    rank: 1,
    badgeColor: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      iconBg: "bg-gray-200 text-gray-700",
      ring: "focus:ring-gray-400",
    },
    summary:
      "Standard fellowship member — mobile app access, profile, giving, devotions.",
    description:
      "Everyday member interacting with fellowship life through mobile apps, daily devotions, prayer submissions, and online giving.",
    scope: "Personal Account & Public Content",
    keyResponsibilities: [
      "Access mobile app, daily devotions, and directory",
      "Register for fellowship conferences and retreats",
      "Give tithes and offerings via digital channels",
      "Submit prayer requests and join ministry teams",
    ],
    inherentPermissionsCount: 5,
  },
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "members",
    name: "Member & Discipleship",
    description: "Access controls for member profiles, rosters, and sensitive contact information.",
    permissions: [
      {
        key: "members.view",
        name: "View Member Directory",
        description: "Browse fellowship members, academic year, and department profiles.",
      },
      {
        key: "members.edit",
        name: "Edit Member Profiles",
        description: "Update member information, team assignments, and fellowship status.",
      },
      {
        key: "members.contact.view",
        name: "View Member Contact Info",
        description: "Access protected personal contact numbers and Telegram identities.",
        sensitive: true,
      },
    ],
  },
  {
    id: "teams",
    name: "Teams & Ministries",
    description: "Management of ministry teams, leadership rosters, and department head assignments.",
    permissions: [
      {
        key: "teams.view",
        name: "View Teams & Ministries",
        description: "View fellowship teams, mission statements, and member headcounts.",
      },
      {
        key: "teams.manage",
        name: "Create & Manage Teams",
        description: "Create new ministry teams, modify team goals, and disband teams.",
      },
      {
        key: "team.members.manage",
        name: "Manage Team Members",
        description: "Add, reassign, or remove members from specific fellowship teams.",
      },
      {
        key: "team.coordinators.assign",
        name: "Assign Team Coordinators",
        description: "Designate and authorize coordinators and leaders for ministry teams.",
      },
    ],
  },
  {
    id: "events",
    name: "Events & Attendance",
    description: "Scheduling of programs, services, conferences, and check-in tracking.",
    permissions: [
      {
        key: "events.view",
        name: "View Events & Programs",
        description: "Access fellowship calendar, retreat schedules, and public programs.",
      },
      {
        key: "events.manage",
        name: "Create & Manage Events",
        description: "Publish events, manage registration quotas, and set venues.",
      },
      {
        key: "attendance.view",
        name: "View Attendance Records",
        description: "Review attendance statistics, headcounts, and check-in rosters.",
      },
      {
        key: "attendance.record",
        name: "Record Attendance",
        description: "Take live attendance, scan QR badges, and check in participants.",
      },
    ],
  },
  {
    id: "content",
    name: "Content & Sermons",
    description: "Publishing devotional content, spiritual audio/video media, and announcements.",
    permissions: [
      {
        key: "announcements.publish",
        name: "Publish Announcements",
        description: "Send push notifications and official fellowship announcements.",
      },
      {
        key: "sermons.media.manage",
        name: "Manage Sermon Media",
        description: "Upload and catalog sermon audio recordings, videos, and study guides.",
      },
      {
        key: "devotions.manage",
        name: "Manage Daily Devotions",
        description: "Draft, edit, and schedule daily fellowship devotional guides.",
      },
    ],
  },
  {
    id: "finance",
    name: "Finance & Givings",
    description: "Tithe and offering contributions, payment gateway logs, and financial auditing.",
    permissions: [
      {
        key: "finance.give",
        name: "Digital Giving",
        description: "Initiate tithe and offering payments via Telebirr, CBE, or Chapa/Jami.",
      },
      {
        key: "finance.view",
        name: "View Financial Records",
        description: "Access transaction logs, financial summaries, and payment audit records.",
        sensitive: true,
      },
    ],
  },
  {
    id: "admin",
    name: "Administration & RBAC",
    description: "Core security governance, system role assignments, settings, and audit trails.",
    permissions: [
      {
        key: "roles.assign",
        name: "Assign Standard Roles",
        description: "Assign user roles up to leader, team leader, and coordinator levels.",
      },
      {
        key: "roles.assign_super_admin",
        name: "Promote Super Admin",
        description: "Grant full system super-admin privileges (Restricted to Super Admin).",
        sensitive: true,
      },
      {
        key: "settings.manage",
        name: "System Settings & Grants",
        description: "Configure system integrations, SMS gateway keys, and RBAC granular grants.",
        sensitive: true,
      },
      {
        key: "audit_logs.view",
        name: "View RBAC Audit Logs",
        description: "Inspect immutable security logs tracking permission and role modifications.",
        sensitive: true,
      },
    ],
  },
  {
    id: "pastoral",
    name: "Pastoral & Discipleship Care",
    description: "Confidential pastoral counselling records, prayer lists, and minors safety.",
    permissions: [
      {
        key: "prayer_requests.submit",
        name: "Submit Prayer Request",
        description: "Submit personal prayer petitions to fellowship leaders.",
      },
      {
        key: "prayer_requests.manage",
        name: "Manage Prayer Requests",
        description: "Review, assign, and pray over community prayer petitions.",
      },
      {
        key: "pastoral_notes.view",
        name: "View Pastoral Notes",
        description: "Access confidential pastoral counseling summaries.",
        sensitive: true,
      },
      {
        key: "pastoral_notes.edit",
        name: "Edit Pastoral Notes",
        description: "Record confidential counseling notes and spiritual guidance.",
        sensitive: true,
      },
      {
        key: "minors_data.view",
        name: "View Protected Minors Data",
        description: "Access protected records of youth under fellowship care.",
        sensitive: true,
      },
    ],
  },
  {
    id: "reports",
    name: "Analytics & System Audit",
    description: "Fellowship growth statistics, exportable rosters, and security audit exports.",
    permissions: [
      {
        key: "reports.view",
        name: "View Analytics & Reports",
        description: "Inspect dashboard metrics, member trends, and giving graphs.",
      },
      {
        key: "reports.export",
        name: "Export Analytical Reports",
        description: "Export member and financial analytics as CSV and spreadsheets.",
        sensitive: true,
      },
      {
        key: "audit_logs.export",
        name: "Export Audit Trails",
        description: "Export cryptographically signed security audit logs for compliance.",
        sensitive: true,
      },
    ],
  },
];

const LEADER_PERMISSIONS = new Set<Permission>([
  "members.view",
  "members.edit",
  "teams.view",
  "teams.manage",
  "team.members.manage",
  "team.coordinators.assign",
  "events.view",
  "events.manage",
  "attendance.view",
  "attendance.record",
  "announcements.publish",
  "sermons.media.manage",
  "devotions.manage",
  "prayer_requests.submit",
  "prayer_requests.manage",
  "finance.give",
  "reports.view",
  "roles.assign",
]);

const TEAM_LEADER_PERMISSIONS = new Set<Permission>([
  "members.view",
  "members.edit",
  "teams.view",
  "teams.manage",
  "team.members.manage",
  "team.coordinators.assign",
  "events.view",
  "events.manage",
  "attendance.view",
  "attendance.record",
  "announcements.publish",
  "prayer_requests.submit",
  "prayer_requests.manage",
  "finance.give",
  "reports.view",
  "roles.assign",
]);

const COORDINATOR_PERMISSIONS = new Set<Permission>([
  "members.view",
  "teams.view",
  "events.view",
  "attendance.view",
  "attendance.record",
  "announcements.publish",
  "prayer_requests.submit",
  "finance.give",
]);

const MEMBER_PERMISSIONS = new Set<Permission>([
  "members.view",
  "teams.view",
  "events.view",
  "prayer_requests.submit",
  "finance.give",
]);

export function roleHasPermissionInherent(
  role: Role | string,
  permission: Permission,
): boolean {
  const normRole = normalizeRole(role);
  if (normRole === "super_admin") return true;
  if (normRole === "leader") return LEADER_PERMISSIONS.has(permission);
  if (normRole === "team_leader") return TEAM_LEADER_PERMISSIONS.has(permission);
  if (normRole === "coordinator") return COORDINATOR_PERMISSIONS.has(permission);
  return MEMBER_PERMISSIONS.has(permission);
}

export function normalizeRole(role?: string | null): Role {
  switch (role) {
    case "admin":
    case "super_admin":
      return "super_admin";
    case "leader":
      return "leader";
    case "team_leader":
      return "team_leader";
    case "coordinator":
      return "coordinator";
    default:
      return "member";
  }
}

export function getRoleBadge(role?: string | null) {
  const r = normalizeRole(role);
  switch (r) {
    case "super_admin":
      return {
        label: "Super Admin",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case "leader":
      return {
        label: "Leader",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    case "team_leader":
      return {
        label: "Team Leader",
        className: "bg-teal-50 text-teal-700 border-teal-200",
      };
    case "coordinator":
      return {
        label: "Coordinator",
        className: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "member":
    default:
      return {
        label: "Member",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
}
