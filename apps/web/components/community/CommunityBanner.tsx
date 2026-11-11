"use client";

import React from "react";
import { Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommunityBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-card to-muted/40 p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>4 Kilo ECSF • AAU Fellowship</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Fellowship Community
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            “And let us consider how we may spur one another on toward love and good deeds,
            not giving up meeting together.” — Hebrews 10:24-25
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 self-center shrink-0 border border-border/80 bg-background/80 backdrop-blur-sm rounded-xl px-3.5 py-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground font-medium">Campus Fellowship Live</span>
        </div>
      </div>
    </div>
  );
}
