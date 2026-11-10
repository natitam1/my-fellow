"use client";

import React from "react";
import { Users, Calendar, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";
import { ReportsOverviewStats } from "./types";
import { motion } from "framer-motion";

interface QuickKPIRowProps {
  stats: ReportsOverviewStats;
  loading: boolean;
}

export default function QuickKPIRow({ stats, loading }: QuickKPIRowProps) {
  const cards = [
    {
      label: "Total Registered Members",
      value: loading ? "..." : stats.totalMembers.toLocaleString(),
      subtext: "Active fellowship roster",
      trend: "+12% this month",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      accentBorder: "hover:border-blue-200",
    },
    {
      label: "Active Event Registrations",
      value: loading ? "..." : stats.activeRegistrations.toLocaleString(),
      subtext: "Across upcoming cohorts",
      trend: "High engagement",
      icon: Calendar,
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      accentBorder: "hover:border-amber-200",
    },
    {
      label: "Total Financial Givings",
      value: loading ? "..." : `${stats.totalGivings.toLocaleString()} ETB`,
      subtext: "Tithe, offerings & camp funds",
      trend: `${stats.totalTransactions} contributions`,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accentBorder: "hover:border-emerald-200",
    },
    {
      label: "Average Giving / Transaction",
      value: loading ? "..." : `${stats.avgGiving.toLocaleString()} ETB`,
      subtext: "Per financial contribution",
      trend: "Telebirr & CBE verified",
      icon: CreditCard,
      color: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      accentBorder: "hover:border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`relative bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 ${card.accentBorder} flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${card.iconBg} flex items-center justify-center shrink-0`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span className="truncate">{card.subtext}</span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                {card.trend}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
