"use client";

import React from "react";
import { Sparkles, Users, Megaphone, HeartHandshake } from "lucide-react";
import { FeedTab } from "@/types/community";
import { cn } from "@/lib/utils";

interface CommunityTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  className?: string;
}

const TABS: { id: FeedTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "following", label: "Following", icon: Users },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "prayer_requests", label: "Prayer Requests", icon: HeartHandshake },
];

export function CommunityTabs({
  activeTab,
  onTabChange,
  className,
}: CommunityTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Feed channels"
      className={cn(
        "flex items-center gap-1 p-1 bg-muted/40 border border-border/60 rounded-xl overflow-x-auto scrollbar-none",
        className
      )}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap select-none",
              isActive
                ? "bg-card text-foreground shadow-xs border border-border/60 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
