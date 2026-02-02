"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { SummaryCards } from "@/components/SummaryCards";
import { OverviewChart } from "@/components/OverviewChart";
import { RecentUsers } from "@/components/RecentUsers";
import { QuickStats } from "@/components/QuickStats";
import { TrendChart } from "@/components/TrendChart";
import { Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Giving {
  _id: string;
  amount: number;
  [key: string]: unknown;
}

interface Stats {
  transactions: number;
  totalRevenue: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/givings");
      const givings: Giving[] = response.data || [];

      // Calculate stats from givings data
      const totalTransactions = givings.length;
      const totalRevenue = givings.reduce(
        (sum, giving) => sum + (giving.amount || 0),
        0,
      );

      setStats({
        transactions: totalTransactions,
        totalRevenue: totalRevenue,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch givings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#ff6719] mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const currentStats = stats || {
    transactions: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Summary Cards - 6 key metrics */}
      <SummaryCards stats={currentStats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div>
          <RecentUsers />
        </div>
      </div>

      {/* Quick Stats & Activity */}
      <QuickStats stats={currentStats} />

      {/* Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart />

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-[#ff6719] to-orange-600 text-white shadow-lg h-[300px] flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold">Quick Actions</h3>
            <p className="text-orange-100 text-sm mt-1">
              Common tasks at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-left">
              <span className="text-sm font-medium">Create Event</span>
              <p className="text-xs text-orange-100 mt-1">Add new event</p>
            </button>
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-left">
              <span className="text-sm font-medium">View Users</span>
              <p className="text-xs text-orange-100 mt-1">Manage members</p>
            </button>
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-left">
              <span className="text-sm font-medium">Reports</span>
              <p className="text-xs text-orange-100 mt-1">Generate reports</p>
            </button>
            <button className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-left">
              <span className="text-sm font-medium">Settings</span>
              <p className="text-xs text-orange-100 mt-1">Configure app</p>
            </button>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
            <span className="text-sm text-orange-100">Need help?</span>
            <button className="text-sm font-medium hover:underline">
              View Documentation →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-center gap-8 text-center"
      >
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {currentStats.transactions}
          </p>
          <p className="text-xs text-gray-500">Total Transactions</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-green-600">99.9%</p>
          <p className="text-xs text-gray-500">Uptime</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-[#ff6719]">A+</p>
          <p className="text-xs text-gray-500">Health Score</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-blue-600">24/7</p>
          <p className="text-xs text-gray-500">Monitoring</p>
        </div>
      </motion.div>
    </div>
  );
}
