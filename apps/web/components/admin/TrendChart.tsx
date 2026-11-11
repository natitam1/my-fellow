"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { name: "Week 1", users: 120, registrations: 45 },
  { name: "Week 2", users: 180, registrations: 72 },
  { name: "Week 3", users: 250, registrations: 98 },
  { name: "Week 4", users: 310, registrations: 145 },
  { name: "Week 5", users: 420, registrations: 180 },
  { name: "Week 6", users: 490, registrations: 220 },
];

export function TrendChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm h-[300px] flex flex-col"
    >
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Growth Trend</h3>
          <p className="text-sm text-gray-500">Users vs Registrations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ff6719] rounded-full" />
            <span className="text-xs text-gray-500">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-500">Registrations</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6719" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff6719" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="colorRegistrations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#ffffff",
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#ff6719"
              strokeWidth={2}
              fill="url(#colorUsers)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="registrations"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorRegistrations)"
              animationDuration={1500}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
