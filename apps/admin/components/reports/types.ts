export type DateRangeOption = "7d" | "30d" | "90d" | "year" | "all";

export interface EventReportItem {
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    registrationLimit?: number | null;
  };
  registrationCount: number;
  capacity?: number;
  capacityPercentage?: number;
  status?: "upcoming" | "ongoing" | "completed";
}

export interface GivingTypeBreakdown {
  type: string;
  category: "Tithes" | "Offerings" | "Camp/Retreat" | "Building Project" | "Welfare";
  amount: number;
  count: number;
  percentage: number;
  color: string;
  accentBg: string;
}

export interface PaymentChannelBreakdown {
  channel: "Telebirr" | "CBE Birr" | "Chapa / Jami";
  amount: number;
  count: number;
  percentage: number;
  color: string;
  badgeBg: string;
  textColor: string;
}

export interface DepartmentStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AcademicYearStat {
  year: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ReportsOverviewStats {
  totalMembers: number;
  activeRegistrations: number;
  totalGivings: number;
  avgGiving: number;
  totalTransactions: number;
}
