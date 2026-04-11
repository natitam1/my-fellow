"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Users,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Users2,
} from "lucide-react";
import { motion } from "framer-motion";

interface SummaryCardsProps {
  stats: {
    users: number;
    userIncrease: number;
    transactions: number;
    transactionIncrease: number;
    totalGivingsAmount: number;
    revenueIncrease: number;
    registrations: number;
    registrationIncrease: number;
    events: number;
    programs: number;
    locations: number;
    leaders: number;
    teams: number;
  };
}

// Animated counter hook (unchanged)
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let target = isNaN(end) ? 0 : end;
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
    <>
      {prefix}
      {animatedValue.toLocaleString()}
      {suffix}
    </>
  );
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  // Helper to format change text
  const formatChange = (increase: number, prefix: string = "") => {
    if (increase === 0) return "0";
    const sign = increase > 0 ? "+" : "";
    return `${sign}${prefix}${Math.abs(increase).toLocaleString()}`;
  };

  const summaries = [
    {
      label: "Total Users",
      value: stats.users || 0,
      icon: Users,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
      change: formatChange(stats.userIncrease || 0) + " users",
      changeType:
        (stats.userIncrease || 0) > 0
          ? ("increase" as const)
          : ("neutral" as const),
      description: "Signed-in users",
    },
    {
      label: "Total Givings",
      value: stats.transactions || 0,
      icon: CreditCard,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: formatChange(stats.transactionIncrease || 0) + " givings",
      changeType:
        (stats.transactionIncrease || 0) > 0
          ? ("increase" as const)
          : ("neutral" as const),
      description: "Total contributions",
    },
    {
      label: "Total Amount",
      value: stats.totalGivingsAmount || 0,
      icon: DollarSign,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      lightBg: "bg-green-50",
      textColor: "text-green-600",
      change: formatChange(stats.revenueIncrease || 0) + " birr",
      changeType:
        (stats.revenueIncrease || 0) > 0
          ? ("increase" as const)
          : ("neutral" as const),
      description: "Revenue performance",
      prefix: "ETB ",
    },
    {
      label: "Events",
      value: stats.events || 0,
      icon: Calendar,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
      change: "",
      changeType: "neutral" as const,
      description: "Active events",
    },
    {
      label: "Programs",
      value: stats.programs || 0,
      icon: Clock,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
      change: "",
      changeType: "neutral" as const,
      description: "Church programs",
    },
    {
      label: "Locations",
      value: stats.locations || 0,
      icon: MapPin,
      color: "bg-red-500",
      gradient: "from-red-500 to-red-600",
      lightBg: "bg-red-50",
      textColor: "text-red-600",
      change: "",
      changeType: "neutral" as const,
      description: "Church locations",
    },
    {
      label: "Leaders",
      value: stats.leaders || 0,
      icon: UserCheck,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      lightBg: "bg-indigo-50",
      textColor: "text-indigo-600",
      change: "",
      changeType: "neutral" as const,
      description: "Active leaders",
    },
    {
      label: "Teams",
      value: stats.teams || 0,
      icon: Users2,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600",
      lightBg: "bg-pink-50",
      textColor: "text-pink-600",
      change: "",
      changeType: "neutral" as const,
      description: "Church teams",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {summaries.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={cn(
            "p-6 rounded-2xl bg-white border border-gray-100 transition-all duration-300 cursor-pointer group hover:shadow-md",
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "p-3 rounded-xl transition-all duration-300",
                "bg-gray-50 group-hover:" + item.lightBg,
                "group-hover:scale-110",
              )}
            >
              <item.icon
                size={24}
                className={cn(
                  "transition-colors duration-300",
                  "text-gray-400 group-hover:" + item.textColor,
                )}
              />
            </div>
            {item.change !== "" ? (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold grayscale group-hover:grayscale-0 transition-all duration-300",
                  item.changeType === "increase"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {item.changeType === "increase" && <ArrowUpRight size={12} />}
                {item.change}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900">
              <AnimatedValue value={item.value} prefix={item.prefix || ""} />
            </h3>
            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
          </div>

          {/* Decorative gradient bar */}
          <div
            className={cn(
              "h-1 w-full mt-4 rounded-full transition-all duration-300",
              "bg-gray-200 opacity-40 group-hover:opacity-100 group-hover:bg-linear-to-r",
              item.gradient
                .split(" ")
                .map((cls) => `group-hover:${cls}`)
                .join(" "),
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}
