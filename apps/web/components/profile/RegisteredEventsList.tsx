"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_USER_EVENTS, RegisteredEvent } from "@/lib/directory-data";
import { toast } from "sonner";

interface RegisteredEventsListProps {
  events?: RegisteredEvent[];
}

export function RegisteredEventsList({
  events = MOCK_USER_EVENTS,
}: RegisteredEventsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "attended">("all");

  const handleCopyTicket = (ticketNumber: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedId(ticketNumber);
    toast.success("Ticket reference copied to clipboard! 🎟️");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return ev.status === "confirmed" || ev.status === "upcoming";
    if (filter === "attended") return ev.status === "attended";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filter === "all"
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            All Registrations ({events.length})
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filter === "upcoming"
                ? "bg-[#FF6719] text-white border-[#FF6719]"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Upcoming (2)
          </button>
          <button
            onClick={() => setFilter("attended")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filter === "attended"
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Past Attended (1)
          </button>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs h-8 self-start sm:self-auto border-border hover:border-[#FF6719]"
        >
          <Link href="/catalog">
            <Sparkles className="h-3 w-3 mr-1.5 text-[#FF6719]" />
            Explore More Events
          </Link>
        </Button>
      </div>

      {filteredEvents.length === 0 ? (
        <Card className="border-dashed border-border bg-card/40 text-center py-12">
          <CardContent className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-base font-semibold text-foreground">No events found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven't registered for any events under this filter yet. Check our fellowship calendar to join upcoming conferences and prayer nights!
            </p>
            <Button asChild size="sm" className="mt-2 bg-[#FF6719] hover:bg-[#FF6719]/90 text-white">
              <Link href="/catalog">Browse Upcoming Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredEvents.map((event) => {
            const isConfirmed = event.status === "confirmed" || event.status === "upcoming";

            return (
              <Card
                key={event.id}
                className="overflow-hidden border-border/80 bg-card hover:border-[#FF6719]/40 transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Thumbnail */}
                  {event.imageUrl && (
                    <div className="relative md:w-48 h-36 md:h-auto shrink-0 overflow-hidden bg-muted">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <Badge
                        className={`absolute top-2.5 left-2.5 text-[10px] font-semibold ${
                          event.status === "confirmed"
                            ? "bg-emerald-600 text-white"
                            : event.status === "upcoming"
                            ? "bg-[#FF6719] text-white"
                            : "bg-muted-foreground/80 text-white"
                        }`}
                      >
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FF6719]">
                            {event.category}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-foreground mt-0.5 leading-snug">
                            {event.title}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#FF6719]" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Reference Footer */}
                    <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">Ticket ID:</span>
                        <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                          {event.ticketNumber}
                        </code>
                        <button
                          onClick={() => handleCopyTicket(event.ticketNumber)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          title="Copy ticket number"
                        >
                          {copiedId === event.ticketNumber ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-normal border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                        >
                          Seat Reserved
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
