"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  Ticket,
  Copy,
  Check,
  Share2,
  Flame,
  Music,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Filter,
  X,
  User,
  Phone,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { MOCK_EVENTS, MockEvent } from "@/lib/mock-data";
import { AAU_FACULTIES, ACADEMIC_YEARS } from "@/lib/student-constants";

type EventCategory = "all" | "worship" | "prayer" | "conference" | "training";

interface CategoryTabItem {
  id: EventCategory;
  label: string;
  countKey?: string;
  icon: React.ElementType;
}

const CATEGORY_TABS: CategoryTabItem[] = [
  { id: "all", label: "All Gatherings", icon: Calendar },
  { id: "worship", label: "Worship & Praise", icon: Music },
  { id: "prayer", label: "Prayer & Fasting", icon: Flame },
  { id: "conference", label: "Conferences", icon: Sparkles },
  { id: "training", label: "Workshops & Training", icon: GraduationCap },
];

export default function EventsPage() {
  const { user } = useAuth();

  // Events list & loading
  const [events, setEvents] = useState<MockEvent[]>(MOCK_EVENTS);
  const [isLoading, setIsLoading] = useState(false);

  // Filter state
  const [activeCategory, setActiveCategory] = useState<EventCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyRegistered, setShowOnlyRegistered] = useState(false);

  // RSVP Modal State
  const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpFaculty, setRsvpFaculty] = useState("");
  const [rsvpYear, setRsvpYear] = useState("");
  const [rsvpNotes, setRsvpNotes] = useState("");
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  // RSVP Confirmation State
  const [rsvpConfirmation, setRsvpConfirmation] = useState<{
    ticketCode: string;
    event: MockEvent;
    attendeeName: string;
    registeredAt: string;
  } | null>(null);

  const [copiedTicket, setCopiedTicket] = useState(false);

  // Local storage map of registered tickets: { [eventId]: ticketCode }
  const [registeredMap, setRegisteredMap] = useState<Record<string, string>>({});

  // Fetch events from API with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/events");
        if (res.ok) {
          const json = await res.json();
          const items = json.data || json.events || json;
          if (Array.isArray(items) && items.length > 0 && isMounted) {
            setEvents(items);
            return;
          }
        }
      } catch {
        // Fallback to MOCK_EVENTS
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load registered tickets from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("fellowship_event_rsvps");
        if (stored) {
          setRegisteredMap(JSON.parse(stored));
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }, []);

  // Pre-fill form when user logs in or selects an event
  useEffect(() => {
    if (selectedEvent) {
      if (user) {
        setRsvpName(user.fullName || "");
        setRsvpPhone(user.phoneNumber || "");
        setRsvpFaculty(user.department || AAU_FACULTIES[0]);
        setRsvpYear(user.yearOfStudy || ACADEMIC_YEARS[2]);
      } else {
        setRsvpFaculty(AAU_FACULTIES[0]);
        setRsvpYear(ACADEMIC_YEARS[0]);
      }
    }
  }, [selectedEvent, user]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category match
      if (activeCategory !== "all") {
        if (ev.category.toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }
      }
      // Registered filter
      if (showOnlyRegistered && !registeredMap[ev._id]) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesLoc = ev.location.toLowerCase().includes(q);
        const matchesSpeaker = ev.speaker?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesLoc || Boolean(matchesSpeaker);
      }
      return true;
    });
  }, [events, activeCategory, searchQuery, showOnlyRegistered, registeredMap]);

  // Helper to open RSVP
  const handleOpenRsvp = (event: MockEvent) => {
    setSelectedEvent(event);
    setRsvpConfirmation(null);
    setCopiedTicket(false);
  };

  // Helper to close RSVP modal
  const handleCloseModal = () => {
    setSelectedEvent(null);
    setRsvpConfirmation(null);
    setCopiedTicket(false);
    setIsSubmittingRsvp(false);
  };

  // Helper to submit RSVP
  const handleSubmitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!rsvpName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!rsvpPhone.trim() || rsvpPhone.trim().length < 9) {
      toast.error("Please provide a valid Ethiopian phone number (e.g. 0911223344).");
      return;
    }

    setIsSubmittingRsvp(true);

    // Simulate API registration / instant confirmation
    setTimeout(() => {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `ECSF-${selectedEvent.category.slice(0, 3).toUpperCase()}-${randomDigits}-AAU`;

      const confirmation = {
        ticketCode: generatedCode,
        event: selectedEvent,
        attendeeName: rsvpName.trim(),
        registeredAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      // Update local storage
      const updatedMap = { ...registeredMap, [selectedEvent._id]: generatedCode };
      setRegisteredMap(updatedMap);
      if (typeof window !== "undefined") {
        localStorage.setItem("fellowship_event_rsvps", JSON.stringify(updatedMap));
      }

      // Increment registered count locally
      setEvents((prev) =>
        prev.map((item) =>
          item._id === selectedEvent._id
            ? { ...item, registeredCount: (item.registeredCount || 0) + 1 }
            : item
        )
      );

      setRsvpConfirmation(confirmation);
      setIsSubmittingRsvp(false);
      toast.success("RSVP Confirmed! See you at the fellowship gathering. 🎉");
    }, 600);
  };

  const handleCopyTicket = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTicket(true);
    toast.success("Ticket pass code copied to clipboard!");
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  // Parse calendar badge info: { month: "NOV", day: "28", weekday: "Sat" }
  const parseEventDate = (dateString: string) => {
    try {
      const d = new Date(dateString + "T12:00:00");
      if (isNaN(d.getTime())) {
        return { month: "GATHER", day: "•", weekday: "AAU" };
      }
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: d.getDate().toString(),
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      };
    } catch {
      return { month: "GATHER", day: "•", weekday: "AAU" };
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case "worship":
        return {
          badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
          accent: "text-[#FF6719]",
        };
      case "prayer":
        return {
          badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
          accent: "text-purple-600",
        };
      case "conference":
        return {
          badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
          accent: "text-sky-600",
        };
      case "training":
        return {
          badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          accent: "text-emerald-600",
        };
      default:
        return {
          badge: "bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border-neutral-500/30",
          accent: "text-[#FF6719]",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-[#FF6719]/20 selection:text-[#FF6719]">
      {/* Hero Header Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-card via-card/70 to-background pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF6719]/30 bg-[#FF6719]/10 text-xs font-semibold text-[#FF6719]">
            <Calendar className="w-3.5 h-3.5" />
            <span>AAU 4 Kilo Christian Students Fellowship (ECSF)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Fellowship Gatherings & Campus Events
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join university disciples for weekly revival worship, all-night prayer vigils,
            national student conferences, and marketplace integrity workshops.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF6719]" />
              <span>AAU Alumni Hall & Block 21</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free Student Admission & RSVP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-purple-600" />
              <span>Instant Digital Pass Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Controls: Search & Category Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events, speakers, or campus halls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-border bg-card rounded-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* My RSVPs filter toggle */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowOnlyRegistered(!showOnlyRegistered)}
                className={`h-10 px-3.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  showOnlyRegistered
                    ? "border-[#FF6719] bg-[#FF6719]/10 text-[#FF6719]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>My Registered Events ({Object.keys(registeredMap).length})</span>
              </button>
            </div>
          </div>

          {/* Category Tabs: All, Worship, Prayer, Conference, Training */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#FF6719] text-white shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredEvents.length}</strong> upcoming fellowship gatherings
          </span>
          {(activeCategory !== "all" || searchQuery || showOnlyRegistered) && (
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setShowOnlyRegistered(false);
              }}
              className="text-[#FF6719] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Event Cards Grid */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-3">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-base text-foreground">No events found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any fellowship gatherings matching your filter. Try adjusting your search or category.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setShowOnlyRegistered(false);
              }}
              className="text-xs rounded-xl"
            >
              Show All Events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const dateInfo = parseEventDate(event.date);
              const theme = getCategoryTheme(event.category);
              const isRegistered = Boolean(registeredMap[event._id]);
              const max = event.maxAttendees || 500;
              const count = event.registeredCount || 0;
              const percentage = Math.min(100, Math.round((count / max) * 100));
              const isFillingFast = percentage >= 80;

              return (
                <div
                  key={event._id}
                  className="group bg-card border border-border hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  {/* Event Top Banner with Calendar Badge Overlay */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    {event.bannerUrl ? (
                      <div className="relative w-full h-full bg-neutral-900">
                        {/* Fallback pattern + image representation */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                        <div className="absolute inset-0 bg-[radial-gradient(#FF6719_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                        <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-4xl uppercase select-none">
                          {event.category}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center" />
                    )}

                    {/* Floating Calendar Badge */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-md">
                      <span className="text-[10px] font-bold text-[#FF6719] uppercase tracking-wider">
                        {dateInfo.month}
                      </span>
                      <span className="text-xl font-extrabold text-foreground leading-tight">
                        {dateInfo.day}
                      </span>
                    </div>

                    {/* Category pill on top right */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold backdrop-blur-md px-2.5 py-0.5 border ${theme.badge}`}
                      >
                        {event.category}
                      </Badge>
                    </div>

                    {/* Status badge on bottom right */}
                    <div className="absolute bottom-3 right-3 z-20">
                      {isRegistered ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-semibold gap-1 px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Registered</span>
                        </Badge>
                      ) : isFillingFast ? (
                        <Badge className="bg-amber-600/90 text-white text-[10px] font-semibold px-2 py-0.5">
                          Filling Fast
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Event Details Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-[#FF6719] transition-colors line-clamp-2 leading-snug">
                        {event.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {event.speaker && (
                        <p className="text-xs font-medium text-foreground/80 flex items-center gap-1.5 pt-1">
                          <User className="w-3.5 h-3.5 text-[#FF6719]" />
                          <span>{event.speaker}</span>
                        </p>
                      )}
                    </div>

                    {/* Time & Location Metadata */}
                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#FF6719] shrink-0" />
                        <span className="font-medium text-foreground">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{count} registered</span>
                        </span>
                        <span>{max - count} spots left</span>
                      </div>
                      <Progress value={percentage} className="h-1.5 bg-secondary" />
                    </div>

                    {/* Actions: RSVP or View Ticket */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      {isRegistered ? (
                        <div className="w-full flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                            Pass: {registeredMap[event._id]}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenRsvp(event)}
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            View Ticket
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRsvp(event)}
                            className="rounded-xl text-xs font-semibold flex-1 border-border hover:bg-muted"
                          >
                            <span>Details</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenRsvp(event)}
                            className="rounded-xl text-xs font-semibold bg-[#FF6719] hover:bg-[#FF6719]/90 text-white flex-1 shadow-xs"
                          >
                            <Ticket className="w-3.5 h-3.5 mr-1" />
                            <span>RSVP Free</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Fellowship Fellowship Guarantee / Info Section */}
        <section className="p-6 sm:p-8 rounded-2xl border border-border bg-card/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF6719]" />
              <span>Free Student Fellowship Gatherings</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              All 4 Kilo Christian Students Fellowship events are 100% free of charge for university students, faculty members, and campus guests. No fee is ever required.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/community">
              <Button variant="outline" className="text-xs rounded-xl gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#FF6719]" />
                <span>Join Student Community Feed</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* RSVP / Registration Dialog */}
      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-lg bg-card border-border p-6 rounded-2xl max-h-[92vh] overflow-y-auto">
          {selectedEvent && (
            <div>
              {rsvpConfirmation || registeredMap[selectedEvent._id] ? (
                /* Instant Confirmation Ticket Screen */
                <div className="space-y-5 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-extrabold text-foreground">
                      Registration Confirmed! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Your attendance pass is reserved for AAU 4 Kilo Christian Students Fellowship.
                    </DialogDescription>
                  </div>

                  {/* Digital Ticket Badge */}
                  <div className="rounded-xl border border-dashed border-[#FF6719]/40 bg-gradient-to-b from-[#FF6719]/10 to-transparent p-5 text-left space-y-3 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#FF6719] tracking-wider block">
                          Official Campus Entry Pass
                        </span>
                        <h4 className="font-bold text-sm text-foreground leading-snug">
                          {selectedEvent.title}
                        </h4>
                      </div>
                      <Badge className="bg-[#FF6719] text-white font-mono text-xs shrink-0">
                        AAU ECSF
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Date & Time</span>
                        <span className="font-semibold text-foreground">
                          {selectedEvent.date} • {selectedEvent.time}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Campus Hall</span>
                        <span className="font-semibold text-foreground truncate block">
                          {selectedEvent.location}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Pass Reference</span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {rsvpConfirmation?.ticketCode || registeredMap[selectedEvent._id]}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCopyTicket(
                            rsvpConfirmation?.ticketCode || registeredMap[selectedEvent._id]
                          )
                        }
                        className="h-8 text-xs rounded-lg gap-1 border-border"
                      >
                        {copiedTicket ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Copy Pass</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Present this reference pass or your student ID upon arrival at the fellowship hall entrance desk.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      onClick={handleCloseModal}
                      className="w-full bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-semibold text-xs rounded-xl h-10"
                    >
                      Done & Return to Events
                    </Button>
                  </div>
                </div>
              ) : (
                /* RSVP Registration Form */
                <form onSubmit={handleSubmitRsvp} className="space-y-4">
                  <DialogHeader className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#FF6719] border-[#FF6719]/30">
                        {selectedEvent.category} Gathering
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedEvent.date} • {selectedEvent.time}
                      </span>
                    </div>

                    <DialogTitle className="text-lg font-bold text-foreground">
                      RSVP for {selectedEvent.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Reserve your admission pass for {selectedEvent.location}. Admission is free for all AAU students.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 py-1">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <Label htmlFor="rsvp-name" className="text-xs font-semibold text-foreground">
                        Full Name *
                      </Label>
                      <Input
                        id="rsvp-name"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="e.g. Yohannes Bekele"
                        required
                        className="text-xs h-9 bg-card border-border rounded-xl"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <Label htmlFor="rsvp-phone" className="text-xs font-semibold text-foreground">
                        Ethiopian Phone Number *
                      </Label>
                      <Input
                        id="rsvp-phone"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                        placeholder="0911223344 or +251911223344"
                        required
                        className="text-xs h-9 bg-card border-border rounded-xl font-mono"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        Used to send SMS reminder and verify pass entry.
                      </span>
                    </div>

                    {/* Faculty / Department */}
                    <div className="space-y-1">
                      <Label htmlFor="rsvp-dept" className="text-xs font-semibold text-foreground">
                        AAU Faculty / Academic Department
                      </Label>
                      <Select value={rsvpFaculty} onValueChange={setRsvpFaculty}>
                        <SelectTrigger id="rsvp-dept" className="text-xs h-9 bg-card border-border rounded-xl">
                          <SelectValue placeholder="Select AAU Faculty" />
                        </SelectTrigger>
                        <SelectContent className="max-h-56">
                          {AAU_FACULTIES.map((fac) => (
                            <SelectItem key={fac} value={fac} className="text-xs">
                              {fac}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1">
                      <Label htmlFor="rsvp-year" className="text-xs font-semibold text-foreground">
                        Year of Study
                      </Label>
                      <Select value={rsvpYear} onValueChange={setRsvpYear}>
                        <SelectTrigger id="rsvp-year" className="text-xs h-9 bg-card border-border rounded-xl">
                          <SelectValue placeholder="Select Year of Study" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACADEMIC_YEARS.map((yr) => (
                            <SelectItem key={yr} value={yr} className="text-xs">
                              {yr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Optional Prayer Request / Notes */}
                    <div className="space-y-1">
                      <Label htmlFor="rsvp-notes" className="text-xs font-semibold text-foreground">
                        Prayer Focus or Usher Notes (Optional)
                      </Label>
                      <Input
                        id="rsvp-notes"
                        value={rsvpNotes}
                        onChange={(e) => setRsvpNotes(e.target.value)}
                        placeholder="e.g. Need transport assistance, prayer for exam week..."
                        className="text-xs h-9 bg-card border-border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="text-xs h-9 rounded-xl border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingRsvp}
                      className="text-xs h-9 rounded-xl bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-semibold px-4 shadow-xs"
                    >
                      {isSubmittingRsvp ? "Reserving Pass..." : "Confirm Free RSVP"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
