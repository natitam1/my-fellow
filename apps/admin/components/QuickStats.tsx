"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  stats: {
    transactions: number;
    totalGivingsAmount: number;
    registrations: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  // Calculate derived stats
  const insights = [
    {
      title: "Performance Score",
      value: "94%",
      subtitle: "Excellent",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Transactions",
      value: stats.transactions.toLocaleString(),
      subtitle: "Completed givings",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Givings",
      value: `$${stats.totalGivingsAmount.toLocaleString()}`,
      subtitle: "Total amount",
      icon: Zap,
      color: "text-[#ff6719]",
      bgColor: "bg-orange-50",
    },
    {
      title: "Registrations",
      value: stats.registrations.toLocaleString(),
      subtitle: "User events",
      icon: CheckCircle2,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  const recentActivity = [
    {
      type: "success",
      message: "New user registered",
      time: "2 mins ago",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      type: "info",
      message: "Event 'Tech Summit' updated",
      time: "15 mins ago",
      icon: AlertCircle,
      color: "text-blue-500",
    },
    {
      type: "success",
      message: "Payment received - $250",
      time: "1 hour ago",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      type: "warning",
      message: "Event registration closing soon",
      time: "2 hours ago",
      icon: Clock,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
            <p className="text-sm text-gray-500">
              Performance metrics overview
            </p>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#ff6719] font-medium hover:underline">
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                  insight.bgColor,
                )}
              >
                <insight.icon size={20} className={insight.color} />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {insight.title}
              </p>
              <p className="text-xl font-bold text-gray-900">{insight.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{insight.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest system updates</p>
          </div>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={cn("mt-0.5", activity.color)}>
                <activity.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          View all activity
        </button>
      </motion.div>
    </div>
  );
}
