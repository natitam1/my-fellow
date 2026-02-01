"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Users, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const summaries = [
  {
    label: "Total Users",
    value: "2,543",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    label: "Active Events",
    value: "14",
    change: "+2",
    trend: "up",
    icon: Calendar,
    color: "bg-[#ff6719]",
  },
  {
    label: "Total Donations",
    value: "$12,450",
    change: "+18.2%",
    trend: "up",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    label: "Engagement Rate",
    value: "68%",
    change: "+3.1%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
];

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaries.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2 rounded-lg text-white", item.color)}>
              <item.icon size={20} />
            </div>
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                item.trend === "up"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600",
              )}
            >
              {item.change}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {item.label}
            </p>
            <h3 className="text-3xl font-bold mt-1">{item.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
