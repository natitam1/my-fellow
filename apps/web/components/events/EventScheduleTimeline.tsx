"use client";

import React from "react";
import { EventScheduleItem } from "@/lib/events-data";
import { Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventScheduleTimelineProps {
  schedule: EventScheduleItem[];
}

export function EventScheduleTimeline({ schedule }: EventScheduleTimelineProps) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
        Schedule program details will be announced closer to the event date.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
      {schedule.map((item, index) => (
        <div key={item.id || index} className="relative group">
          {/* Timeline Dot Indicator */}
          <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 border-background bg-primary ring-4 ring-primary/20 group-hover:scale-110 transition-transform" />

          <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-2 hover:border-border transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary">
                <Clock className="w-3.5 h-3.5" />
                {item.time}
              </span>
              {item.room && (
                <Badge variant="secondary" className="text-[11px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  {item.room}
                </Badge>
              )}
            </div>

            <h4 className="font-bold text-base text-foreground leading-snug">
              {item.title}
            </h4>

            {item.speaker && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Speaker / Lead: <strong>{item.speaker}</strong></span>
              </div>
            )}

            {item.description && (
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
