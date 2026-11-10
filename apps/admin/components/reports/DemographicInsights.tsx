"use client";

import React from "react";
import { DepartmentStat, AcademicYearStat } from "./types";
import { Building2, GraduationCap, Users } from "lucide-react";

interface DemographicInsightsProps {
  departments: DepartmentStat[];
  academicYears: AcademicYearStat[];
  totalMembers: number;
  loading: boolean;
}

export default function DemographicInsights({
  departments,
  academicYears,
  totalMembers,
  loading,
}: DemographicInsightsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Distribution */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Department Distribution
              </h3>
              <p className="text-xs text-gray-500">
                AAU Natural & Computational Sciences, Engineering & Humanities
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
            {departments.length} Faculties
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-7 h-7 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Loading department demographics...</p>
          </div>
        ) : (
          <div className="space-y-3.5 mt-4 max-h-[380px] overflow-y-auto pr-1">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800 line-clamp-1">
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-500">{dept.count} members</span>
                    <span className="font-bold text-gray-900 w-11 text-right">
                      {dept.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${dept.percentage}%`,
                      backgroundColor: dept.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Academic Year Distribution */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Academic Year Distribution
              </h3>
              <p className="text-xs text-gray-500">
                Freshman intake through graduating finalists & alumni mentors
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {totalMembers.toLocaleString()} Total
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-7 h-7 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Loading student cohorts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {academicYears.map((cohort) => (
              <div
                key={cohort.year}
                className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-emerald-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {cohort.year}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Fellowship cohort
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {cohort.count}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cohort.percentage}%`,
                        backgroundColor: cohort.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>Proportion</span>
                    <span className="font-bold text-emerald-700">
                      {cohort.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
