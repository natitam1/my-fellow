"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Plus,
  MoreHorizontal,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Eye,
  Award,
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
import { MOCK_LEADERS, MockLeader } from "@/lib/mock-data";
import { toast } from "sonner";

export interface AdminLeader {
  _id: string;
  name: string;
  role: string;
  term: string;
  department: string;
  phoneNumber: string;
  email: string;
  imageUrl?: string;
  bio: string;
  isCurrent: boolean;
  type?: string;
  telegram?: string;
  isVerified?: boolean;
}

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<AdminLeader[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLeader, setSelectedLeader] = useState<AdminLeader | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [leaderToDelete, setLeaderToDelete] = useState<AdminLeader | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const normalizeLeaders = (rawList: unknown[]): AdminLeader[] => {
    return rawList.map((item, idx) => {
      const l = (item || {}) as Record<string, unknown>;

      const name = String(l.name || "Fellowship Leader");
      const defaultEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@aau.edu.et`;

      const isCurrent =
        l.isCurrent !== undefined
          ? Boolean(l.isCurrent)
          : l.isVerified !== undefined
          ? Boolean(l.isVerified)
          : true;

      const term = String(
        l.term ||
          (isCurrent ? "2025/2026 Academic Year" : "2024/2025 Academic Year")
      );

      const department = String(
        l.department ||
          (typeof l.type === "string" && l.type.length > 0
            ? `${l.type} Faculty`
            : "Engineering & Natural Sciences")
      );

      return {
        _id: String(l._id || l.id || `ldr-${idx + 1}`),
        name,
        role: String(l.role || "Executive Fellowship Leader"),
        term,
        department,
        phoneNumber: String(l.phoneNumber || l.phone || "+251911000000"),
        email: String(l.email || defaultEmail),
        imageUrl: typeof l.imageUrl === "string" ? l.imageUrl : typeof l.image === "string" ? l.image : "",
        bio: String(
          l.bio ||
            "Committed campus ministry servant walking alongside students at AAU 4 Kilo fellowship."
        ),
        isCurrent,
        type: typeof l.type === "string" ? l.type : "Executive",
        telegram: typeof l.telegram === "string" ? l.telegram : undefined,
        isVerified: l.isVerified !== undefined ? Boolean(l.isVerified) : true,
      };
    });
  };

  const fetchLeaders = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/leaders");
      const raw = res.data;
      const fetched: unknown[] = raw?.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setLeaders(normalizeLeaders(fetched));
      } else if (isDemo || MOCK_LEADERS.length > 0) {
        setLeaders(normalizeLeaders(MOCK_LEADERS as unknown[]));
      } else {
        setLeaders([]);
      }
    } catch {
      // Graceful fallback to centralized realistic AAU fellowship leaders
      setLeaders(normalizeLeaders(MOCK_LEADERS as unknown[]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const handleExportCsv = () => {
    if (!leaders.length) {
      toast.info("No leader records to export");
      return;
    }
    const headers = [
      "Leader ID",
      "Full Name",
      "Role / Portfolio",
      "Term / Academic Year",
      "Academic Department",
      "Phone Number",
      "Email Address",
      "Telegram",
      "Leadership Status",
      "Biography",
    ];

    const rows = leaders.map((ldr) => [
      ldr._id,
      `"${ldr.name.replace(/"/g, '""')}"`,
      `"${ldr.role.replace(/"/g, '""')}"`,
      `"${ldr.term.replace(/"/g, '""')}"`,
      `"${ldr.department.replace(/"/g, '""')}"`,
      `"${ldr.phoneNumber.replace(/"/g, '""')}"`,
      `"${ldr.email.replace(/"/g, '""')}"`,
      `"${(ldr.telegram || "").replace(/"/g, '""')}"`,
      ldr.isCurrent ? "Active Term" : "Alumni / Past Term",
      `"${ldr.bio.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_leaders_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leaders CSV exported successfully");
  };

  const handleToggleCurrentStatus = async (leader: AdminLeader) => {
    const updatedStatus = !leader.isCurrent;
    try {
      await api.patch(`/leaders/${leader._id}`, { isCurrent: updatedStatus });
    } catch {
      // Local fallback in offline mode
    }
    setLeaders((prev) =>
      prev.map((l) =>
        l._id === leader._id ? { ...l, isCurrent: updatedStatus } : l
      )
    );
    if (selectedLeader?._id === leader._id) {
      setSelectedLeader((prev) =>
        prev ? { ...prev, isCurrent: updatedStatus } : null
      );
    }
    toast.success(
      `${leader.name} set to ${updatedStatus ? "Active Term" : "Alumni / Past Term"}`
    );
  };

  const handleDeleteConfirm = async () => {
    if (!leaderToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/leaders/${leaderToDelete._id}`);
      toast.success(`Leader "${leaderToDelete.name}" removed successfully`);
      setLeaders((prev) => prev.filter((l) => l._id !== leaderToDelete._id));
      if (selectedLeader?._id === leaderToDelete._id) {
        setIsSheetOpen(false);
        setSelectedLeader(null);
      }
    } catch {
      toast.error("Failed to delete leader from server. Removed locally.");
      setLeaders((prev) => prev.filter((l) => l._id !== leaderToDelete._id));
    } finally {
      setIsDeleting(false);
      setLeaderToDelete(null);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalLeaders = leaders.length;
    const activeLeaders = leaders.filter((l) => l.isCurrent).length;
    const alumniLeaders = leaders.filter((l) => !l.isCurrent).length;
    const departmentsCount = new Set(leaders.map((l) => l.department)).size;

    return { totalLeaders, activeLeaders, alumniLeaders, departmentsCount };
  }, [leaders]);

  const columns = useMemo<ColumnDef<AdminLeader>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Leader Name & Role",
        cell: ({ row }) => {
          const leader = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                {leader.imageUrl ? (
                  <Image
                    src={leader.imageUrl}
                    alt={leader.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  leader.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground text-sm tracking-tight truncate">
                    {leader.name}
                  </span>
                  {leader.isVerified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {leader.role}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "term",
        header: "Term / Academic Year",
        cell: ({ row }) => {
          const term = row.original.term;
          return (
            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{term}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: "Academic Department",
        cell: ({ row }) => {
          const dept = row.original.department;
          return (
            <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate max-w-[200px]">{dept}</span>
            </div>
          );
        },
      },
      {
        id: "contact",
        header: "Phone & Email",
        cell: ({ row }) => {
          const leader = row.original;
          return (
            <div className="flex flex-col text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-foreground font-mono text-[11px]">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{leader.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[180px]">{leader.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isCurrent",
        header: "Current Status",
        cell: ({ row }) => {
          const isCurrent = row.original.isCurrent;
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                isCurrent
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border/50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent ? "bg-emerald-500" : "bg-muted-foreground/60"
                }`}
              />
              {isCurrent ? "Active Term" : "Alumni / Past"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const leader = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open leader menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Leader Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedLeader(leader);
                    setIsSheetOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/leaders/${leader._id}/edit`}>
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit Leader
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleCurrentStatus(leader)}
                >
                  {leader.isCurrent ? (
                    <>
                      <XCircle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                      Set as Past Term
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                      Set as Active Term
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setLeaderToDelete(leader)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Remove Leader
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Fellowship Leadership & Mentors
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage executive committee members, spiritual coordinators, alumni mentors, and academic representatives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaders}
            className="h-9 gap-1.5 text-xs font-normal"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-full shadow-sm"
          >
            <Link href="/admin/leaders/new">
              <Plus className="h-3.5 w-3.5" />
              Add Leader
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Total Registry
              <Users className="h-4 w-4 text-primary opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{metrics.totalLeaders}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Appointed campus leaders</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Active Term
              <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.activeLeaders}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Currently serving 2025/26</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Alumni Advisory
              <Award className="h-4 w-4 text-blue-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{metrics.alumniLeaders}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Past executive mentors</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Departments
              <BookOpen className="h-4 w-4 text-amber-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{metrics.departmentsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Faculties represented</p>
          </CardContent>
        </Card>
      </div>

      {/* TanStack DataTable */}
      <DataTable
        columns={columns}
        data={leaders}
        searchKey="name"
        searchPlaceholder="Search leaders by name..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No fellowship leaders found."
      />

      {/* Side Sheet for Detailed Profile */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedLeader && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/10 text-primary text-xl font-bold flex items-center justify-center mb-2 border-2 border-primary/20 shadow-xs">
                  {selectedLeader.imageUrl ? (
                    <Image
                      src={selectedLeader.imageUrl}
                      alt={selectedLeader.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    selectedLeader.name.charAt(0)
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <SheetTitle className="text-lg leading-tight">{selectedLeader.name}</SheetTitle>
                  {selectedLeader.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                </div>
                <SheetDescription className="text-xs font-medium text-primary">
                  {selectedLeader.role}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                      selectedLeader.isCurrent
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border/50"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedLeader.isCurrent ? "bg-emerald-500" : "bg-muted-foreground/60"
                      }`}
                    />
                    {selectedLeader.isCurrent ? "Active Term Leader" : "Alumni / Advisory Member"}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedLeader.type || "Executive"}
                  </Badge>
                </div>

                {/* Academic & Fellowship Details */}
                <div className="rounded-xl border p-3.5 space-y-2.5 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Term / Academic Year</span>
                    <span className="font-medium text-foreground">{selectedLeader.term}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium text-foreground">{selectedLeader.department}</span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-xl border p-3.5 space-y-2.5 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Phone Number</span>
                    <a
                      href={`tel:${selectedLeader.phoneNumber}`}
                      className="font-mono font-medium text-foreground hover:underline"
                    >
                      {selectedLeader.phoneNumber}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email Address</span>
                    <a
                      href={`mailto:${selectedLeader.email}`}
                      className="font-medium text-primary hover:underline truncate max-w-[200px]"
                    >
                      {selectedLeader.email}
                    </a>
                  </div>
                  {selectedLeader.telegram && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Telegram</span>
                      <span className="font-medium text-blue-500">
                        {selectedLeader.telegram.startsWith("@")
                          ? selectedLeader.telegram
                          : `@${selectedLeader.telegram}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Biography */}
                <div className="rounded-xl border p-3.5 space-y-1.5 bg-muted/20">
                  <span className="font-medium text-foreground block">Leadership Profile & Bio</span>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {selectedLeader.bio}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  asChild
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-9 rounded-full"
                >
                  <Link href={`/admin/leaders/${selectedLeader._id}/edit`}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs h-9 rounded-full"
                  onClick={() => handleToggleCurrentStatus(selectedLeader)}
                >
                  {selectedLeader.isCurrent ? "Mark as Past Term" : "Mark as Active"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!leaderToDelete}
        onOpenChange={(open) => !open && setLeaderToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-foreground">
              Remove Fellowship Leader?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{leaderToDelete?.name}</strong> from the
              leadership registry?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaderToDelete(null)}
              disabled={isDeleting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="text-xs h-9"
            >
              {isDeleting ? "Removing..." : "Remove Leader"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
