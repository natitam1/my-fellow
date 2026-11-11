"use client";

import React from "react";
import { formatEventDateBadge } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface DateBadgeProps {
  dateString: string;
  size?: "sm" | "md" | "lg";
  showTime?: boolean;
  className?: string;
}

export function DateBadge({
  dateString,
  size = "md",
  showTime = false,
  className,
}: DateBadgeProps) {
  const { month, day, weekday, time } = formatEventDateBadge(dateString);

  const sizeClasses = {
    sm: "w-14 h-16 text-xs",
    md: "w-18 h-20 text-sm",
    lg: "w-22 h-24 text-base",
  };

  const daySizeClasses = {
    sm: "text-lg font-bold leading-tight",
    md: "text-2xl font-bold leading-none",
    lg: "text-3xl font-extrabold leading-none",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden text-center shrink-0 select-none transition-transform hover:scale-[1.02]",
        sizeClasses[size],
        className
      )}
    >
      {/* Month top header */}
      <div className="w-full bg-primary/10 border-b border-primary/20 text-primary font-bold uppercase tracking-wider text-[10px] py-1 px-1 flex items-center justify-center">
        {month}
      </div>

      {/* Day number */}
      <div className="flex-1 flex flex-col items-center justify-center py-1">
        <span className={cn("text-foreground font-mono", daySizeClasses[size])}>
          {day}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase font-medium">
          {weekday}
        </span>
      </div>

      {showTime && (
        <div className="w-full bg-muted/60 text-[9px] text-muted-foreground py-0.5 border-t border-border/40 font-mono truncate px-1">
          {time}
        </div>
      )}
    </div>
  );
}
