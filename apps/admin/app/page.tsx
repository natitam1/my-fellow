"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "@/lib/api";
import { SummaryCards } from "@/components/SummaryCards";
import { OverviewChart } from "@/components/OverviewChart";
import { RecentUsers } from "@/components/RecentUsers";
import {
  Loader2,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Giving {
  _id: string;
  amount: number;
  [key: string]: unknown;
}

interface Stats {
  transactions: number;
  transactionIncrease: number;
  totalGivingsAmount: number;
  revenueIncrease: number;
  registrations: number;
  registrationIncrease: number;
  users: number;
  userIncrease: number;
  events: number;
  pendingTransactions: number;
  programs: number;
  locations: number;
  leaders: number;
  teams: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [growthStats, setGrowthStats] = useState<{
    users: number;
    transactions: number;
    revenue: number;
    registrations: number;
  } | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, transactionsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/transactions"),
      ]);

      console.log("Dashboard Stats Response:", statsRes.data);

      const statsData = statsRes.data.data || statsRes.data;
      const usersData = usersRes.data.data || usersRes.data;
      const transactionsData =
        transactionsRes.data.data || transactionsRes.data;

      // Modular growth calculation helper
      const getGrowth = (
        data: any[],
        dateField: string = "createdAt",
        amountField?: string,
      ) => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const currentWeek = data.filter(
          (item) => new Date(item[dateField]) >= oneWeekAgo,
        );

        if (amountField) {
          const currentAmount = currentWeek.reduce(
            (sum, item) => sum + (Number(item[amountField]) || 0),
            0,
          );
          return currentAmount;
        }

        return currentWeek.length;
      };

      if (Array.isArray(usersData) && Array.isArray(transactionsData)) {
        setAllTransactions(transactionsData);
        setGrowthStats({
          users: getGrowth(usersData),
          transactions: getGrowth(transactionsData),
          revenue: getGrowth(transactionsData, "createdAt", "amount"),
          registrations: getGrowth(transactionsData),
        });
      }

      setStats({
        users: statsData.users ?? 0,
        userIncrease: statsData.userIncrease ?? 0,
        transactions: statsData.transactions ?? 0,
        transactionIncrease: statsData.transactionIncrease ?? 0,
        totalGivingsAmount: statsData.totalRevenue ?? 0,
        revenueIncrease: statsData.revenueIncrease ?? 0,
        registrations: statsData.registrations ?? 0,
        registrationIncrease: statsData.registrationIncrease ?? 0,
        events: statsData.events ?? 0,
        programs: statsData.programs ?? 0,
        locations: statsData.locations ?? 0,
        leaders: statsData.leaders ?? 0,
        teams: statsData.teams ?? 0,
        pendingTransactions:
          statsData.pendingTransactions ?? statsData.transactions ?? 0,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Critical error in dashboard data fetch:", error);
      toast.error("Could not load dashboard data");
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
    users: 0,
    userIncrease: 0,
    transactions: 0,
    transactionIncrease: 0,
    totalGivingsAmount: 0,
    revenueIncrease: 0,
    registrations: 0,
    registrationIncrease: 0,
    events: 0,
    pendingTransactions: 0,
    programs: 0,
    locations: 0,
    leaders: 0,
    teams: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div />
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

      <SummaryCards
        stats={{
          ...currentStats,
          userIncrease: growthStats?.users ?? 0,
          transactionIncrease: growthStats?.transactions ?? 0,
          revenueIncrease: growthStats?.revenue ?? 0,
          registrationIncrease: growthStats?.registrations ?? 0,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverviewChart transactions={allTransactions} />
        </div>
        <div>
          <RecentUsers />
        </div>
      </div>
    </div>
  );
}
