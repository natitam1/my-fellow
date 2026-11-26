export function normalizeEthiopianPhone(input: string): string {
  const compact = input.trim().replace(/[\s()-]/g, "");

  if (/^\+251[79]\d{8}$/.test(compact)) return compact;
  if (/^251[79]\d{8}$/.test(compact)) return `+${compact}`;
  if (/^0[79]\d{8}$/.test(compact)) return `+251${compact.slice(1)}`;
  if (/^[79]\d{8}$/.test(compact)) return `+251${compact}`;

  if (compact.startsWith("+")) return compact;
  return compact;
}

export function toLocalPhone(input: string): string {
  let n = input.replace(/\D/g, "");
  if (n.startsWith("251") && n.length >= 12) {
    n = "0" + n.substring(3);
  } else if (n.length === 9 && (n.startsWith("9") || n.startsWith("7"))) {
    n = "0" + n;
  }
  return n;
}

export function toSmsPhone(input: string): string {
  return normalizeEthiopianPhone(input).replace(/[^\d]/g, "");
}

export const USER_ROLES = [
  "member",
  "team_leader",
  "leader",
  "coordinator",
  "admin",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const FELLOWSHIP_TEAMS = [
  "Prayer",
  "Worship",
  "Evangelism",
  "Bible Study",
  "Charity",
  "Media",
  "Literature",
  "Discipleship",
  "Finance",
  "Logistics",
] as const;

export type FellowshipTeam = (typeof FELLOWSHIP_TEAMS)[number];

export const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduated",
  "Postgraduate",
] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];
