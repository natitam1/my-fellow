"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Flame, Sparkles, CheckCircle2, Trophy, ArrowRight, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { INITIAL_SPIRITUAL_STREAK, SpiritualStreak } from "@/lib/directory-data";
import { toast } from "sonner";

interface SpiritualStreakCardProps {
  initialStreak?: number;
}

export function SpiritualStreakCard({ initialStreak }: SpiritualStreakCardProps) {
  const [streakData, setStreakData] = useState<SpiritualStreak>({
    ...INITIAL_SPIRITUAL_STREAK,
    currentStreak: initialStreak !== undefined && initialStreak > 0 ? initialStreak : INITIAL_SPIRITUAL_STREAK.currentStreak,
  });

  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  const handleQuickCheckin = () => {
    if (hasCompletedToday) {
      toast.info("You've already completed today's scripture meditation!");
      return;
    }
    setStreakData((prev) => ({
      ...prev,
      currentStreak: prev.currentStreak + 1,
      longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
    }));
    setHasCompletedToday(true);
    toast.success("Hallelujah! Devotional streak updated to " + (streakData.currentStreak + 1) + " days! 🔥");
  };

  const progressPercent = Math.min(
    100,
    Math.round((streakData.currentStreak / streakData.milestoneTarget) * 100)
  );

  return (
    <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Streak Counter Badge */}
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF6719]/10 text-[#FF6719] border border-[#FF6719]/25 shadow-xs">
              <Flame className="h-8 w-8 animate-pulse text-[#FF6719]" />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6719] text-[10px] font-bold text-white shadow-xs">
                ★
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {streakData.currentStreak} Days Streak
                </h3>
                <Badge
                  variant="outline"
                  className="border-[#FF6719]/40 bg-[#FF6719]/10 text-[#FF6719] font-semibold text-xs px-2 py-0.5"
                >
                  Daily Bread Active
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                {streakData.encouragement}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickCheckin}
              disabled={hasCompletedToday}
              className="text-xs font-medium border-border hover:border-[#FF6719]/50 hover:bg-[#FF6719]/5"
            >
              <CheckCircle2 className={`h-3.5 w-3.5 mr-1.5 ${hasCompletedToday ? "text-emerald-500" : "text-muted-foreground"}`} />
              {hasCompletedToday ? "Checked In Today" : "Check In Today"}
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs shadow-xs"
            >
              <Link href="/devotions">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Read Devotional
              </Link>
            </Button>
          </div>
        </div>

        {/* 7-Day Weekly Check-in Pills */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2.5">
            <span className="font-medium flex items-center gap-1.5 text-foreground">
              <Calendar className="h-3.5 w-3.5 text-[#FF6719]" />
              This Week's Consistency
            </span>
            <span>
              Best: <strong className="text-foreground">{streakData.longestStreak} days</strong>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {streakData.weeklyCheckins.map((item, index) => {
              const isToday = index === new Date().getDay() - 1 || (index === 6 && new Date().getDay() === 0);
              const isChecked = item.completed || (isToday && hasCompletedToday);

              return (
                <div
                  key={item.day}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                    isChecked
                      ? "border-[#FF6719]/30 bg-[#FF6719]/10 text-[#FF6719]"
                      : "border-border/60 bg-muted/40 text-muted-foreground"
                  } ${isToday ? "ring-1 ring-[#FF6719]" : ""}`}
                >
                  <span className="text-[10px] font-semibold uppercase">{item.short}</span>
                  <div className="mt-1">
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-[#FF6719]" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px]">
                        ·
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Next Milestone: <span className="font-medium text-foreground">{streakData.milestoneTitle}</span></span>
            </span>
            <span className="font-semibold text-foreground">
              {streakData.currentStreak} / {streakData.milestoneTarget} Days
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-secondary" />
        </div>
      </CardContent>
    </Card>
  );
}
