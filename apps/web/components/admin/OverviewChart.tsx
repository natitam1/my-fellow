"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_STATS } from "@/lib/mock-data";

export interface TransactionItem {
  _id?: string;
  amount: number;
  createdAt: string;
  [key: string]: unknown;
}

interface OverviewChartProps {
  transactions?: TransactionItem[];
}

type TimeRange = "7d" | "30d" | "90d" | "ytd";

interface ChartPoint {
  label: string;
  attendance: number;
  givings: number;
}

export function OverviewChart({ transactions = [] }: OverviewChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Generate or aggregate data points based on time range
  const chartData = useMemo<ChartPoint[]>(() => {
    const hasLiveTransactions = transactions.length > 0;

    if (timeRange === "7d") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const points: ChartPoint[] = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayLabel = days[d.getDay()];
        const dateStr = d.toISOString().split("T")[0];

        let givingsSum = 0;
        if (hasLiveTransactions) {
          givingsSum = transactions
            .filter((t) => t.createdAt && t.createdAt.startsWith(dateStr))
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        }

        // Realistic fallback variation
        const dayBaseAttendance = d.getDay() === 5 ? 1240 : d.getDay() === 1 ? 420 : 680;
        const fallbackGivings = d.getDay() === 5 ? 18500 : 4200;

        points.push({
          label: `${dayLabel} ${d.getDate()}`,
          attendance: dayBaseAttendance,
          givings: givingsSum > 0 ? givingsSum : fallbackGivings,
        });
      }
      return points;
    }

    if (timeRange === "30d") {
      const points: ChartPoint[] = [];
      const weeks = [
        { label: "Week 1", attendance: 980, givings: 18400 },
        { label: "Week 2", attendance: 1040, givings: 21500 },
        { label: "Week 3", attendance: 1190, givings: 22800 },
        { label: "Week 4 (Revival)", attendance: 1240, givings: 21550 },
      ];

      return weeks.map((w, idx) => {
        let givings = w.givings;
        if (hasLiveTransactions) {
          const chunk = transactions.slice(idx * 5, (idx + 1) * 5);
          const chunkSum = chunk.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          if (chunkSum > 0) givings = chunkSum;
        }
        return {
          label: w.label,
          attendance: w.attendance,
          givings,
        };
      });
    }

    if (timeRange === "90d") {
      const points: ChartPoint[] = [
        { label: "Sep - Mid", attendance: 910, givings: 32000 },
        { label: "Sep - End", attendance: 1100, givings: 44000 },
        { label: "Oct - Mid", attendance: 1150, givings: 38500 },
        { label: "Oct - End", attendance: 1210, givings: 42500 },
        { label: "Nov - Mid", attendance: 1240, givings: 48200 },
        { label: "Nov - Current", attendance: 1280, givings: 36050 },
      ];
      return points;
    }

    // YTD
    if (MOCK_STATS.attendanceTrends && MOCK_STATS.attendanceTrends.length > 0) {
      return MOCK_STATS.attendanceTrends.map((item) => ({
        label: item.month,
        attendance: item.attendance,
        givings: item.givings,
      }));
    }

    return [
      { label: "Jun", attendance: 820, givings: 54000 },
      { label: "Jul", attendance: 750, givings: 49000 },
      { label: "Aug", attendance: 600, givings: 42000 },
      { label: "Sep", attendance: 1100, givings: 76000 },
      { label: "Oct", attendance: 1210, givings: 81000 },
      { label: "Nov", attendance: 1240, givings: 84250 },
    ];
  }, [timeRange, transactions]);

  // Quick aggregate totals for the selected window
  const totalPeriodGivings = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.givings, 0),
    [chartData],
  );
  const avgAttendance = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.attendance, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Fellowship Attendance & Givings
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Student participation across Friday services alongside campus ministry contributions
          </CardDescription>
        </div>

        {/* Time range pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/60 self-start sm:self-auto">
          {(["7d", "30d", "90d", "ytd"] as TimeRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                timeRange === range
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick summary strip */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-border/40 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Period Total Givings</span>
            <span className="font-semibold text-foreground text-sm">
              ETB {totalPeriodGivings.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <div>
            <span className="text-muted-foreground block text-[11px]">Average Service Attendance</span>
            <span className="font-semibold text-foreground text-sm">
              {avgAttendance.toLocaleString()} students
            </span>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="givingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6719" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#ff6719" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-border/40"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                dy={6}
              />

              {/* Left YAxis: Attendance */}
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickFormatter={(val) => `${val}`}
              />

              {/* Right YAxis: Givings */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const givingsVal = payload.find((p) => p.dataKey === "givings")?.value as number;
                    const attendanceVal = payload.find((p) => p.dataKey === "attendance")?.value as number;

                    return (
                      <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-lg backdrop-blur-xs text-xs space-y-1.5">
                        <p className="font-semibold text-foreground border-b border-border/50 pb-1">
                          {label}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-[#ff6719]" />
                            Givings:
                          </span>
                          <span className="font-semibold text-foreground">
                            ETB {givingsVal?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-teal-500" />
                            Attendance:
                          </span>
                          <span className="font-semibold text-foreground">
                            {attendanceVal?.toLocaleString()} students
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                content={() => (
                  <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-[#ff6719]" />
                      <span>Givings (ETB)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                      <span>Attendance</span>
                    </div>
                  </div>
                )}
              />

              <Area
                yAxisId="right"
                type="monotone"
                dataKey="givings"
                stroke="#ff6719"
                strokeWidth={2}
                fill="url(#givingsGrad)"
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="attendance"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0d9488", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#0d9488" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
