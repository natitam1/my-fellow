"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

interface SummaryCardsProps {
  stats: {
    transactions: number;
    totalRevenue: number;
  };
}

// Animated counter hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

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
  const avgGiving =
    stats.transactions > 0
      ? Math.round(stats.totalRevenue / stats.transactions)
      : 0;

  const summaries = [
    {
      label: "Total Transactions",
      value: stats.transactions,
      icon: CreditCard,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: "+5.4%",
      changeType: "increase" as const,
      description: "Completed givings",
    },
    {
      label: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      lightBg: "bg-green-50",
      textColor: "text-green-600",
      change: "+18.7%",
      changeType: "increase" as const,
      description: "All time earnings",
      prefix: "$",
    },
    {
      label: "Avg. Giving Amount",
      value: avgGiving,
      icon: Activity,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600",
      lightBg: "bg-pink-50",
      textColor: "text-pink-600",
      change: "+3.2%",
      changeType: "increase" as const,
      description: "Per transaction",
      prefix: "$",
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
          className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "p-3 rounded-xl",
                item.lightBg,
                "group-hover:scale-110 transition-transform duration-300",
              )}
            >
              <item.icon size={24} className={item.textColor} />
            </div>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                item.changeType === "increase"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600",
              )}
            >
              {item.changeType === "increase" ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {item.change}
            </div>
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
              "h-1 w-full mt-4 rounded-full bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity",
              item.gradient,
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}
