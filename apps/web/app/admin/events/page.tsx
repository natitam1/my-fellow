"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Users,
  Eye,
  EyeOff,
  MoreHorizontal,
  Download,
  Trash2,
  ExternalLink,
  Edit,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MOCK_EVENTS, MockEvent } from "@/lib/mock-data";

interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  category: "worship" | "conference" | "prayer" | "outreach" | "training";
  date: string;
  time: string;
  location: string;
  speaker?: string;
  registeredCount: number;
  maxAttendees?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  bannerUrl?: string;
  isPublished?: boolean;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/events?scope=admin");
      const raw = res.data;
      const fetched: any[] = raw.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setEvents(
          fetched.map((e: any) => ({
            _id: e._id || e.id,
            title: e.title || "Fellowship Gathering",
            description: e.description || e.shortDescription || "",
            category: e.category || "worship",
            date: e.startDate ? format(new Date(e.startDate), "yyyy-MM-dd") : "2026-11-20",
            time: e.startDate ? format(new Date(e.startDate), "hh:mm a") : "5:30 PM",
            location: e.location || "Main Fellowship Hall",
            speaker: e.speaker,
            registeredCount: e.registrationsCount ?? 120,
            maxAttendees: e.registrationLimit ?? 300,
            status: e.isPublished === false ? "cancelled" : "upcoming",
            isPublished: e.isPublished !== false,
          }))
        );
      } else if (isDemo) {
        setEvents(
          MOCK_EVENTS.map((e) => ({
            ...e,
            isPublished: true,
          }))
        );
      } else {
        setEvents([]);
      }
    } catch {
      setEvents(
        MOCK_EVENTS.map((e) => ({
          ...e,
          isPublished: true,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleTogglePublish = async (id: string, currentStatus?: boolean) => {
    try {
      await api.patch(`/events/${id}/publish`, {
        isPublished: !currentStatus,
      });
      toast.success(!currentStatus ? "Event published" : "Event unpublished");
      fetchEvents();
    } catch {
      // Optimistic update for demo mode
      setEvents((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, isPublished: !currentStatus } : e
        )
      );
      toast.success(!currentStatus ? "Event published (demo mode)" : "Event unpublished (demo mode)");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success("Event deleted (demo mode)");
    }
  };

  const handleExportCsv = () => {
    if (!events.length) {
      toast.info("No events to export");
      return;
    }
    const headers = ["ID", "Title", "Category", "Date", "Time", "Location", "Registrations", "Max Attendees", "Status"];
    const rows = events.map((e) => [
      e._id,
      `"${e.title}"`,
      e.category,
      e.date,
      `"${e.time}"`,
      `"${e.location}"`,
      e.registeredCount,
      e.maxAttendees || "N/A",
      e.isPublished ? "Published" : "Draft",
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `fellowship_events_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Events CSV exported");
  };

  const columns = useMemo<ColumnDef<AdminEvent>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Event Details",
        cell: ({ row }) => {
          const evt = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0 border border-primary/20">
                <span className="text-[10px] uppercase font-bold tracking-tight">
                  {new Date(evt.date).toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-xs font-bold leading-none">
                  {new Date(evt.date).getDate() || 20}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(evt);
                    setIsSheetOpen(true);
                  }}
                >
                  {evt.title}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {evt.location}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const cat = row.getValue("category") as string;
          return (
            <Badge variant="outline" className="capitalize text-xs font-normal">
              {cat}
            </Badge>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date & Schedule",
        cell: ({ row }) => {
          const evt = row.original;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{evt.date}</span>
              <span className="text-muted-foreground">{evt.time}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "registeredCount",
        header: "Attendance / Capacity",
        cell: ({ row }) => {
          const evt = row.original;
          const max = evt.maxAttendees || 300;
          const pct = Math.min(100, Math.round((evt.registeredCount / max) * 100));
          return (
            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-xs font-medium">
                <span>{evt.registeredCount}</span>
                <span className="text-muted-foreground">/ {max}</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        },
      },
      {
        accessorKey: "isPublished",
        header: "Visibility",
        cell: ({ row }) => {
          const isPub = row.getValue("isPublished") as boolean;
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                isPub
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPub ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
              {isPub ? "Published" : "Draft"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const evt = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuLabel>Event Management</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedEvent(evt);
                    setIsSheetOpen(true);
                  }}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleTogglePublish(evt._id, evt.isPublished)}
                >
                  {evt.isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                      Unpublish Event
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      Publish Event
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/events/${evt._id}/edit`}>
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit Event
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(evt._id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Fellowship Gatherings & Events
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Coordinate weekly services, campus revivals, leadership workshops, and outreach vigils.
          </p>
        </div>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-medium h-9 gap-1.5">
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={events}
        searchKey="title"
        searchPlaceholder="Filter events by title..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No events found."
      />

      {/* Side Sheet for Inspection */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedEvent && (
            <div className="space-y-5 pt-4">
              <SheetHeader>
                <Badge variant="outline" className="w-fit uppercase text-[10px]">
                  {selectedEvent.category}
                </Badge>
                <SheetTitle className="text-lg leading-snug">
                  {selectedEvent.title}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {selectedEvent.date} at {selectedEvent.time}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                <div className="rounded-lg border p-3.5 space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-foreground">{selectedEvent.location}</span>
                  </div>
                  {selectedEvent.speaker && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Guest Speaker</span>
                      <span className="font-medium text-foreground">{selectedEvent.speaker}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="font-semibold text-primary">{selectedEvent.registeredCount} students</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-muted-foreground font-medium">Event Description</span>
                  <p className="p-3 rounded-lg border bg-muted/10 leading-relaxed text-foreground">
                    {selectedEvent.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-9"
                  asChild
                >
                  <Link href={`/admin/events/${selectedEvent._id}/edit`}>
                    Edit Event Details
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-xs h-9"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
