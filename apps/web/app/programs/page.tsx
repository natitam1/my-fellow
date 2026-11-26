"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Heart,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_PROGRAMS, MockProgram } from "@/lib/mock-data";
import { toast } from "sonner";

const DAY_ORDER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export default function ProgramsPublicPage() {
  const [selectedDay, setSelectedDay] = useState<string>("All");

  const days = ["All", "Monday", "Wednesday", "Friday"];

  const filteredPrograms = selectedDay === "All"
    ? [...MOCK_PROGRAMS].sort((a, b) => (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99))
    : MOCK_PROGRAMS.filter((p) => p.dayOfWeek === selectedDay);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[10px] tracking-widest">
          Weekly Fellowship Rhythm
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          Programs & Gatherings
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Join us throughout the academic week for congregational worship, student prayer vigils, expository Bible study, and campus fellowship.
        </p>
      </div>

      {/* Day Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedDay === day
                ? "bg-primary text-white shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card
            key={program._id}
            className="border-border/80 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="font-medium text-xs">
                  {program.dayOfWeek}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active weekly
                </span>
              </div>
              <CardTitle className="text-base sm:text-lg font-bold leading-snug">
                {program.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-3">
                {program.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="rounded-lg border bg-muted/20 p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{program.startTime} - {program.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{program.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{program.targetAudience}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Reminder set for ${program.title}`)}
                className="w-full text-xs h-8 gap-1.5"
              >
                <Bell className="h-3.5 w-3.5 text-primary" />
                Add to Campus Calendar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
