"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  Plus,
  MoreHorizontal,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_PROGRAMS, MockProgram } from "@/lib/mock-data";
import { toast } from "sonner";

export interface AdminProgram {
  _id: string;
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  targetAudience: string;
  description: string;
  isActive: boolean;
  category?: string;
  image?: string;
}

const DAY_ORDER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProgram, setSelectedProgram] = useState<AdminProgram | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [programToDelete, setProgramToDelete] = useState<AdminProgram | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const normalizePrograms = (rawList: unknown[]): AdminProgram[] => {
    return rawList.map((item) => {
      const p = (item || {}) as Record<string, unknown>;

      let startTime = typeof p.startTime === "string" ? p.startTime : "";
      let endTime = typeof p.endTime === "string" ? p.endTime : "";

      if (!startTime && typeof p.time === "string") {
        if (p.time.includes("-")) {
          const parts = p.time.split("-");
          startTime = parts[0]?.trim() || "";
          endTime = parts[1]?.trim() || "";
        } else {
          startTime = p.time.trim();
        }
      }

      const dayOfWeek =
        typeof p.dayOfWeek === "string"
          ? p.dayOfWeek
          : typeof p.day === "string"
          ? p.day
          : "Friday";

      const targetAudience =
        typeof p.targetAudience === "string" && p.targetAudience.trim()
          ? p.targetAudience
          : typeof p.category === "string"
          ? `${p.category} Attendees`
          : "All Students & Faculty";

      return {
        _id: String(p._id || p.id || `program-${Math.random()}`),
        title: String(p.title || "Fellowship Program"),
        dayOfWeek,
        startTime: startTime || "TBD",
        endTime: endTime || "",
        location: String(p.location || "AAU 4 Kilo Campus"),
        targetAudience,
        description: String(
          p.description || "Weekly spiritual gathering and fellowship program for university students."
        ),
        isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
        category: typeof p.category === "string" ? p.category : "Fellowship",
        image: typeof p.image === "string" ? p.image : undefined,
      };
    });
  };

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/programs");
      const raw = res.data;
      const fetched: unknown[] = raw?.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setPrograms(normalizePrograms(fetched));
      } else if (isDemo || MOCK_PROGRAMS.length > 0) {
        setPrograms(normalizePrograms(MOCK_PROGRAMS as unknown[]));
      } else {
        setPrograms([]);
      }
    } catch {
      // Graceful fallback to centralized realistic AAU fellowship weekly programs
      setPrograms(normalizePrograms(MOCK_PROGRAMS as unknown[]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleExportCsv = () => {
    if (!programs.length) {
      toast.info("No program records to export");
      return;
    }
    const headers = [
      "Program ID",
      "Program Title",
      "Category",
      "Day of Week",
      "Start Time",
      "End Time",
      "Campus Location",
      "Target Audience",
      "Status",
      "Description",
    ];

    const rows = programs.map((p) => [
      p._id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${(p.category || "Fellowship").replace(/"/g, '""')}"`,
      `"${p.dayOfWeek.replace(/"/g, '""')}"`,
      `"${p.startTime.replace(/"/g, '""')}"`,
      `"${p.endTime.replace(/"/g, '""')}"`,
      `"${p.location.replace(/"/g, '""')}"`,
      `"${p.targetAudience.replace(/"/g, '""')}"`,
      p.isActive ? "Active" : "Inactive",
      `"${p.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_programs_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Programs CSV exported successfully");
  };

  const handleToggleActive = async (program: AdminProgram) => {
    const updatedStatus = !program.isActive;
    try {
      await api.patch(`/programs/${program._id}`, { isActive: updatedStatus });
    } catch {
      // Offline fallback: toggle locally
    }
    setPrograms((prev) =>
      prev.map((p) => (p._id === program._id ? { ...p, isActive: updatedStatus } : p))
    );
    if (selectedProgram?._id === program._id) {
      setSelectedProgram((prev) => (prev ? { ...prev, isActive: updatedStatus } : null));
    }
    toast.success(
      updatedStatus
        ? `"${program.title}" marked as active`
        : `"${program.title}" marked as inactive`
    );
  };

  const confirmDelete = async () => {
    if (!programToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/programs/${programToDelete._id}`);
    } catch {
      // Continue optimistic removal
    } finally {
      setPrograms((prev) => prev.filter((p) => p._id !== programToDelete._id));
      if (selectedProgram?._id === programToDelete._id) {
        setIsSheetOpen(false);
        setSelectedProgram(null);
      }
      toast.success(`Program "${programToDelete.title}" deleted`);
      setProgramToDelete(null);
      setIsDeleting(false);
    }
  };

  // Metrics
  const activeProgramsCount = useMemo(
    () => programs.filter((p) => p.isActive).length,
    [programs]
  );
  const uniqueLocationsCount = useMemo(
    () => new Set(programs.map((p) => p.location.trim())).size,
    [programs]
  );

  const columns = useMemo<ColumnDef<AdminProgram>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Program Title",
        cell: ({ row }) => {
          const program = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground text-sm truncate">
                  {program.title}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {program.description}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "dayOfWeek",
        header: "Day of Week",
        sortingFn: (rowA, rowB) => {
          const dayA = DAY_ORDER[rowA.original.dayOfWeek] || 99;
          const dayB = DAY_ORDER[rowB.original.dayOfWeek] || 99;
          return dayA - dayB;
        },
        cell: ({ row }) => {
          const day = row.original.dayOfWeek;
          return (
            <Badge
              variant="secondary"
              className="font-medium text-xs rounded-full px-2.5 py-0.5 bg-muted text-foreground border border-border"
            >
              {day}
            </Badge>
          );
        },
      },
      {
        id: "timeRange",
        header: "Start & End Time",
        cell: ({ row }) => {
          const p = row.original;
          const display = p.endTime ? `${p.startTime} – ${p.endTime}` : p.startTime;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{display}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "location",
        header: "Campus Location",
        cell: ({ row }) => {
          const location = row.original.location;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[200px]">{location}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "targetAudience",
        header: "Target Audience",
        cell: ({ row }) => {
          const audience = row.original.targetAudience;
          return (
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md truncate max-w-[180px] inline-block">
              {audience}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Active Status",
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                isActive
                  ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const program = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Program Options</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProgram(program);
                    setIsSheetOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Calendar className="mr-2 h-3.5 w-3.5 text-primary" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/programs/${program._id}/edit`}
                    className="cursor-pointer flex items-center"
                  >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit Program
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleActive(program)}
                  className="cursor-pointer"
                >
                  {program.isActive ? (
                    <>
                      <XCircle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer focus:text-destructive"
                  onClick={() => setProgramToDelete(program)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Program
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Fellowship Programs & Gatherings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Schedule and administer regular weekly campus programs: prayer vigils, Friday congregational worship, Bible studies, and outreach days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/programs/new">
            <Button className="h-9 gap-1.5 text-xs font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Plus className="h-4 w-4" />
              Create Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Programs
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{programs.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Curated recurring campus schedules
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Programs
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeProgramsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Live programs ongoing this semester
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Campus Venues
            </CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueLocationsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Halls, amphitheaters & prayer sanctuaries
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Weekly Rhythm
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">7 Days</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Continuous student fellowship life
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={programs}
        searchKey="title"
        searchPlaceholder="Filter programs by title..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No fellowship programs matching your criteria."
      />

      {/* Side Details Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedProgram && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold">
                      {selectedProgram.title}
                    </SheetTitle>
                    <SheetDescription className="text-xs mt-0.5">
                      {selectedProgram.category || "Weekly Fellowship Program"}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Status and Action banner */}
              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      selectedProgram.isActive
                        ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {selectedProgram.isActive ? "Active Schedule" : "Currently Inactive"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedProgram.dayOfWeek}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs rounded-full"
                  onClick={() => handleToggleActive(selectedProgram)}
                >
                  {selectedProgram.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Program Overview
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedProgram.description}
                </p>
              </div>

              {/* Timing & Venue */}
              <div className="rounded-xl border p-3.5 space-y-3 bg-card">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Time & Campus Venue
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Day of Week</span>
                    <span className="font-medium text-foreground">{selectedProgram.dayOfWeek}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Start Time</span>
                    <span className="font-mono font-medium text-foreground">
                      {selectedProgram.startTime}
                    </span>
                  </div>
                  {selectedProgram.endTime && (
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">End Time</span>
                      <span className="font-mono font-medium text-foreground">
                        {selectedProgram.endTime}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Campus Location</span>
                    <span className="font-medium text-foreground text-right flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      {selectedProgram.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audience & Scope */}
              <div className="rounded-xl border p-3.5 space-y-3 bg-card">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Audience & Ministry Context
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Target Audience</span>
                    <span className="font-medium text-foreground">
                      {selectedProgram.targetAudience}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Institution</span>
                    <span className="font-medium text-foreground">AAU Arat Kilo Campus</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  asChild
                  className="flex-1 rounded-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link href={`/admin/programs/${selectedProgram._id}/edit`}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit Program
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full text-xs h-9"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!programToDelete}
        onOpenChange={(open) => !open && setProgramToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Program</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{programToDelete?.title}</strong>? This will remove this scheduled gathering from student calendars.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProgramToDelete(null)}
              className="text-xs rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="text-xs rounded-full"
            >
              {isDeleting ? "Deleting..." : "Delete Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
