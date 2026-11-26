"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { SummaryCards, SummaryStats } from "@/components/admin/SummaryCards";
import { OverviewChart, TransactionItem } from "@/components/admin/OverviewChart";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentUsers } from "@/components/admin/RecentUsers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  Calendar,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface GrowthStats {
  users: number;
  transactions: number;
  revenue: number;
  registrations: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [growthStats, setGrowthStats] = useState<GrowthStats | null>(null);
  const [allTransactions, setAllTransactions] = useState<TransactionItem[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, usersRes, transactionsRes] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/transactions"),
      ]);

      let statsData: Record<string, unknown> = {};
      let usersData: unknown[] = [];
      let transactionsData: TransactionItem[] = [];

      if (statsRes.status === "fulfilled") {
        const raw = statsRes.value.data;
        statsData = (raw?.data || raw || {}) as Record<string, unknown>;
      }

      if (usersRes.status === "fulfilled") {
        const raw = usersRes.value.data;
        usersData = (Array.isArray(raw) ? raw : raw?.data || []) as unknown[];
      }

      if (transactionsRes.status === "fulfilled") {
        const raw = transactionsRes.value.data;
        transactionsData = (Array.isArray(raw) ? raw : raw?.data || []) as TransactionItem[];
      }

      // Compute modular growth if datasets exist
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const userIncreaseCount = usersData.filter((u) => {
        if (typeof u === "object" && u !== null && "createdAt" in u) {
          return new Date((u as { createdAt: string }).createdAt) >= oneWeekAgo;
        }
        return false;
      }).length;

      const recentTransactions = transactionsData.filter((t) => {
        return t.createdAt && new Date(t.createdAt) >= oneWeekAgo;
      });

      const revenueIncreaseAmount = recentTransactions.reduce(
        (sum, t) => sum + (Number(t.amount) || 0),
        0,
      );

      const hasSufficientData =
        (Number(statsData.users) || 0) > 0 ||
        usersData.length > 0 ||
        transactionsData.length > 0;

      setAllTransactions(transactionsData);
      setGrowthStats({
        users: userIncreaseCount,
        transactions: recentTransactions.length,
        revenue: revenueIncreaseAmount,
        registrations: recentTransactions.length,
      });

      const parsedUsers = Number(statsData.users ?? usersData.length ?? 0);
      const parsedTransactions = Number(
        statsData.transactions ?? transactionsData.length ?? 0,
      );
      const parsedGivings = Number(
        statsData.totalRevenue ?? statsData.totalGivingsAmount ?? 0,
      );
      const parsedRegistrations = Number(statsData.registrations ?? 0);

      setIsDemoMode(false);
      setStats({
        users: parsedUsers,
        userIncrease: userIncreaseCount,
        transactions: parsedTransactions,
        transactionIncrease: recentTransactions.length,
        totalGivingsAmount: parsedGivings,
        revenueIncrease: revenueIncreaseAmount,
        registrations: parsedRegistrations,
        registrationIncrease: Number(statsData.registrationIncrease ?? 0),
        activeReaders: Number(statsData.activeReaders ?? statsData.activeUsers ?? 0),
        readerIncrease: Number(statsData.readerIncrease ?? 0),
        events: Number(statsData.events ?? 0),
        programs: Number(statsData.programs ?? 0),
        locations: Number(statsData.locations ?? 0),
        leaders: Number(statsData.leaders ?? 0),
        teams: Number(statsData.teams ?? 0),
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load live admin stats:", error);
      setStats({
        users: 0,
        userIncrease: 0,
        transactions: 0,
        transactionIncrease: 0,
        totalGivingsAmount: 0,
        revenueIncrease: 0,
        registrations: 0,
        registrationIncrease: 0,
        activeReaders: 0,
        readerIncrease: 0,
        events: 0,
        programs: 0,
        locations: 0,
        leaders: 0,
        teams: 0,
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Loading fellowship metrics...
          </p>
        </div>
      </div>
    );
  }

  const currentStats: SummaryStats = stats || {
    users: 0,
    userIncrease: 0,
    transactions: 0,
    transactionIncrease: 0,
    totalGivingsAmount: 0,
    revenueIncrease: 0,
    registrations: 0,
    registrationIncrease: 0,
    activeReaders: 0,
    readerIncrease: 0,
    events: 0,
    programs: 0,
    locations: 0,
    leaders: 0,
    teams: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground font-poppins">
              Overview
            </h1>
            {isDemoMode && (
              <Badge variant="outline" className="text-[11px] font-normal border-primary/30 text-primary bg-primary/5">
                <Sparkles className="h-3 w-3 mr-1" />
                Live Demo Sync
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            AAU 4 Kilo Christian Students Fellowship • Operational Command
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Synced at {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="rounded-full text-xs h-8 px-3 border-border/70 hover:border-primary/40"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin text-primary" : "text-muted-foreground"}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </motion.div>

      {/* Quick Action Shortcuts */}
      <QuickActions />

      {/* KPI Stat Cards with deltas & sparklines */}
      <SummaryCards
        stats={{
          ...currentStats,
          userIncrease: growthStats?.users ?? currentStats.userIncrease,
          transactionIncrease: growthStats?.transactions ?? currentStats.transactionIncrease,
          revenueIncrease: growthStats?.revenue ?? currentStats.revenueIncrease,
          registrationIncrease: growthStats?.registrations ?? currentStats.registrationIncrease,
        }}
        isDemoFallback={isDemoMode}
      />

      {/* Main Content Grid: Overview Time-Series Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverviewChart transactions={allTransactions} />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Secondary Row: Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentUsers />
        </div>
        <div className="p-6 rounded-xl border border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Fellowship Mission Verse
              </h3>
            </div>
            <blockquote className="text-xs text-muted-foreground italic leading-relaxed pl-3 border-l-2 border-primary/40">
              &ldquo;Therefore, as you received Christ Jesus the Lord, so walk in him, rooted and built up in him and established in the faith, just as you were taught, abounding in thanksgiving.&rdquo;
            </blockquote>
            <p className="text-[11px] font-medium text-foreground text-right">
              — Colossians 2:6-7 (AAU ECSF Theme)
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Semester Cycle: 2025/2026</span>
            <span className="font-semibold text-primary">Week 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
