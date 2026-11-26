"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  UserCheck,
  Music,
  HeartHandshake,
  Flame,
  Video,
  Compass,
  Layers,
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
import { MOCK_TEAMS, MockTeam } from "@/lib/mock-data";
import { toast } from "sonner";

export interface AdminTeam {
  _id: string;
  name: string;
  description: string;
  category?: string;
  leader: {
    _id?: string;
    name: string;
    phoneNumber?: string;
    email?: string;
    role?: string;
  };
  memberCount: number;
  meetingTime: string;
  meetingLocation: string;
  isOpenForJoin: boolean;
  iconName?: string;
  imageUrl?: string;
}

// Map icon string to Lucide component
const getTeamIcon = (name?: string) => {
  const icon = (name || "").toLowerCase();
  if (icon.includes("music") || icon.includes("choir") || icon.includes("worship")) {
    return <Music className="h-4 w-4" />;
  }
  if (icon.includes("flame") || icon.includes("prayer") || icon.includes("intercession")) {
    return <Flame className="h-4 w-4" />;
  }
  if (icon.includes("video") || icon.includes("media") || icon.includes("sound") || icon.includes("tech")) {
    return <Video className="h-4 w-4" />;
  }
  if (icon.includes("heart") || icon.includes("charity") || icon.includes("outreach") || icon.includes("social")) {
    return <HeartHandshake className="h-4 w-4" />;
  }
  if (icon.includes("compass") || icon.includes("evangelical") || icon.includes("freshmen")) {
    return <Compass className="h-4 w-4" />;
  }
  return <Users className="h-4 w-4" />;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = useState<AdminTeam | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [teamToDelete, setTeamToDelete] = useState<AdminTeam | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const normalizeTeams = (rawList: unknown[]): AdminTeam[] => {
    return rawList.map((item) => {
      const t = (item || {}) as Record<string, unknown>;
      const leaderObj = (t.leader || {}) as Record<string, unknown>;
      const meetingDay = typeof t.meetingDay === "string" ? t.meetingDay : "";
      const time = typeof t.time === "string" ? t.time : "";

      let meetingTime = typeof t.meetingTime === "string" ? t.meetingTime : "";
      if (!meetingTime) {
        if (meetingDay && time) {
          meetingTime = `${meetingDay}, ${time}`;
        } else {
          meetingTime = meetingDay || time || "Weekly (TBD)";
        }
      }

      const rawCount = t.memberCount ?? t.members;
      const memberCount =
        typeof rawCount === "number" ? rawCount : parseInt(String(rawCount || "0"), 10) || 0;

      return {
        _id: String(t._id || t.id || `team-${Math.random()}`),
        name: String(t.name || "Fellowship Ministry Team"),
        description: String(t.description || "Active ministry team within AAU 4 Kilo Fellowship."),
        category: typeof t.category === "string" ? t.category : "Ministry",
        leader: {
          _id: typeof leaderObj._id === "string" ? leaderObj._id : undefined,
          name: String(leaderObj.name || "Leader Unassigned"),
          phoneNumber:
            typeof leaderObj.phoneNumber === "string"
              ? leaderObj.phoneNumber
              : typeof leaderObj.phone === "string"
              ? leaderObj.phone
              : "+251900000000",
          email: typeof leaderObj.email === "string" ? leaderObj.email : "team@aau.edu.et",
          role: typeof leaderObj.role === "string" ? leaderObj.role : "Team Leader",
        },
        memberCount,
        meetingTime,
        meetingLocation: String(t.meetingLocation || t.location || "AAU 4 Kilo Campus"),
        isOpenForJoin:
          t.isOpenForJoin !== undefined
            ? Boolean(t.isOpenForJoin)
            : t.isOpen !== undefined
            ? Boolean(t.isOpen)
            : true,
        iconName: typeof t.iconName === "string" ? t.iconName : typeof t.icon === "string" ? t.icon : "Users",
        imageUrl: typeof t.imageUrl === "string" ? t.imageUrl : undefined,
      };
    });
  };

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/teams");
      const raw = res.data;
      const fetched: unknown[] = raw?.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setTeams(normalizeTeams(fetched));
      } else if (isDemo || MOCK_TEAMS.length > 0) {
        setTeams(normalizeTeams(MOCK_TEAMS as unknown[]));
      } else {
        setTeams([]);
      }
    } catch {
      // Graceful fallback to centralized realistic AAU fellowship teams
      setTeams(normalizeTeams(MOCK_TEAMS as unknown[]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleExportCsv = () => {
    if (!teams.length) {
      toast.info("No team records to export");
      return;
    }
    const headers = [
      "Team ID",
      "Team Name",
      "Category",
      "Leader Name",
      "Leader Phone",
      "Leader Email",
      "Active Members",
      "Meeting Schedule",
      "Meeting Location",
      "Join Status",
    ];

    const rows = teams.map((t) => [
      t._id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${(t.category || "Ministry").replace(/"/g, '""')}"`,
      `"${t.leader.name.replace(/"/g, '""')}"`,
      `"${(t.leader.phoneNumber || "").replace(/"/g, '""')}"`,
      `"${(t.leader.email || "").replace(/"/g, '""')}"`,
      t.memberCount,
      `"${t.meetingTime.replace(/"/g, '""')}"`,
      `"${t.meetingLocation.replace(/"/g, '""')}"`,
      t.isOpenForJoin ? "Open" : "Closed",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_teams_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Teams CSV exported successfully");
  };

  const handleToggleJoinStatus = async (team: AdminTeam) => {
    const updatedStatus = !team.isOpenForJoin;
    try {
      await api.patch(`/teams/${team._id}`, { isOpenForJoin: updatedStatus });
    } catch {
      // Offline fallback: toggle locally
    }
    setTeams((prev) =>
      prev.map((t) => (t._id === team._id ? { ...t, isOpenForJoin: updatedStatus } : t))
    );
    if (selectedTeam?._id === team._id) {
      setSelectedTeam((prev) => (prev ? { ...prev, isOpenForJoin: updatedStatus } : null));
    }
    toast.success(
      updatedStatus
        ? `"${team.name}" opened for student membership`
        : `"${team.name}" closed for membership`
    );
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/teams/${teamToDelete._id}`);
    } catch {
      // Continue optimistic removal
    } finally {
      setTeams((prev) => prev.filter((t) => t._id !== teamToDelete._id));
      if (selectedTeam?._id === teamToDelete._id) {
        setIsSheetOpen(false);
        setSelectedTeam(null);
      }
      toast.success(`Team "${teamToDelete.name}" deleted`);
      setTeamToDelete(null);
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalMembers = useMemo(
    () => teams.reduce((acc, t) => acc + (t.memberCount || 0), 0),
    [teams]
  );
  const openTeamsCount = useMemo(
    () => teams.filter((t) => t.isOpenForJoin).length,
    [teams]
  );

  const columns = useMemo<ColumnDef<AdminTeam>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Team Name",
        cell: ({ row }) => {
          const team = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                {getTeamIcon(team.iconName || team.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground text-sm truncate">
                  {team.name}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {team.description}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "leader",
        header: "Leader Name & Phone",
        cell: ({ row }) => {
          const leader = row.original.leader;
          return (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-foreground text-xs truncate">
                {leader.name}
              </span>
              <a
                href={leader.phoneNumber ? `tel:${leader.phoneNumber}` : undefined}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
              >
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">{leader.phoneNumber || "No phone"}</span>
              </a>
            </div>
          );
        },
      },
      {
        accessorKey: "memberCount",
        header: "Active Members",
        cell: ({ row }) => {
          const count = row.original.memberCount;
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 text-foreground border border-border">
              <Users className="h-3 w-3 text-primary" />
              <span>{count} {count === 1 ? "member" : "members"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "meetingTime",
        header: "Weekly Meeting Time",
        cell: ({ row }) => {
          const meetingTime = row.original.meetingTime;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[180px]">{meetingTime}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "meetingLocation",
        header: "Meeting Location",
        cell: ({ row }) => {
          const location = row.original.meetingLocation;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[180px]">{location}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "isOpenForJoin",
        header: "Join Status",
        cell: ({ row }) => {
          const isOpen = row.original.isOpenForJoin;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                isOpen
                  ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpen ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
              {isOpen ? "Open" : "Closed"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const team = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Team Options</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTeam(team);
                    setIsSheetOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <UserCheck className="mr-2 h-3.5 w-3.5 text-primary" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/teams/${team._id}/edit`}
                    className="cursor-pointer flex items-center"
                  >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit Team
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleJoinStatus(team)}
                  className="cursor-pointer"
                >
                  {team.isOpenForJoin ? (
                    <>
                      <XCircle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                      Close Enrollment
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                      Open Enrollment
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer focus:text-destructive"
                  onClick={() => setTeamToDelete(team)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Team
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
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Ministry Teams & Units
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Coordinate 4 Kilo fellowship student ministries, active member rosters, leadership contacts, and weekly campus meeting venues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/teams/new">
            <Button className="h-9 gap-1.5 text-xs font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Teams
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{teams.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active fellowship ministry departments
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Enrolled Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalMembers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Students serving across campus ministries
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Open for Join
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{openTeamsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Currently accepting new student members
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Fellowship Reach
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">100%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              AAU Arat Kilo campus faculties covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={teams}
        searchKey="name"
        searchPlaceholder="Filter ministry teams by name..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No ministry teams matching your search."
      />

      {/* Side Details Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedTeam && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                    {getTeamIcon(selectedTeam.iconName || selectedTeam.name)}
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold">
                      {selectedTeam.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs mt-0.5">
                      {selectedTeam.category || "Campus Ministry Unit"}
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
                      selectedTeam.isOpenForJoin
                        ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {selectedTeam.isOpenForJoin ? "Enrollment Open" : "Enrollment Closed"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedTeam.memberCount} members
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs rounded-full"
                  onClick={() => handleToggleJoinStatus(selectedTeam)}
                >
                  {selectedTeam.isOpenForJoin ? "Close" : "Open"}
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  About Team
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedTeam.description}
                </p>
              </div>

              {/* Meeting Schedule & Campus Venue */}
              <div className="rounded-xl border p-3.5 space-y-3 bg-card">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Meeting Schedule & Venue
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Gathering Time</span>
                    <span className="font-medium text-foreground text-right">
                      {selectedTeam.meetingTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Campus Location</span>
                    <span className="font-medium text-foreground text-right flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      {selectedTeam.meetingLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leader Profile Card */}
              <div className="rounded-xl border p-3.5 space-y-3 bg-card">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Ministry Leader
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{selectedTeam.leader.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Phone</span>
                    <a
                      href={
                        selectedTeam.leader.phoneNumber
                          ? `tel:${selectedTeam.leader.phoneNumber}`
                          : undefined
                      }
                      className="font-medium text-primary hover:underline flex items-center gap-1 font-mono"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      {selectedTeam.leader.phoneNumber || "N/A"}
                    </a>
                  </div>
                  {selectedTeam.leader.email && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Email</span>
                      <a
                        href={`mailto:${selectedTeam.leader.email}`}
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        {selectedTeam.leader.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  asChild
                  className="flex-1 rounded-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link href={`/admin/teams/${selectedTeam._id}/edit`}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit Team
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
        open={!!teamToDelete}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Team</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{teamToDelete?.name}</strong>? This action will remove the team and unlink any active member assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTeamToDelete(null)}
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
              {isDeleting ? "Deleting..." : "Delete Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
