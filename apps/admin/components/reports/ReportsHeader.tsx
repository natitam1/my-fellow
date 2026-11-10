"use client";

import React from "react";
import { RefreshCw, Calendar, Sparkles } from "lucide-react";
import { DateRangeOption } from "./types";
import { cn } from "@/lib/utils";

interface ReportsHeaderProps {
  dateRange: DateRangeOption;
  setDateRange: (range: DateRangeOption) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export default function ReportsHeader({
  dateRange,
  setDateRange,
  onRefresh,
  isLoading,
  lastUpdated,
}: ReportsHeaderProps) {
  const dateRangeLabels: Record<DateRangeOption, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days (Quarter)",
    year: "This Academic Year",
    all: "All Time",
  };

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Just now";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Executive Intelligence
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isLoading ? "bg-amber-400 animate-ping" : "bg-emerald-500"
            )} />
            {isLoading ? "Synchronizing..." : `Live • Updated ${formattedTime}`}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Reports & Analytics Studio
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Comprehensive fellowship governance, financial transparency, member demographics, and event analytics
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative inline-flex items-center">
          <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
            aria-label="Filter by Date Range"
            className="pl-9 pr-8 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-xl shadow-xs hover:border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20 focus:border-[#ff6719] transition-all cursor-pointer appearance-none"
          >
            {Object.entries(dateRangeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh report metrics"
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all cursor-pointer shadow-xs",
            isLoading
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95"
          )}
        >
          <RefreshCw
            className={cn("w-4 h-4 text-gray-500", isLoading && "animate-spin text-[#ff6719]")}
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
