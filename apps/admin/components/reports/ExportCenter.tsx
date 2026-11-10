"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, CheckCircle2, ArrowRight, ShieldCheck, Database } from "lucide-react";
import { exportToCSV } from "./csvExport";
import { format } from "date-fns";

interface ExportCenterProps {
  eventRegistrationsData: any[];
  financialLedgerData: any[];
  memberRosterData: any[];
  loading?: boolean;
}

export default function ExportCenter({
  eventRegistrationsData,
  financialLedgerData,
  memberRosterData,
}: ExportCenterProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const handleExportRegistrations = () => {
    setDownloading("registrations");
    try {
      const headers = [
        "Registration ID",
        "Event Title",
        "Event Start Date",
        "Attendee Full Name",
        "Phone Number",
        "Registration Date",
        "Status",
      ];

      const rows = eventRegistrationsData.map((reg) => [
        reg._id || reg.id || "N/A",
        reg.event?.title || reg.eventTitle || "Special Fellowship Event",
        reg.event?.startDate || reg.eventStartDate || "N/A",
        reg.user?.fullName || reg.userName || "Fellowship Member",
        reg.user?.phoneNumber || reg.phoneNumber || "N/A",
        reg.createdAt || reg.registeredAt || "N/A",
        reg.status || "Confirmed",
      ]);

      exportToCSV(
        `fellowship-event-registrations-${todayStr}.csv`,
        headers,
        rows,
        `Exported ${rows.length} event registrations to CSV`
      );
    } finally {
      setTimeout(() => setDownloading(null), 500);
    }
  };

  const handleExportFinancialLedger = () => {
    setDownloading("finance");
    try {
      const headers = [
        "Transaction Reference",
        "Giver Full Name",
        "Phone Number",
        "Giving Purpose / Reason",
        "Amount (ETB)",
        "Payment Channel / Method",
        "Status",
        "Transaction Date",
      ];

      const rows = financialLedgerData.map((tx) => [
        tx.tx_ref || tx.reference || "N/A",
        tx.userId?.fullName || tx.user || "Fellowship Donor",
        tx.userId?.phoneNumber || tx.phoneNumber || "N/A",
        tx.reason || tx.category || "Tithe & Offering",
        tx.amount || 0,
        tx.method || tx.provider || "Telebirr",
        tx.status || "success",
        tx.createdAt || "N/A",
      ]);

      exportToCSV(
        `fellowship-financial-ledger-${todayStr}.csv`,
        headers,
        rows,
        `Exported ${rows.length} financial transactions to CSV`
      );
    } finally {
      setTimeout(() => setDownloading(null), 500);
    }
  };

  const handleExportMemberRoster = () => {
    setDownloading("roster");
    try {
      const headers = [
        "Member ID",
        "Full Name",
        "Phone Number",
        "Telegram Username",
        "Department / Faculty",
        "Academic Year",
        "Ministry Team",
        "Role",
        "Joined Date",
      ];

      const rows = memberRosterData.map((u) => [
        u._id || u.id || "N/A",
        u.fullName || "Member",
        u.phoneNumber || "N/A",
        u.telegramUserName || u.telegram || "N/A",
        u.department || "General Studies",
        u.yearOfStudy || "N/A",
        typeof u.team === "object" ? u.team?.name : u.team || "General Fellowship",
        u.role || "member",
        u.createdAt || "N/A",
      ]);

      exportToCSV(
        `fellowship-member-roster-${todayStr}.csv`,
        headers,
        rows,
        `Exported ${rows.length} member roster records to CSV`
      );
    } finally {
      setTimeout(() => setDownloading(null), 500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ff6719]/10 rounded-xl text-[#ff6719] border border-[#ff6719]/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Fellowship Export & Archival Center
            </h2>
            <p className="text-xs text-gray-500">
              Download live RFC-4180 UTF-8 formatted CSV spreadsheets for executive auditing, financial review, and ministry roll calls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit-Compliant • UTF-8 BOM Encoded</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export 1: Event Registrations */}
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-amber-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Event Attendance
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {eventRegistrationsData.length} Records
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Event Registrations (CSV)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Complete registry of student registrations, event dates, contact numbers, and confirmation statuses.
            </p>
          </div>

          <button
            onClick={handleExportRegistrations}
            disabled={downloading === "registrations"}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-amber-500 hover:text-amber-600 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs hover:bg-amber-50/30 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading === "registrations" ? "Generating CSV..." : "Export Registrations (CSV)"}
            </span>
          </button>
        </div>

        {/* Export 2: Financial Ledger */}
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Financial Audit
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {financialLedgerData.length} Records
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Financial Ledger (CSV)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Detailed audit trail of tithes, offerings, campaign donations, gateway references, and amounts in ETB.
            </p>
          </div>

          <button
            onClick={handleExportFinancialLedger}
            disabled={downloading === "finance"}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs hover:bg-emerald-50/30 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading === "finance" ? "Generating CSV..." : "Export Financial Ledger (CSV)"}
            </span>
          </button>
        </div>

        {/* Export 3: Member Roster */}
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Member Directory
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {memberRosterData.length} Records
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Fellowship Member Roster (CSV)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Consolidated roster with academic departments, year cohorts, ministry teams, and contact numbers.
            </p>
          </div>

          <button
            onClick={handleExportMemberRoster}
            disabled={downloading === "roster"}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs hover:bg-blue-50/30 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading === "roster" ? "Generating CSV..." : "Export Member Roster (CSV)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
