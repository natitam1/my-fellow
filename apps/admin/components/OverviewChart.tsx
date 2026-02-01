"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 2400 },
  { name: "May", total: 1700 },
  { name: "Jun", total: 2800 },
  { name: "Jul", total: 3200 },
  { name: "Aug", total: 2900 },
  { name: "Sep", total: 3500 },
  { name: "Oct", total: 3100 },
  { name: "Nov", total: 4200 },
  { name: "Dec", total: 4800 },
];

export function OverviewChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm h-[400px] flex flex-col"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Revenue Overview</h3>
          <p className="text-sm text-gray-500">
            Monthly revenue growth for 2026
          </p>
        </div>
        <select className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-1 text-sm outline-none">
          <option>Year 2026</option>
          <option>Year 2025</option>
        </select>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#18181b",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
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
