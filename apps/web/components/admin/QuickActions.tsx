"use client";

import React from "react";
import Link from "next/link";
import {
  PenLine,
  CalendarPlus,
  BellRing,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "New Devotional",
      description: "Publish or schedule daily quiet time reflection",
      href: "/admin/devotions/new",
      icon: PenLine,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      title: "Create Event",
      description: "Set up campus revival, fellowship, or vigil",
      href: "/admin/events/new",
      icon: CalendarPlus,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      title: "Send Notification",
      description: "Broadcast SMS/push announcement to fellowship",
      href: "/admin/notifications",
      icon: BellRing,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      title: "Add Leader",
      description: "Appoint fellowship executive or team head",
      href: "/admin/leaders/new",
      icon: UserPlus,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
  ];

  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">
          Quick Actions
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Frequently used administrative workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.title}
                href={act.href}
                className="group relative flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all duration-200"
              >
                <div
                  className={`h-9 w-9 rounded-lg ${act.bgColor} ${act.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {act.title}
                    </p>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {act.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
