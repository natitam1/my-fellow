"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_STATS } from "@/lib/mock-data";

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string | Date;
  type: "devotion" | "event" | "payment" | "team" | "system";
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: "New devotion published",
    detail: "Rooted in Faith Amid Academic Seasons by Ephrem Hailu",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    type: "devotion",
  },
  {
    id: "act-2",
    title: "Event registration milestone",
    detail: "Annual Revival reached 430 registered students",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1h 15m ago
    type: "event",
  },
  {
    id: "act-3",
    title: "Giving verified via Chapa",
    detail: "ETB 2,500 tithe contributed for Campus Welfare",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    type: "payment",
  },
  {
    id: "act-4",
    title: "New team membership application",
    detail: "Abel Teklu (Mech Eng 2nd Yr) applied for Media & Sound",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
    type: "team",
  },
  {
    id: "act-5",
    title: "Prayer chain session logged",
    detail: "Morning Glory intercession held at Upper Sanctuary (48 attendees)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14h ago
    type: "system",
  },
];

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Ticking state to update relative timestamps live every 60 seconds
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const items: ActivityItem[] =
    activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "devotion":
        return <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case "event":
        return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "team":
        return <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    }
  };

  const getRelativeTime = (time: string | Date) => {
    try {
      const d = typeof time === "string" ? new Date(time) : time;
      if (isNaN(d.getTime())) return String(time);
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return String(time);
    }
  };

  return (
    <Card className="border-border/80 bg-card shadow-xs flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              Recent Activity
            </CardTitle>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Live stream of fellowship engagements & updates
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-[10px] font-medium border-border/60">
          Live
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 p-0 px-6 pb-6">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline marker icon */}
              <div className="absolute -left-[30px] top-1 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-2xs group-hover:border-primary/50 transition-colors">
                {getActivityIcon(item.type)}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
