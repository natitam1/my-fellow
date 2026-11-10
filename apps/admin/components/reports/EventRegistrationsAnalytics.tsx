"use client";

import React, { useState, useMemo } from "react";
import { EventReportItem } from "./types";
import { Calendar, Search, Users, AlertCircle, ArrowUpRight, BarChart3 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EventRegistrationsAnalyticsProps {
  eventsReport: EventReportItem[];
  loading: boolean;
}

export default function EventRegistrationsAnalytics({
  eventsReport,
  loading,
}: EventRegistrationsAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    return eventsReport.filter((item) => {
      const matchesSearch = item.event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const status = item.status || "upcoming";
      const matchesStatus =
        statusFilter === "all" ? true : status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [eventsReport, searchTerm, statusFilter]);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return "bg-rose-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getCapacityTextColor = (percent: number) => {
    if (percent >= 90) return "text-rose-600 bg-rose-50 border-rose-200";
    if (percent >= 75) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Concluded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Upcoming
          </span>
        );
    }
  };

  const totalRegisteredAll = useMemo(() => {
    return eventsReport.reduce((acc, curr) => acc + curr.registrationCount, 0);
  }, [eventsReport]);

  const totalCapacityAll = useMemo(() => {
    return eventsReport.reduce((acc, curr) => acc + (curr.capacity || 100), 0);
  }, [eventsReport]);

  const overallUtilization = totalCapacityAll > 0
    ? Math.round((totalRegisteredAll / totalCapacityAll) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Event Registrations Analytics
              </h2>
              <p className="text-xs text-gray-500">
                Attendance uptake, venue limit ratios, and cohort readiness
              </p>
            </div>
          </div>
        </div>

        {/* Global Event Utilization Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Global Cohort Utilization:</span>
            <span className="font-bold text-emerald-600">{overallUtilization}%</span>
            <span className="text-gray-400">({totalRegisteredAll} / {totalCapacityAll})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search event title..."
                className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20 focus:border-[#ff6719] transition-all w-36 sm:w-48"
              />
            </div>

            {/* Filter by status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter events by status"
              className="py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20 focus:border-[#ff6719] text-gray-700"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">In Progress</option>
              <option value="completed">Concluded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List / Breakdown */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium">
            Fetching event registration reports...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No events found</p>
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((item) => {
            const capacity = item.capacity || item.event.registrationLimit || 150;
            const percentage = item.capacityPercentage ?? Math.min(100, Math.round((item.registrationCount / capacity) * 100));
            const capacityColor = getCapacityColor(percentage);
            const badgeClasses = getCapacityTextColor(percentage);

            return (
              <div
                key={item.event.id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-amber-200/80 hover:shadow-xs transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {item.event.title}
                      </h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {formatDate(item.event.startDate)}
                        {item.event.endDate && item.event.endDate !== item.event.startDate
                          ? ` - ${formatDate(item.event.endDate)}`
                          : ""}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border shrink-0 ${badgeClasses}`}
                  >
                    {percentage}% Full
                  </span>
                </div>

                {/* Progress bar and details */}
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${capacityColor}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <strong className="text-gray-700">
                        {item.registrationCount}
                      </strong>{" "}
                      registered
                    </span>
                    <span>
                      Capacity: <strong className="text-gray-700">{capacity}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
