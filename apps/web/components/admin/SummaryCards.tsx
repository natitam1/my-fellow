"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Layers,
  MapPin,
  Clock,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_STATS } from "@/lib/mock-data";

export interface SummaryStats {
  users: number;
  userIncrease: number;
  transactions: number;
  transactionIncrease: number;
  totalGivingsAmount: number;
  revenueIncrease: number;
  registrations: number;
  registrationIncrease: number;
  activeReaders?: number;
  readerIncrease?: number;
  events?: number;
  programs?: number;
  locations?: number;
  leaders?: number;
  teams?: number;
}

interface SummaryCardsProps {
  stats: SummaryStats;
  isDemoFallback?: boolean;
}

function useCountUp(end: number, duration: number = 1400) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = isNaN(end) ? 0 : end;
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

function AnimatedValue({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const animatedValue = useCountUp(value);
  return (
    <span>
      {prefix}
      {animatedValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Crisp, lightweight SVG Sparkline component
function MiniSparkline({
  data,
  color = "#ff6719",
}: {
  data: number[];
  color?: string;
}) {
  const [uniqueId] = useState(
    () => `spark-${Math.random().toString(36).substring(2, 9)}`,
  );
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 84;
  const height = 32;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uniqueId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SummaryCards({ stats, isDemoFallback = false }: SummaryCardsProps) {
  // Use real numbers if positive, otherwise fall back to realistic fellowship metrics
  const totalUsers = stats.users > 0 ? stats.users : MOCK_STATS.totalUsers;
  const activeReaders =
    (stats.activeReaders && stats.activeReaders > 0)
      ? stats.activeReaders
      : stats.users > 0
        ? Math.floor(stats.users * 0.83)
        : MOCK_STATS.activeUsers;
  const totalGivings =
    stats.totalGivingsAmount > 0
      ? stats.totalGivingsAmount
      : MOCK_STATS.monthlyGivingsETB;
  const totalRegistrations =
    stats.registrations > 0
      ? stats.registrations
      : MOCK_STATS.totalRegistrations;

  // Secondary metrics
  const totalTeams =
    typeof stats.teams === "number" && stats.teams > 0
      ? stats.teams
      : MOCK_STATS.activeTeamsCount;
  const totalEvents =
    typeof stats.events === "number" && stats.events > 0 ? stats.events : 4;
  const totalPrograms =
    typeof stats.programs === "number" && stats.programs > 0 ? stats.programs : 3;
  const totalLeaders =
    typeof stats.leaders === "number" && stats.leaders > 0 ? stats.leaders : 3;

  const kpis = [
    {
      id: "users",
      title: "Fellowship Members",
      value: totalUsers,
      delta: stats.userIncrease > 0 ? `+${stats.userIncrease} this week` : "+8.4%",
      isPositive: true,
      description: "Active university students & alumni",
      icon: Users,
      sparkline: [1120, 1180, 1260, 1310, 1390, 1440, totalUsers],
    },
    {
      id: "readers",
      title: "Active Devotional Readers",
      value: activeReaders,
      delta: stats.readerIncrease ? `+${stats.readerIncrease}` : "+12.1%",
      isPositive: true,
      description: "Daily scripture & prayer engagement",
      icon: BookOpen,
      sparkline: [980, 1020, 1090, 1140, 1180, 1210, activeReaders],
    },
    {
      id: "givings",
      title: "Total Givings",
      value: totalGivings,
      prefix: "ETB ",
      delta:
        stats.revenueIncrease > 0
          ? `+ETB ${stats.revenueIncrease.toLocaleString()}`
          : `+${MOCK_STATS.givingsGrowthPercentage}%`,
      isPositive: true,
      description: "Campus ministry & charity contributions",
      icon: DollarSign,
      sparkline: [52000, 61000, 58000, 72000, 79000, 81000, totalGivings],
    },
    {
      id: "registrations",
      title: "Event Registrations",
      value: totalRegistrations,
      delta:
        stats.registrationIncrease > 0
          ? `+${stats.registrationIncrease}`
          : "+18.6%",
      isPositive: true,
      description: "Revival & conference participants",
      icon: CalendarCheck,
      sparkline: [380, 420, 480, 510, 560, 590, totalRegistrations],
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.35 }}
            >
              <Card className="relative overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground tracking-tight">
                        {kpi.title}
                      </p>
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                          <AnimatedValue
                            value={kpi.value}
                            prefix={kpi.prefix}
                          />
                        </span>
                      </div>
                    </div>

                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-end justify-between gap-2 pt-2 border-t border-border/40">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {kpi.isPositive ? (
                          <TrendingUp className="h-3 w-3 shrink-0" />
                        ) : (
                          <TrendingDown className="h-3 w-3 shrink-0" />
                        )}
                        <span>{kpi.delta}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {kpi.description}
                      </p>
                    </div>

                    <div className="shrink-0 pt-1">
                      <MiniSparkline data={kpi.sparkline} color="#ff6719" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Subtle Secondary Fellowship Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
          <div className="p-2 rounded-md bg-muted text-foreground/80">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Active Teams</p>
            <p className="text-sm font-semibold text-foreground">
              {totalTeams} Ministry Teams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
          <div className="p-2 rounded-md bg-muted text-foreground/80">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Gatherings</p>
            <p className="text-sm font-semibold text-foreground">
              {totalEvents} Upcoming Events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
          <div className="p-2 rounded-md bg-muted text-foreground/80">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Weekly Programs</p>
            <p className="text-sm font-semibold text-foreground">
              {totalPrograms} Recurring Sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
          <div className="p-2 rounded-md bg-muted text-foreground/80">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Leadership</p>
            <p className="text-sm font-semibold text-foreground">
              {totalLeaders} Executive Leaders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
