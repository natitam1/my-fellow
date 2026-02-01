"use client";

import { cn } from "@/lib/utils";
import React from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

interface SummaryCardsProps {
  stats: {
    users: number;
    events: number;
    registrations: number;
    transactions: number;
    totalRevenue: number;
  };
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const summaries = [
    {
      label: "Total Users",
      value: stats.users.toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Events",
      value: stats.events.toLocaleString(),
      icon: Calendar,
      color: "bg-[#ff6719]",
    },
    {
      label: "Registrations",
      value: stats.registrations.toLocaleString(),
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaries.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2 rounded-lg text-white", item.color)}>
              <item.icon size={20} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <h3 className="text-3xl font-bold mt-1">{item.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
