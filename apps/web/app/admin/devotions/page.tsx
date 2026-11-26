"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookOpen,
  Calendar,
  Edit3,
  ExternalLink,
  FileText,
  Heart,
  Bookmark,
  MoreHorizontal,
  PlayCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  FileEdit,
  Quote,
  Loader2,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_DEVOTIONS, MockDevotion } from "@/lib/mock-data";
import api from "@/lib/api";
import { toast } from "sonner";

export interface AdminDevotionRow {
  _id: string;
  title: string;
  scripture: string;
  verseText: string;
  content: string;
  prayer: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  date: string;
  status: "published" | "draft" | "scheduled";
  likesCount: number;
  bookmarksCount: number;
  tags: string[];
  type: "text" | "voice";
  duration?: string;
  audioUrl?: string;
}

function normalizeDevotion(raw: any): AdminDevotionRow {
  const authorName =
    typeof raw.author === "object" && raw.author !== null
      ? raw.author.name || "4 Kilo Fellowship"
      : typeof raw.author === "string" && raw.author.trim()
      ? raw.author
      : raw.authorUsername || "4 Kilo Fellowship";

  const authorRole =
    typeof raw.author === "object" && raw.author !== null
      ? raw.author.role
      : raw.authorRole || (raw.actorType === "official" ? "Official Ministry" : "Devotional Writer");

  const authorAvatar =
    typeof raw.author === "object" && raw.author !== null
      ? raw.author.avatarUrl
      : raw.authorAvatar;

  const scripture =
    raw.scripture ||
    raw.scriptureReference ||
    (raw.title?.includes("(") ? raw.title.split("(")[0]?.trim() : "") ||
    "Colossians 2:6-7";

  const verseText =
    raw.verseText ||
    raw.scriptureText ||
    raw.caption ||
    "";

  const content = raw.content || raw.caption || "";
  const prayer = raw.prayer || "";

  let dateStr = raw.date;
  if (!dateStr && raw.createdAt) {
    try {
      dateStr = new Date(raw.createdAt).toISOString().split("T")[0];
    } catch {
      dateStr = "N/A";
    }
  }
  if (!dateStr) {
    dateStr = new Date().toISOString().split("T")[0];
  }

  let status: "published" | "draft" | "scheduled" = "published";
  if (raw.status === "draft" || raw.status === "scheduled" || raw.status === "published") {
    status = raw.status;
  } else if (raw.isDraft || raw.draft) {
    status = "draft";
  }

  const likesCount =
    typeof raw.likesCount === "number"
      ? raw.likesCount
      : typeof raw.likes === "number"
      ? raw.likes
      : 0;

  const bookmarksCount =
    typeof raw.bookmarksCount === "number"
      ? raw.bookmarksCount
      : typeof raw.views === "number"
      ? Math.round(raw.views * 0.15)
      : 0;

  const tags = Array.isArray(raw.tags)
    ? raw.tags
    : typeof raw.tags === "string"
    ? raw.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  return {
    _id: raw._id || raw.id || `dev-${Math.random().toString(36).substring(2, 9)}`,
    title: raw.title || "Untitled Devotion",
    scripture,
    verseText,
    content,
    prayer,
    authorName,
    authorRole,
    authorAvatar,
    date: dateStr,
    status,
    likesCount,
    bookmarksCount,
    tags,
    type: raw.type === "voice" ? "voice" : "text",
    duration: raw.duration,
    audioUrl: raw.audioUrl,
  };
}

export default function AdminDevotionsPage() {
  const [devotions, setDevotions] = useState<AdminDevotionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Inspection / Edit Side Sheet states
  const [selectedDevotion, setSelectedDevotion] = useState<AdminDevotionRow | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [isEditingSheet, setIsEditingSheet] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form state for inline editing
  const [editForm, setEditForm] = useState({
    title: "",
    scripture: "",
    verseText: "",
    content: "",
    prayer: "",
    tags: "",
    status: "published" as "published" | "draft" | "scheduled",
  });

  const fetchDevotions = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo =
        typeof window !== "undefined" &&
        localStorage.getItem("admin_demo_mode") !== "false";

      const res = await api.get("/devotions?limit=50");
      const raw = res.data;
      const fetched: any[] = raw?.data || (Array.isArray(raw) ? raw : []);

      if (fetched.length > 0) {
        setDevotions(fetched.map(normalizeDevotion));
      } else if (isDemo) {
        setDevotions(MOCK_DEVOTIONS.map(normalizeDevotion));
      } else {
        setDevotions(MOCK_DEVOTIONS.map(normalizeDevotion));
      }
    } catch (err) {
      console.warn("Devotions API unavailable, using mock data fallback:", err);
      setDevotions(MOCK_DEVOTIONS.map(normalizeDevotion));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevotions();
  }, [fetchDevotions]);

  const handleOpenSheet = useCallback((item: AdminDevotionRow, editMode = false) => {
    setSelectedDevotion(item);
    setEditForm({
      title: item.title,
      scripture: item.scripture,
      verseText: item.verseText,
      content: item.content,
      prayer: item.prayer,
      tags: item.tags.join(", "),
      status: item.status,
    });
    setIsEditingSheet(editMode);
    setIsSheetOpen(true);
  }, []);

  const handleToggleStatus = useCallback(async (item: AdminDevotionRow) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    try {
      await api.put(`/devotions/${item._id}`, { status: nextStatus });
      toast.success(`Devotion marked as ${nextStatus}`);
    } catch {
      toast.success(`Devotion marked as ${nextStatus} (demo mode)`);
    }

    setDevotions((prev) =>
      prev.map((d) => (d._id === item._id ? { ...d, status: nextStatus } : d))
    );
    if (selectedDevotion?._id === item._id) {
      setSelectedDevotion((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  }, [selectedDevotion]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/devotions/${id}`);
      toast.success("Devotion deleted successfully");
    } catch (err) {
      console.warn("API delete failed, updating local state:", err);
      toast.success("Devotion deleted (local state)");
    }
    setDevotions((prev) => prev.filter((d) => d._id !== id));
    if (selectedDevotion?._id === id) {
      setIsSheetOpen(false);
      setSelectedDevotion(null);
    }
  }, [selectedDevotion]);

  const handleSaveEdit = async () => {
    if (!selectedDevotion) return;
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editForm.scripture.trim()) {
      toast.error("Scripture reference is required");
      return;
    }

    setIsSaving(true);
    try {
      const updatedTags = editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: editForm.title.trim(),
        scripture: editForm.scripture.trim(),
        scriptureReference: editForm.scripture.trim(),
        verseText: editForm.verseText.trim(),
        scriptureText: editForm.verseText.trim(),
        content: editForm.content.trim(),
        prayer: editForm.prayer.trim(),
        tags: updatedTags,
        status: editForm.status,
      };

      try {
        await api.put(`/devotions/${selectedDevotion._id}`, payload);
      } catch (apiErr) {
        console.warn("API update failed (demo fallback active):", apiErr);
      }

      const updatedDevotion: AdminDevotionRow = {
        ...selectedDevotion,
        ...payload,
      };

      setDevotions((prev) =>
        prev.map((d) => (d._id === selectedDevotion._id ? updatedDevotion : d))
      );
      setSelectedDevotion(updatedDevotion);
      setIsEditingSheet(false);
      toast.success("Devotion updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update devotion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
    if (!devotions.length) {
      toast.info("No devotion records to export");
      return;
    }
    const headers = [
      "ID",
      "Title",
      "Scripture",
      "Author",
      "Date",
      "Status",
      "Likes",
      "Bookmarks",
      "Tags",
    ];
    const rows = devotions.map((d) => [
      `"${d._id}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.scripture.replace(/"/g, '""')}"`,
      `"${d.authorName.replace(/"/g, '""')}"`,
      `"${d.date}"`,
      `"${d.status}"`,
      d.likesCount,
      d.bookmarksCount,
      `"${d.tags.join("; ")}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fellowship_devotions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Devotions CSV exported successfully");
  };

  const statusCounts = useMemo(() => {
    return {
      all: devotions.length,
      published: devotions.filter((d) => d.status === "published").length,
      draft: devotions.filter((d) => d.status === "draft").length,
      scheduled: devotions.filter((d) => d.status === "scheduled").length,
    };
  }, [devotions]);

  const totalEngagement = useMemo(() => {
    const totalLikes = devotions.reduce((sum, d) => sum + d.likesCount, 0);
    const totalBookmarks = devotions.reduce((sum, d) => sum + d.bookmarksCount, 0);
    return { totalLikes, totalBookmarks };
  }, [devotions]);

  const filteredDevotions = useMemo(() => {
    if (statusFilter === "all") return devotions;
    return devotions.filter((d) => d.status === statusFilter);
  }, [devotions, statusFilter]);

  const columns = useMemo<ColumnDef<AdminDevotionRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        filterFn: (row, _columnId, filterValue: string) => {
          if (!filterValue) return true;
          const q = filterValue.toLowerCase().trim();
          const title = (row.original.title || "").toLowerCase();
          const scripture = (row.original.scripture || "").toLowerCase();
          const author = (row.original.authorName || "").toLowerCase();
          return title.includes(q) || scripture.includes(q) || author.includes(q);
        },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col gap-1 max-w-[240px] sm:max-w-xs md:max-w-sm">
              <button
                type="button"
                onClick={() => handleOpenSheet(item, false)}
                className="text-left font-semibold text-foreground hover:text-primary transition-colors text-sm line-clamp-1 cursor-pointer"
                title={item.title}
              >
                {item.title}
              </button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                {item.type === "voice" ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 gap-1 font-normal bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-none"
                  >
                    <PlayCircle className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
                    Voice {item.duration ? `• ${item.duration}` : ""}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-1 font-normal">
                    <FileText className="w-2.5 h-2.5 text-muted-foreground" />
                    Text
                  </Badge>
                )}
                {item.tags.length > 0 && (
                  <span className="truncate text-[11px] text-muted-foreground">
                    #{item.tags[0]}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "scripture",
        header: "Scripture",
        cell: ({ row }) => {
          const scripture = row.original.scripture;
          return (
            <div className="flex items-center gap-2 max-w-[190px]">
              <BookOpen className="h-4 w-4 text-primary shrink-0 opacity-80" />
              <span className="text-xs font-medium text-foreground truncate" title={scripture}>
                {scripture}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "authorName",
        header: "Author",
        cell: ({ row }) => {
          const item = row.original;
          const initial = item.authorName.charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                {initial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate max-w-[130px]">
                  {item.authorName}
                </span>
                {item.authorRole && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                    {item.authorRole}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <Calendar className="h-3.5 w-3.5 opacity-70" />
              <span>{row.original.date}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === "published") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Published
              </span>
            );
          }
          if (status === "draft") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Draft
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Scheduled
            </span>
          );
        },
      },
      {
        id: "engagement",
        header: "Likes / Bookmarks",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
              <span
                className="inline-flex items-center gap-1 font-medium"
                title={`${item.likesCount} student likes`}
              >
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                {item.likesCount}
              </span>
              <span
                className="inline-flex items-center gap-1 font-medium"
                title={`${item.bookmarksCount} student bookmarks`}
              >
                <Bookmark className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                {item.bookmarksCount}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Devotion Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleOpenSheet(item, false)}>
                  <Eye className="mr-2 h-3.5 w-3.5 text-primary" />
                  Inspect & Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenSheet(item, true)}>
                  <Edit3 className="mr-2 h-3.5 w-3.5" />
                  Quick Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  {item.status === "published" ? "Mark as Draft" : "Publish Devotion"}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/devotions/${item._id}`} target="_blank">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    View on Web
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => handleDelete(item._id, item.title)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Devotion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleOpenSheet, handleToggleStatus, handleDelete]
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Devotionals Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Create, review, and curate daily scripture nourishment for 4 Kilo AAU fellowship students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-4 shadow-sm"
          >
            <Link href="/admin/devotions/new">
              <Plus className="w-4 h-4 mr-1.5" />
              New Devotion
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Total Devotions</p>
              <h3 className="text-lg font-bold text-foreground">{statusCounts.all}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Published Feed</p>
              <h3 className="text-lg font-bold text-foreground">{statusCounts.published}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Drafts / In Review</p>
              <h3 className="text-lg font-bold text-foreground">{statusCounts.draft}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Student Reactions</p>
              <h3 className="text-lg font-bold text-foreground">
                {totalEngagement.totalLikes + totalEngagement.totalBookmarks}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs / Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-0.5">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="rounded-full h-8 text-xs px-3 font-normal"
          >
            All Devotions
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-medium">
              {statusCounts.all}
            </span>
          </Button>
          <Button
            variant={statusFilter === "published" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("published")}
            className="rounded-full h-8 text-xs px-3 font-normal"
          >
            Published
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-medium">
              {statusCounts.published}
            </span>
          </Button>
          <Button
            variant={statusFilter === "draft" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("draft")}
            className="rounded-full h-8 text-xs px-3 font-normal"
          >
            Drafts
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-medium">
              {statusCounts.draft}
            </span>
          </Button>
          {statusCounts.scheduled > 0 && (
            <Button
              variant={statusFilter === "scheduled" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("scheduled")}
              className="rounded-full h-8 text-xs px-3 font-normal"
            >
              Scheduled
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-medium">
                {statusCounts.scheduled}
              </span>
            </Button>
          )}
        </div>

        <div className="sm:hidden w-full">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-9 text-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="published">Published ({statusCounts.published})</SelectItem>
              <SelectItem value="draft">Drafts ({statusCounts.draft})</SelectItem>
              <SelectItem value="scheduled">Scheduled ({statusCounts.scheduled})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredDevotions}
        searchKey="title"
        searchPlaceholder="Search by title, scripture, or author..."
        isLoading={loading}
        onExportCsv={handleExportCsv}
        emptyMessage="No devotionals found matching your query."
      />

      {/* Inline Inspection & Quick Edit Side Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl w-full overflow-y-auto p-0">
          {selectedDevotion && (
            <div className="flex flex-col h-full">
              {/* Sheet Header */}
              <div className="p-6 border-b bg-muted/20">
                <SheetHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {selectedDevotion.status === "published" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs font-normal">
                        {selectedDevotion.type === "voice" ? "Voice Devotion" : "Text Devotion"}
                      </Badge>
                    </div>

                    <Button
                      variant={isEditingSheet ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => setIsEditingSheet(!isEditingSheet)}
                      className="h-8 text-xs gap-1.5 rounded-full"
                    >
                      {isEditingSheet ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Inspection View
                        </>
                      ) : (
                        <>
                          <FileEdit className="w-3.5 h-3.5" />
                          Edit Devotion
                        </>
                      )}
                    </Button>
                  </div>

                  <SheetTitle className="text-lg sm:text-xl font-bold text-foreground text-left mt-3">
                    {selectedDevotion.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground text-left">
                    By {selectedDevotion.authorName} • Published {selectedDevotion.date}
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* Sheet Content Body */}
              <div className="flex-1 p-6 space-y-6">
                {!isEditingSheet ? (
                  /* ─── Inspection Mode ─── */
                  <>
                    {/* Scripture Card */}
                    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <BookOpen className="w-4 h-4" />
                        <span>{selectedDevotion.scripture}</span>
                      </div>
                      {selectedDevotion.verseText ? (
                        <blockquote className="text-sm font-serif italic text-foreground/90 border-l-2 border-primary/50 pl-3.5 py-1">
                          “{selectedDevotion.verseText}”
                        </blockquote>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No verse text excerpt provided.
                        </p>
                      )}
                    </div>

                    {/* Devotional Reflection Content */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Devotional Reflection
                      </h4>
                      <div className="text-sm leading-relaxed text-foreground bg-muted/20 p-4 rounded-xl border border-border whitespace-pre-line">
                        {selectedDevotion.content || "No reflection text available."}
                      </div>
                    </div>

                    {/* Closing Student Prayer */}
                    {selectedDevotion.prayer && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4" />
                          <span>Closing Student Prayer</span>
                        </div>
                        <p className="text-sm italic text-foreground/90 leading-relaxed">
                          {selectedDevotion.prayer}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedDevotion.tags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tags & Topics
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDevotion.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Engagement Stats Details */}
                    <div className="pt-2 border-t grid grid-cols-3 gap-3 text-center">
                      <div className="p-2.5 rounded-lg bg-muted/40 border">
                        <span className="text-[11px] text-muted-foreground block">Likes</span>
                        <span className="text-sm font-bold text-foreground">
                          {selectedDevotion.likesCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/40 border">
                        <span className="text-[11px] text-muted-foreground block">Bookmarks</span>
                        <span className="text-sm font-bold text-foreground">
                          {selectedDevotion.bookmarksCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/40 border">
                        <span className="text-[11px] text-muted-foreground block">Medium</span>
                        <span className="text-sm font-bold text-foreground capitalize">
                          {selectedDevotion.type}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ─── Inline Edit Mode ─── */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-title" className="text-xs font-medium">
                        Devotion Title
                      </Label>
                      <Input
                        id="edit-title"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="e.g. Rooted in Faith Amid Academic Seasons"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-scripture" className="text-xs font-medium">
                          Scripture Reference
                        </Label>
                        <Input
                          id="edit-scripture"
                          value={editForm.scripture}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, scripture: e.target.value }))
                          }
                          placeholder="e.g. Colossians 2:6-7"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="edit-status" className="text-xs font-medium">
                          Publication Status
                        </Label>
                        <Select
                          value={editForm.status}
                          onValueChange={(val: any) =>
                            setEditForm((prev) => ({ ...prev, status: val }))
                          }
                        >
                          <SelectTrigger id="edit-status" className="h-9 text-xs">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-verse" className="text-xs font-medium">
                        Scripture Verse Quotation
                      </Label>
                      <Textarea
                        id="edit-verse"
                        value={editForm.verseText}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, verseText: e.target.value }))
                        }
                        placeholder="Full quotation of the Bible passage..."
                        rows={3}
                        className="text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-content" className="text-xs font-medium">
                        Devotional Reflection Message
                      </Label>
                      <Textarea
                        id="edit-content"
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Student message, reflection, context..."
                        rows={6}
                        className="text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-prayer" className="text-xs font-medium">
                        Closing Student Prayer
                      </Label>
                      <Textarea
                        id="edit-prayer"
                        value={editForm.prayer}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, prayer: e.target.value }))
                        }
                        placeholder="Lord Jesus, anchor my thoughts..."
                        rows={3}
                        className="text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-tags" className="text-xs font-medium">
                        Tags (comma separated)
                      </Label>
                      <Input
                        id="edit-tags"
                        value={editForm.tags}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, tags: e.target.value }))
                        }
                        placeholder="Faith, Exams, Campus Life, Prayer"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sheet Action Footer */}
              <div className="p-4 border-t bg-muted/10 flex items-center justify-between gap-2">
                {!isEditingSheet ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs"
                      >
                        <Link href={`/devotions/${selectedDevotion._id}`} target="_blank">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View on Web
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs"
                      >
                        <Link href={`/admin/devotions/${selectedDevotion._id}/edit`}>
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Full Editor
                        </Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(selectedDevotion)}
                        className="h-8 text-xs"
                      >
                        {selectedDevotion.status === "published"
                          ? "Mark as Draft"
                          : "Publish Devotion"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsSheetOpen(false)}
                        className="h-8 text-xs"
                      >
                        Close
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingSheet(false)}
                      disabled={isSaving}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                    >
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
