"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegisteredEvent } from "@/lib/directory-data";
import { getToken } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface RegisteredEventsListProps {
  events?: RegisteredEvent[];
}

interface RawRegistrationItem {
  id?: string;
  _id?: string;
  registrationId?: string;
  eventId?: string;
  title?: string;
  eventTitle?: string;
  category?: string;
  date?: string;
  startDate?: string;
  time?: string;
  location?: string;
  locationName?: string;
  status?: "confirmed" | "attended" | "upcoming";
  ticketNumber?: string;
  checkInCode?: string;
  imageUrl?: string;
}

export function RegisteredEventsList({ events }: RegisteredEventsListProps) {
  const [fetchedEvents, setFetchedEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(events === undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "attended">("all");

  const loadRegistrations = useCallback(async () => {
    if (events !== undefined) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/registrations", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });

      if (!res.ok) {
        setFetchedEvents([]);
        return;
      }

      const json: { data?: RawRegistrationItem[] } = await res.json();
      const rawItems = Array.isArray(json.data) ? json.data : [];

      const mapped: RegisteredEvent[] = rawItems.map((item, idx) => {
        let dateStr = item.date || "";
        let timeStr = item.time || "";
        if (!dateStr && item.startDate) {
          try {
            const parsed = new Date(item.startDate);
            dateStr = format(parsed, "MMM dd, yyyy");
            if (!timeStr) {
              timeStr = format(parsed, "h:mm a");
            }
          } catch {
            dateStr = item.startDate;
          }
        }

        return {
          id: item.registrationId || item.id || item._id || `reg-${idx}`,
          eventId: item.eventId || `evt-${idx}`,
          title: item.eventTitle || item.title || "Fellowship Event",
          category: item.category || "Fellowship Gathering",
          date: dateStr || "TBD",
          time: timeStr || "TBD",
          location: item.locationName || item.location || "4 Kilo Campus",
          status: item.status || "confirmed",
          ticketNumber: item.ticketNumber || item.checkInCode || `ECSF-${1000 + idx}`,
          imageUrl: item.imageUrl,
        };
      });

      setFetchedEvents(mapped);
    } catch {
      setFetchedEvents([]);
    } finally {
      setLoading(false);
    }
  }, [events]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const activeEvents = events ?? fetchedEvents;

  const upcomingCount = activeEvents.filter(
    (ev) => ev.status === "confirmed" || ev.status === "upcoming"
  ).length;

  const attendedCount = activeEvents.filter(
    (ev) => ev.status === "attended"
  ).length;

  const handleCopyTicket = (ticketNumber: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedId(ticketNumber);
    toast.success("Ticket reference copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredEvents = activeEvents.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return ev.status === "confirmed" || ev.status === "upcoming";
    if (filter === "attended") return ev.status === "attended";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filter === "all"
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            All Registrations ({activeEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filter === "upcoming"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("attended")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              filter === "attended"
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Past Attended ({attendedCount})
          </button>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs h-8 self-start sm:self-auto border-border hover:border-primary"
        >
          <Link href="/events">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" aria-hidden="true" />
            Explore More Events
          </Link>
        </Button>
      </div>

      {loading ? (
        <Card className="border-border bg-card/40 text-center py-12">
          <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-xs">Loading your event registrations...</p>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-dashed border-border bg-card/40 text-center py-12">
          <CardContent className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <h4 className="text-base font-semibold text-foreground">No events found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t registered for any events under this filter yet.
              Check our fellowship calendar to join upcoming conferences and
              prayer nights.
            </p>
            <Button
              asChild
              size="sm"
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/events">Browse Upcoming Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs"
            >
              <div className="flex flex-col md:flex-row">
                {/* Event Thumbnail */}
                {event.imageUrl && (
                  <div className="relative md:w-48 h-36 md:h-auto shrink-0 overflow-hidden bg-muted">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 192px"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <Badge
                      className={`absolute top-2.5 left-2.5 text-[10px] font-semibold ${
                        event.status === "confirmed"
                          ? "bg-emerald-600 text-white"
                          : event.status === "upcoming"
                            ? "bg-primary text-primary-foreground"
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
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {event.category}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-foreground mt-0.5 leading-snug">
                          {event.title}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Reference Footer */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-[11px] text-muted-foreground">Ticket ID:</span>
                      <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                        {event.ticketNumber}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyTicket(event.ticketNumber)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Copy ticket number"
                        aria-label={`Copy ticket number ${event.ticketNumber}`}
                      >
                        {copiedId === event.ticketNumber ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                      >
                        Seat Reserved
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
