"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { SummaryCards } from "@/components/SummaryCards";
import { OverviewChart } from "@/components/OverviewChart";
import { RecentUsers } from "@/components/RecentUsers";
import { Loader2 } from "lucide-react";

interface Stats {
  users: number;
  events: number;
  registrations: number;
  transactions: number;
  totalRevenue: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#ff6719]" />
      </div>
    );
  }

  if (!stats) {
    // Fallback to 0 if api fails
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCards
            stats={{
              users: 0,
              events: 0,
              registrations: 0,
              transactions: 0,
              totalRevenue: 0,
            }}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OverviewChart />
          </div>
          <div>
            <RecentUsers />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCards stats={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div>
          <RecentUsers />
        </div>
      </div>
    </div>
  );
}
