"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateBadge } from "./DateBadge";
import { RegistrationDialog } from "./RegistrationDialog";
import { FellowshipEvent, isEventPast } from "@/lib/events-data";
import { MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: FellowshipEvent;
  priority?: boolean;
}

export function EventCard({ event, priority = false }: EventCardProps) {
  const isPast = isEventPast(event.endDate);
  const seatsLeft = Math.max(
    0,
    (event.registrationLimit || 0) - event.registrationsCount
  );
  const percentFilled =
    event.registrationLimit > 0
      ? Math.min(100, Math.round((event.registrationsCount / event.registrationLimit) * 100))
      : 0;

  const isFull = event.registrationLimit > 0 && seatsLeft === 0;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-border/70 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Image & Floating Badges */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top Left: Category & Team */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-xs text-foreground font-semibold text-[11px] shadow-xs border-border/40"
            >
              {event.categoryLabel}
            </Badge>
            <Badge
              variant="outline"
              className="bg-black/40 backdrop-blur-xs text-white border-white/20 text-[11px]"
            >
              {event.team}
            </Badge>
          </div>

          {/* Top Right: Status / Urgency */}
          <div className="absolute top-3 right-3 z-10">
            {isPast ? (
              <Badge variant="outline" className="bg-black/60 text-white/80 border-white/20 text-[10px]">
                Past Event
              </Badge>
            ) : isFull ? (
              <Badge variant="destructive" className="font-semibold text-[10px]">
                Full
              </Badge>
            ) : seatsLeft <= 20 ? (
              <Badge className="bg-amber-500 text-white font-semibold text-[10px]">
                {seatsLeft} seats left
              </Badge>
            ) : event.badge ? (
              <Badge className="bg-primary text-white font-semibold text-[10px]">
                {event.badge}
              </Badge>
            ) : null}
          </div>

          {/* Bottom Overlay: Time */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
            <span className="flex items-center gap-1 drop-shadow-xs font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {new Date(event.startDate).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            <span className="text-[11px] font-medium text-white/80 drop-shadow-xs">
              {event.admissionFee}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <CardContent className="p-4 sm:p-5 flex gap-4">
          {/* Prominent Calendar Date Badge */}
          <DateBadge
            dateString={event.startDate}
            size="md"
            className="shrink-0 mt-0.5"
          />

          <div className="flex-1 min-w-0 space-y-2">
            <Link
              href={`/events/${event.id}`}
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight leading-snug line-clamp-2">
                {event.title}
              </h3>
            </Link>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {event.shortDescription}
            </p>

            {/* Location Details with Map Pin */}
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                <strong className="text-foreground font-medium">
                  {event.location.name}
                </strong>
                {event.location.room && ` (${event.location.room})`}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Footer: Seats Progress & Action Buttons */}
      <div className="px-4 sm:px-5 pb-4 pt-1 space-y-3 border-t border-border/50">
        {/* Capacity / Seats Left Indicator */}
        {!isPast && event.registrationLimit > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {event.registrationsCount}
                </span>{" "}
                / {event.registrationLimit} registered
              </span>
              <span
                className={cn(
                  "font-semibold text-[11px]",
                  isFull
                    ? "text-destructive"
                    : seatsLeft <= 25
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {isFull ? "No seats left" : `${seatsLeft} seats left`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isFull
                    ? "bg-destructive"
                    : percentFilled > 80
                    ? "bg-amber-500"
                    : "bg-primary"
                )}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-medium h-9"
          >
            <Link href={`/events/${event.id}`}>
              View Details
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>

          {!isPast && event.isRegistrationOpen && (
            <RegistrationDialog
              event={event}
              triggerButton={
                <Button
                  size="sm"
                  disabled={isFull}
                  className="flex-1 text-xs font-medium h-9"
                >
                  {isFull ? "Full" : "Register"}
                </Button>
              }
            />
          )}
        </div>
      </div>
    </Card>
  );
}
