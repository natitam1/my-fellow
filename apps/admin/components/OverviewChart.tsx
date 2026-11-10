"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface OverviewChartProps {
  transactions?: any[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function OverviewChart({ transactions = [] }: OverviewChartProps) {
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = transactions.map((t) =>
      new Date(t.createdAt).getFullYear(),
    );
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
    return uniqueYears.length > 0 ? uniqueYears : [currentYear];
  }, [transactions, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);

  const chartData = useMemo(() => {
    const yearData = new Array(12).fill(0);
    const currentYearTransactions = transactions.filter(
      (t) => new Date(t.createdAt).getFullYear() === selectedYear,
    );

    currentYearTransactions.forEach((t) => {
      const date = new Date(t.createdAt);
      const month = date.getMonth();
      yearData[month] += Number(t.amount) || 0;
    });

    return MONTHS.map((month, index) => ({
      name: month,
      total: yearData[index],
    }));
  }, [transactions, selectedYear]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm h-[400px] flex flex-col"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Givings Overview</h3>
          <p className="text-sm text-gray-500">
            Monthly givings growth for {selectedYear}
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1 text-sm outline-none text-gray-700 focus:ring-2 focus:ring-[#ff6719] focus:border-[#ff6719]"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              Year {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={(value) => `${value} ETB`}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,103,25,0.05)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#ffffff",
                color: "#111827",
              }}
              itemStyle={{ color: "#ff6719", fontWeight: 600 }}
              labelStyle={{
                color: "#6B7280",
                marginBottom: "4px",
                fontWeight: 500,
              }}
            />
            <Bar
              dataKey="total"
              fill="#ff6719"
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
