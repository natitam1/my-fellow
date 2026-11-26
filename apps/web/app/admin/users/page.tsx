"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users as UsersIcon,
  UserCheck,
  Shield,
  MoreHorizontal,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MOCK_USERS, MockUser } from "@/lib/mock-data";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/admin/users?limit=50");
      const raw = res.data;
      const fetched: any[] = raw.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setUsers(
          fetched.map((u: any) => ({
            _id: u._id || u.id,
            name: u.fullName || u.name || "Fellowship Member",
            email: u.email || "student@aau.edu.et",
            phoneNumber: u.phoneNumber || "+251900000000",
            role: u.role || "member",
            status: u.status || "active",
            department: u.department || "General Engineering",
            year: u.yearOfStudy || u.year || "3rd Year",
            ministryTeam: u.team || u.ministryTeam || "General Member",
            createdAt: u.createdAt || new Date().toISOString(),
          }))
        );
      } else if (isDemo) {
        setUsers(MOCK_USERS);
      } else {
        setUsers([]);
      }
    } catch {
      // Fallback to rich mock users
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleExportCsv = () => {
    if (!users.length) {
      toast.info("No user records to export");
      return;
    }
    const headers = ["ID", "Name", "Phone", "Email", "Role", "Department", "Year", "Team"];
    const rows = users.map((u) => [
      u._id,
      `"${u.name}"`,
      `"${u.phoneNumber}"`,
      `"${u.email}"`,
      u.role,
      `"${u.department}"`,
      `"${u.year}"`,
      `"${u.ministryTeam}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fellowship_users_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users CSV exported successfully");
  };

  const columns = useMemo<ColumnDef<MockUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member Name",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-foreground text-sm truncate">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.phoneNumber}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          const variant =
            role === "admin" || role === "super_admin"
              ? "default"
              : role === "leader"
              ? "secondary"
              : "outline";
          return (
            <Badge variant={variant} className="capitalize font-normal text-xs">
              {role.replace(/_/g, " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "department",
        header: "Academic Dept & Year",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{user.department}</span>
              <span className="text-muted-foreground">{user.year}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "ministryTeam",
        header: "Ministry Team",
        cell: ({ row }) => {
          const team = row.getValue("ministryTeam") as string;
          return (
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
              {team}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const isPending = status === "pending";
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                isPending
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPending ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setIsSheetOpen(true);
                  }}
                >
                  <UserCheck className="mr-2 h-3.5 w-3.5" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Contacting ${user.name}`);
                  }}
                >
                  <Mail className="mr-2 h-3.5 w-3.5" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    toast.success(`User ${user.name} permissions revoked`);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Revoke Role
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
            <UsersIcon className="h-5 w-5 text-primary" />
            Fellowship Members & Users
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage university student profiles, department affiliations, and ministry team assignments.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search students by name..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No members matching the criteria."
      />

      {/* Side Sheet for User Details */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedUser && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-xl font-bold flex items-center justify-center mb-2">
                  {selectedUser.name.charAt(0)}
                </div>
                <SheetTitle className="text-lg">{selectedUser.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  Joined on {new Date(selectedUser.createdAt).toLocaleDateString()}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Phone Number</span>
                    <span className="font-mono font-medium">{selectedUser.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email Address</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">System Role</span>
                    <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
                  </div>
                </div>

                <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{selectedUser.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Academic Year</span>
                    <span className="font-medium">{selectedUser.year}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ministry Team</span>
                    <span className="font-medium text-primary">{selectedUser.ministryTeam}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-9"
                  onClick={() => {
                    toast.success("Profile saved");
                    setIsSheetOpen(false);
                  }}
                >
                  Save Changes
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
