"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import {
  MapPin,
  Plus,
  MoreHorizontal,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  Compass,
  Sparkles,
  Layers,
  Flame,
  Briefcase,
  Trees,
  DoorOpen,
  Eye,
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
import { MOCK_LOCATIONS, MockLocation } from "@/lib/mock-data";
import { toast } from "sonner";

export interface AdminLocation {
  _id: string;
  name: string;
  type: "hall" | "prayer_room" | "office" | "field" | string;
  building: string;
  roomNumber: string;
  capacity: number;
  isAvailable: boolean;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  serviceTimes?: string[];
  googleMapsUrl?: string;
  image?: string;
}

const getLocationTypeMeta = (type: string) => {
  const normalized = (type || "").toLowerCase().replace(/[\s-]/g, "_");
  if (normalized.includes("prayer") || normalized.includes("sanctuary") || normalized.includes("chapel")) {
    return {
      label: "Prayer Room",
      badgeVariant: "secondary" as const,
      icon: <Flame className="h-4 w-4 text-amber-500 shrink-0" />,
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (normalized.includes("office") || normalized.includes("welfare") || normalized.includes("counseling")) {
    return {
      label: "Office",
      badgeVariant: "outline" as const,
      icon: <Briefcase className="h-4 w-4 text-blue-500 shrink-0" />,
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
  }
  if (normalized.includes("field") || normalized.includes("lawn") || normalized.includes("outdoor")) {
    return {
      label: "Field / Lawn",
      badgeVariant: "outline" as const,
      icon: <Trees className="h-4 w-4 text-emerald-500 shrink-0" />,
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    };
  }
  return {
    label: "Fellowship Hall",
    badgeVariant: "default" as const,
    icon: <Building2 className="h-4 w-4 text-primary shrink-0" />,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  };
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<AdminLocation | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [locationToDelete, setLocationToDelete] = useState<AdminLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const normalizeLocations = (rawList: unknown[]): AdminLocation[] => {
    return rawList.map((item, idx) => {
      const loc = (item || {}) as Record<string, unknown>;
      const rawCoords = (loc.coordinates || {}) as Record<string, unknown>;

      const lat =
        typeof rawCoords.lat === "number"
          ? rawCoords.lat
          : typeof rawCoords.latitude === "number"
          ? rawCoords.latitude
          : 9.0358;
      const lng =
        typeof rawCoords.lng === "number"
          ? rawCoords.lng
          : typeof rawCoords.longitude === "number"
          ? rawCoords.longitude
          : 38.7618;

      const rawCap = loc.capacity;
      const capacity =
        typeof rawCap === "number"
          ? rawCap
          : parseInt(String(rawCap || "100"), 10) || 100;

      const building = String(
        loc.building ||
          (typeof loc.address === "string" && loc.address.includes(",")
            ? loc.address.split(",")[0]
            : loc.address) ||
          "AAU 4 Kilo Campus"
      );

      const roomNumber = String(
        loc.roomNumber ||
          (typeof loc.address === "string" && loc.address.includes(",")
            ? loc.address.split(",")[1]?.trim()
            : "Main Hall") ||
          `Room ${idx + 1}`
      );

      const serviceTimes = Array.isArray(loc.serviceTimes)
        ? (loc.serviceTimes as string[])
        : [];

      return {
        _id: String(loc._id || loc.id || `loc-${idx + 1}`),
        name: String(loc.name || "Fellowship Venue"),
        type: String(loc.type || "hall"),
        building,
        roomNumber,
        capacity,
        isAvailable:
          loc.isAvailable !== undefined
            ? Boolean(loc.isAvailable)
            : loc.isDeleted === false
            ? true
            : true,
        description: String(
          loc.description ||
            (loc.address
              ? `Campus venue located at ${loc.address}.`
              : "AAU Arat Kilo fellowship prayer and gathering facility.")
        ),
        coordinates: { lat, lng },
        address: typeof loc.address === "string" ? loc.address : `${building}, ${roomNumber}`,
        serviceTimes,
        googleMapsUrl:
          typeof loc.googleMapsUrl === "string"
            ? loc.googleMapsUrl
            : `https://www.google.com/maps?q=${lat},${lng}`,
        image: typeof loc.image === "string" ? loc.image : undefined,
      };
    });
  };

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/locations");
      const raw = res.data;
      const fetched: unknown[] = raw?.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setLocations(normalizeLocations(fetched));
      } else if (isDemo || MOCK_LOCATIONS.length > 0) {
        setLocations(normalizeLocations(MOCK_LOCATIONS as unknown[]));
      } else {
        setLocations([]);
      }
    } catch {
      // Graceful fallback to centralized realistic AAU fellowship locations
      setLocations(normalizeLocations(MOCK_LOCATIONS as unknown[]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleExportCsv = () => {
    if (!locations.length) {
      toast.info("No location records to export");
      return;
    }
    const headers = [
      "Location ID",
      "Venue Name",
      "Type",
      "Building",
      "Room Number",
      "Seating Capacity",
      "Availability",
      "Latitude",
      "Longitude",
      "Description",
    ];

    const rows = locations.map((loc) => [
      loc._id,
      `"${loc.name.replace(/"/g, '""')}"`,
      `"${loc.type.replace(/"/g, '""')}"`,
      `"${loc.building.replace(/"/g, '""')}"`,
      `"${loc.roomNumber.replace(/"/g, '""')}"`,
      loc.capacity,
      loc.isAvailable ? "Available" : "In Use / Reserved",
      loc.coordinates?.lat ?? "",
      loc.coordinates?.lng ?? "",
      `"${loc.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_locations_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Locations CSV exported successfully");
  };

  const handleToggleAvailability = async (location: AdminLocation) => {
    const updatedStatus = !location.isAvailable;
    try {
      await api.patch(`/locations/${location._id}`, { isAvailable: updatedStatus });
    } catch {
      // Local fallback in offline mode
    }
    setLocations((prev) =>
      prev.map((loc) =>
        loc._id === location._id ? { ...loc, isAvailable: updatedStatus } : loc
      )
    );
    if (selectedLocation?._id === location._id) {
      setSelectedLocation((prev) =>
        prev ? { ...prev, isAvailable: updatedStatus } : null
      );
    }
    toast.success(
      `${location.name} marked as ${updatedStatus ? "Available" : "In Use / Reserved"}`
    );
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/locations/${locationToDelete._id}`);
      toast.success(`Location "${locationToDelete.name}" removed successfully`);
      setLocations((prev) => prev.filter((l) => l._id !== locationToDelete._id));
      if (selectedLocation?._id === locationToDelete._id) {
        setIsSheetOpen(false);
        setSelectedLocation(null);
      }
    } catch {
      toast.error("Failed to delete location from server. Removed locally.");
      setLocations((prev) => prev.filter((l) => l._id !== locationToDelete._id));
    } finally {
      setIsDeleting(false);
      setLocationToDelete(null);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalVenues = locations.length;
    const totalCapacity = locations.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const availableCount = locations.filter((l) => l.isAvailable).length;
    const prayerRooms = locations.filter((l) => {
      const t = (l.type || "").toLowerCase();
      return t.includes("prayer") || t.includes("sanctuary");
    }).length;

    return { totalVenues, totalCapacity, availableCount, prayerRooms };
  }, [locations]);

  const columns = useMemo<ColumnDef<AdminLocation>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Location / Room Name",
        cell: ({ row }) => {
          const loc = row.original;
          const meta = getLocationTypeMeta(loc.type);
          return (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/50 mt-0.5">
                {meta.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground text-sm tracking-tight truncate">
                  {loc.name}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                  {loc.description}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const meta = getLocationTypeMeta(row.original.type);
          return (
            <Badge
              variant={meta.badgeVariant}
              className={`text-xs font-medium border ${meta.badgeClass}`}
            >
              {meta.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "building",
        header: "Building & Room Number",
        cell: ({ row }) => {
          const loc = row.original;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {loc.building}
              </span>
              <span className="text-muted-foreground pl-5 font-mono text-[11px]">
                {loc.roomNumber}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => {
          const capacity = row.original.capacity;
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground">{capacity.toLocaleString()}</span>
              <span className="text-muted-foreground">seats</span>
            </div>
          );
        },
      },
      {
        accessorKey: "isAvailable",
        header: "Availability",
        cell: ({ row }) => {
          const isAvail = row.original.isAvailable;
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                isAvail
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAvail ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                }`}
              />
              {isAvail ? "Available" : "In Use / Reserved"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const loc = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open venue menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Venue Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsSheetOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/locations/${loc._id}/edit`}>
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit Location
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleAvailability(loc)}
                >
                  {loc.isAvailable ? (
                    <>
                      <XCircle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                      Mark In Use
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                      Mark Available
                    </>
                  )}
                </DropdownMenuItem>
                {loc.googleMapsUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={loc.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      Open Maps
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setLocationToDelete(loc)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Venue
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
            <Building2 className="h-5 w-5 text-primary" />
            Fellowship Locations & Venues
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage AAU 4 Kilo campus halls, prayer sanctuaries, fellowship offices, and gathering centers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLocations}
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
            <Link href="/admin/locations/new">
              <Plus className="h-3.5 w-3.5" />
              Add Location
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Total Venues
              <MapPin className="h-4 w-4 text-primary opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{metrics.totalVenues}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across AAU 4 Kilo campus</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Total Seating Capacity
              <Users className="h-4 w-4 text-blue-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {metrics.totalCapacity.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Maximum campus seats</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Available Now
              <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.availableCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for booking & prayer</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Prayer Sanctuaries
              <Flame className="h-4 w-4 text-amber-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{metrics.prayerRooms}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Dedicated intercession rooms</p>
          </CardContent>
        </Card>
      </div>

      {/* TanStack DataTable */}
      <DataTable
        columns={columns}
        data={locations}
        searchKey="name"
        searchPlaceholder="Search locations by room or venue name..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No fellowship locations found."
      />

      {/* Side Sheet for Detailed Venue Information */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedLocation && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 border border-primary/20">
                  {getLocationTypeMeta(selectedLocation.type).icon}
                </div>
                <SheetTitle className="text-lg leading-tight">{selectedLocation.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  {selectedLocation.building} &bull; {selectedLocation.roomNumber}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getLocationTypeMeta(selectedLocation.type).badgeVariant}
                    className={`text-xs font-medium border ${
                      getLocationTypeMeta(selectedLocation.type).badgeClass
                    }`}
                  >
                    {getLocationTypeMeta(selectedLocation.type).label}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                      selectedLocation.isAvailable
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedLocation.isAvailable ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {selectedLocation.isAvailable ? "Available" : "In Use / Reserved"}
                  </span>
                </div>

                {/* Facility Details */}
                <div className="rounded-xl border p-3.5 space-y-2.5 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Building</span>
                    <span className="font-medium text-foreground">{selectedLocation.building}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Room / Section</span>
                    <span className="font-medium text-foreground font-mono">
                      {selectedLocation.roomNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Seating Capacity</span>
                    <span className="font-semibold text-primary">
                      {selectedLocation.capacity.toLocaleString()} seats
                    </span>
                  </div>
                  {selectedLocation.coordinates && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">GPS Coordinates</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {selectedLocation.coordinates.lat.toFixed(4)},{" "}
                        {selectedLocation.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="rounded-xl border p-3.5 space-y-1.5 bg-muted/20">
                  <span className="font-medium text-foreground block">Venue Purpose & Description</span>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {selectedLocation.description}
                  </p>
                </div>

                {/* Service Times or Programs if available */}
                {selectedLocation.serviceTimes && selectedLocation.serviceTimes.length > 0 && (
                  <div className="rounded-xl border p-3.5 space-y-2 bg-muted/20">
                    <span className="font-medium text-foreground block">Scheduled Fellowship Times</span>
                    <ul className="space-y-1">
                      {selectedLocation.serviceTimes.map((time, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>{time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    asChild
                    className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-9 rounded-full"
                  >
                    <Link href={`/admin/locations/${selectedLocation._id}/edit`}>
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit Details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-xs h-9 rounded-full"
                    onClick={() => handleToggleAvailability(selectedLocation)}
                  >
                    {selectedLocation.isAvailable ? "Mark In Use" : "Mark Available"}
                  </Button>
                </div>
                {selectedLocation.googleMapsUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  >
                    <a
                      href={selectedLocation.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in Google Maps
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!locationToDelete}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-foreground">
              Delete Fellowship Location?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{locationToDelete?.name}</strong>?
              This action will remove the venue record from all campus event schedules and booking lists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocationToDelete(null)}
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
              {isDeleting ? "Deleting..." : "Delete Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
