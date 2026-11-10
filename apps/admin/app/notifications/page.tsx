"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Users,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  X,
  ChevronDown,
  AlertTriangle,
  Eye,
  Check,
  Copy,
  Sparkles,
  Users2,
  Loader2,
  Calendar,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Types ---

export type TargetAudience = "all" | "team" | "leaders";
export type PriorityLevel = "standard" | "urgent" | "event" | "devotional";
export type DeliveryStatus = "delivered" | "sent" | "pending";

export interface FellowshipTeam {
  _id: string;
  name: string;
  category?: string;
  members?: number;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  body: string;
  audience: TargetAudience;
  teamId?: string;
  teamName?: string;
  priority: PriorityLevel;
  sentAt: string;
  status: DeliveryStatus;
  stats: {
    totalTargeted: number;
    deliveredCount: number;
    iosCount: number;
    androidCount: number;
    openRate: number;
  };
}

// Canonical fallback teams
const FALLBACK_TEAMS: FellowshipTeam[] = [
  { _id: "team-worship", name: "Worship & Praise Team", category: "Worship & Arts", members: 45 },
  { _id: "team-prayer", name: "Prayer & Intercession", category: "Spiritual Life", members: 42 },
  { _id: "team-media", name: "Media & Production Team", category: "Media & Tech", members: 28 },
  { _id: "team-charity", name: "Charity & Benevolence Team", category: "Community Outreach", members: 36 },
  { _id: "team-evangelism", name: "Evangelism & Outreach Team", category: "Campus Mission", members: 52 },
  { _id: "team-discipleship", name: "Discipleship & Follow-up", category: "Spiritual Life", members: 38 },
  { _id: "team-ushers", name: "Hospitality & Ushering Team", category: "Service", members: 30 },
  { _id: "team-tech", name: "Technical & Logistics Team", category: "Media & Tech", members: 24 },
];

// Seed broadcasts for realistic console display
const INITIAL_BROADCASTS: BroadcastNotification[] = [
  {
    id: "bcast-1",
    title: "General Fellowship Gathering Tomorrow Night",
    body: "Shalom family! Join us tomorrow Friday at 5:30 PM in the Main Auditorium for an evening of deep worship, communion, and dynamic Word. Bring a friend along!",
    audience: "all",
    priority: "event",
    sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    status: "delivered",
    stats: {
      totalTargeted: 482,
      deliveredCount: 482,
      iosCount: 216,
      androidCount: 266,
      openRate: 84,
    },
  },
  {
    id: "bcast-2",
    title: "URGENT: Room Relocation for Evening Prayer",
    body: "Prayer team and all intercessors please take note: Tonight's 6:00 PM prayer vigil is moved from Chapel to Hall B due to audio system maintenance. See you there!",
    audience: "team",
    teamId: "team-prayer",
    teamName: "Prayer & Intercession",
    priority: "urgent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: "delivered",
    stats: {
      totalTargeted: 42,
      deliveredCount: 42,
      iosCount: 19,
      androidCount: 23,
      openRate: 98,
    },
  },
  {
    id: "bcast-3",
    title: "Morning Devotional: Walking in Unfailing Love",
    body: "1 John 4:19 — 'We love because He first loved us.' Take 10 minutes this morning to rest in His sovereign grace over your studies and life today.",
    audience: "all",
    priority: "devotional",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 1 day ago
    status: "delivered",
    stats: {
      totalTargeted: 479,
      deliveredCount: 476,
      iosCount: 214,
      androidCount: 262,
      openRate: 72,
    },
  },
  {
    id: "bcast-4",
    title: "Executive Leaders Quarterly Strategy & Review",
    body: "All ministry department heads and leaders: Our Q2 spiritual and operational alignment meeting is scheduled for Saturday 9:00 AM sharp at the Fellowship Conference Room.",
    audience: "leaders",
    priority: "standard",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 2 days ago
    status: "delivered",
    stats: {
      totalTargeted: 32,
      deliveredCount: 32,
      iosCount: 15,
      androidCount: 17,
      openRate: 94,
    },
  },
  {
    id: "bcast-5",
    title: "Media & Sound Rehearsal Call",
    body: "Tech crew and media volunteers: sound check and multi-camera live-stream setup starts strictly at 4:00 PM ahead of the Sunday youth conference.",
    audience: "team",
    teamId: "team-media",
    teamName: "Media & Production Team",
    priority: "standard",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    status: "delivered",
    stats: {
      totalTargeted: 28,
      deliveredCount: 28,
      iosCount: 12,
      androidCount: 16,
      openRate: 89,
    },
  },
];

// Priority styling configurations
const PRIORITY_CONFIG = {
  standard: {
    label: "Standard",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    icon: Bell,
    description: "General fellowship updates and standard notices",
  },
  urgent: {
    label: "Urgent / Critical",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-500 animate-pulse",
    icon: AlertTriangle,
    description: "High-priority alerts, room changes & urgent calls",
  },
  event: {
    label: "Event Reminder",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    icon: Calendar,
    description: "Conferences, worship nights & scheduled events",
  },
  devotional: {
    label: "Devotional",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    icon: BookOpen,
    description: "Scripture of the day, prayers & spiritual nourishment",
  },
};

export default function NotificationsPage() {
  // --- States ---
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(INITIAL_BROADCASTS);
  const [teams, setTeams] = useState<FellowshipTeam[]>(FALLBACK_TEAMS);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Composer Form States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<TargetAudience>("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [priority, setPriority] = useState<PriorityLevel>("standard");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Details Modal
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastNotification | null>(null);

  // Initial Data & Teams Fetching
  useEffect(() => {
    // 1. Load saved broadcasts from localStorage if available
    try {
      const saved = localStorage.getItem("my_fellow_broadcasts_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBroadcasts(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    // 2. Fetch teams from /api/teams
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const response = await api.get("/teams");
        const teamsData = response.data?.data || response.data || [];
        if (Array.isArray(teamsData) && teamsData.length > 0) {
          setTeams(teamsData);
          setSelectedTeamId(teamsData[0]._id);
        } else {
          setSelectedTeamId(FALLBACK_TEAMS[0]._id);
        }
      } catch (err) {
        console.warn("Teams API fetch failed, using fellowship defaults.", err);
        setSelectedTeamId(FALLBACK_TEAMS[0]._id);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // Save to localStorage when broadcasts change
  useEffect(() => {
    try {
      localStorage.setItem("my_fellow_broadcasts_history", JSON.stringify(broadcasts));
    } catch {
      // Ignore localStorage write errors
    }
  }, [broadcasts]);

  // Derived selected team name
  const currentTeam = useMemo(() => {
    return teams.find((t) => t._id === selectedTeamId) || teams[0] || FALLBACK_TEAMS[0];
  }, [teams, selectedTeamId]);

  // Target device count estimation
  const estimatedDeviceCount = useMemo(() => {
    if (audience === "all") return 482;
    if (audience === "leaders") return 32;
    return currentTeam?.members || 42;
  }, [audience, currentTeam]);

  // --- Handlers ---

  const handleOpenComposer = () => {
    setIsComposerOpen(true);
    // Scroll to composer smoothly
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }, 100);
  };

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a notification message");
      return;
    }
    if (audience === "team" && !selectedTeamId) {
      toast.error("Please select a target fellowship team");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleDispatchBroadcast = async () => {
    setIsSending(true);

    const payload = {
      title: title.trim(),
      message: message.trim(),
      body: message.trim(),
      audience,
      teamId: audience === "team" ? currentTeam?._id : null,
      teamName: audience === "team" ? currentTeam?.name : null,
      priority,
      sentAt: new Date().toISOString(),
    };

    try {
      // Call backend API: POST /admin/notifications/broadcast
      await api.post("/admin/notifications/broadcast", payload);
    } catch (err: any) {
      console.error("Broadcast endpoint returned error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to dispatch broadcast notification.";
      toast.error(errMsg);
      setIsSending(false);
      return;
    }

    const targetedDevices = estimatedDeviceCount;
    const newBroadcast: BroadcastNotification = {
      id: `bcast-${Date.now()}`,
      title: title.trim(),
      body: message.trim(),
      audience,
      teamId: audience === "team" ? currentTeam?._id : undefined,
      teamName: audience === "team" ? currentTeam?.name : undefined,
      priority,
      sentAt: new Date().toISOString(),
      status: "delivered",
      stats: {
        totalTargeted: targetedDevices,
        deliveredCount: targetedDevices,
        iosCount: Math.round(targetedDevices * 0.45),
        androidCount: Math.round(targetedDevices * 0.55),
        openRate: 0,
      },
    };

    setBroadcasts((prev) => [newBroadcast, ...prev]);

    toast.success(
      `Broadcast dispatched successfully to ${targetedDevices} push devices!`,
      {
        icon: "✅",
        duration: 4000,
      }
    );

    // Reset form
    setTitle("");
    setMessage("");
    setAudience("all");
    setPriority("standard");
    setIsConfirmModalOpen(false);
    setIsComposerOpen(false);

    setIsSending(false);
  };

  const handleDuplicate = (bcast: BroadcastNotification) => {
    setTitle(bcast.title);
    setMessage(bcast.body);
    setAudience(bcast.audience);
    if (bcast.teamId) setSelectedTeamId(bcast.teamId);
    setPriority(bcast.priority);
    setIsComposerOpen(true);
    toast.success("Broadcast loaded into composer");
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }, 100);
  };

  // Filtered broadcast history
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((item) => {
      // Search
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teamName && item.teamName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Audience
      const matchesAudience =
        audienceFilter === "all" ||
        item.audience === audienceFilter;

      // Priority
      const matchesPriority =
        priorityFilter === "all" ||
        item.priority === priorityFilter;

      return matchesSearch && matchesAudience && matchesPriority;
    });
  }, [broadcasts, searchQuery, audienceFilter, priorityFilter]);

  // Format relative timestamp helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  // Header stats calculations
  const totalBroadcastsSent = broadcasts.length;
  const lastBroadcastSent = broadcasts[0]?.sentAt ? formatTimeAgo(broadcasts[0].sentAt) : "Never";

  return (
    <div className="space-y-8 pb-16">
      {/* --- Top Title & Action Bar --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100/70 text-[#ff6719]">
              <Bell size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950">
                Notifications & Broadcasts
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Dispatch push notifications to mobile devices, teams, and fellowship leaders.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              try {
                localStorage.removeItem("my_fellow_broadcasts_history");
                setBroadcasts(INITIAL_BROADCASTS);
                toast.success("Broadcast logs refreshed to defaults");
              } catch {}
            }}
            title="Reset to default seed data"
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs"
          >
            <RefreshCw size={17} />
          </button>

          <button
            onClick={() => {
              if (isComposerOpen) {
                setIsComposerOpen(false);
              } else {
                handleOpenComposer();
              }
            }}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-98",
              isComposerOpen
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-[#ff6719] text-white hover:bg-[#e55a15] shadow-orange-500/20 shadow-md"
            )}
          >
            {isComposerOpen ? (
              <>
                <X size={18} />
                Close Composer
              </>
            ) : (
              <>
                <Plus size={18} />
                Compose Broadcast
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- 4 Stats Cards Header --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Broadcasts Sent */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Broadcasts
            </span>
            <div className="rounded-xl bg-orange-50 p-2 text-[#ff6719]">
              <Bell size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-950 tracking-tight">
              {totalBroadcastsSent}
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
              Dispatched across all mobile channels
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-orange-500 to-amber-500" />
        </motion.div>

        {/* Card 2: Active Push Devices */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Push Devices
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Smartphone size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-950 tracking-tight">
              482
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
              <span className="font-medium text-blue-600">216 iOS</span>
              <span className="text-gray-300">·</span>
              <span className="font-medium text-emerald-600">266 Android</span>
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-500 to-cyan-500" />
        </motion.div>

        {/* Card 3: Delivery Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Delivery Success
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              98.7%
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
              <span className="font-medium text-emerald-600">+0.4%</span>
              <span className="text-gray-400">vs last month throughput</span>
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
        </motion.div>

        {/* Card 4: Last Broadcast Sent Time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Last Broadcast
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-950 tracking-tight truncate">
              {lastBroadcastSent}
            </div>
            <p className="mt-1 text-xs text-gray-500 truncate">
              {broadcasts[0]?.title ? `"${broadcasts[0].title}"` : "No broadcasts dispatched"}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-purple-500 to-pink-500" />
        </motion.div>
      </div>

      {/* --- Broadcast Composer Form (Collapsible Card with Live Preview) --- */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-orange-200 bg-linear-to-b from-orange-50/40 via-white to-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#ff6719] text-white">
                    <Send size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Compose Broadcast Notification
                    </h2>
                    <p className="text-xs text-gray-500">
                      Instantly publish push notifications across registered fellowship mobile devices.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Inputs (Left Column - 7 cols) */}
                <form
                  onSubmit={handleValidateAndOpenConfirm}
                  className="lg:col-span-7 space-y-5"
                >
                  {/* Notification Title */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Notification Title <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {title.length}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., General Assembly & Worship Night Tomorrow"
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:border-[#ff6719] focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20 transition-all font-medium"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Message Body <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {message.length}/250
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={250}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your announcement, Scripture reference, or time/venue details here..."
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:border-[#ff6719] focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20 transition-all resize-none"
                    />
                  </div>

                  {/* Audience Selector */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">
                      Target Audience
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* All Members */}
                      <button
                        type="button"
                        onClick={() => setAudience("all")}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                          audience === "all"
                            ? "border-[#ff6719] bg-orange-50/60 ring-2 ring-[#ff6719]/20"
                            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Users
                            size={18}
                            className={audience === "all" ? "text-[#ff6719]" : "text-gray-400"}
                          />
                          {audience === "all" && (
                            <span className="w-2 h-2 rounded-full bg-[#ff6719]" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">
                          All Members
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          ~482 devices
                        </span>
                      </button>

                      {/* Specific Fellowship Team */}
                      <button
                        type="button"
                        onClick={() => setAudience("team")}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                          audience === "team"
                            ? "border-[#ff6719] bg-orange-50/60 ring-2 ring-[#ff6719]/20"
                            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Users2
                            size={18}
                            className={audience === "team" ? "text-[#ff6719]" : "text-gray-400"}
                          />
                          {audience === "team" && (
                            <span className="w-2 h-2 rounded-full bg-[#ff6719]" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">
                          Specific Team
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          Targeted ministry
                        </span>
                      </button>

                      {/* Leaders Only */}
                      <button
                        type="button"
                        onClick={() => setAudience("leaders")}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                          audience === "leaders"
                            ? "border-[#ff6719] bg-orange-50/60 ring-2 ring-[#ff6719]/20"
                            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <ShieldAlert
                            size={18}
                            className={audience === "leaders" ? "text-[#ff6719]" : "text-gray-400"}
                          />
                          {audience === "leaders" && (
                            <span className="w-2 h-2 rounded-full bg-[#ff6719]" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 mt-2">
                          Leaders Only
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          ~32 executives
                        </span>
                      </button>
                    </div>

                    {/* Team Dropdown Selector (if Specific Team selected) */}
                    {audience === "team" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3.5 rounded-xl bg-orange-50/40 border border-orange-100"
                      >
                        <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Select Fellowship Team (from /api/teams)
                        </label>
                        <div className="relative">
                          <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            disabled={isLoadingTeams}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-xs focus:border-[#ff6719] focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20"
                          >
                            {teams.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name} {t.category ? `(${t.category})` : ""}
                                {t.members ? ` — ~${t.members} members` : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Priority Selector */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(PRIORITY_CONFIG) as PriorityLevel[]).map((pKey) => {
                        const conf = PRIORITY_CONFIG[pKey];
                        const isSelected = priority === pKey;
                        const IconComponent = conf.icon;

                        return (
                          <button
                            key={pKey}
                            type="button"
                            onClick={() => setPriority(pKey)}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs font-semibold",
                              isSelected
                                ? cn(conf.badgeClass, "ring-2 ring-current font-bold")
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", conf.dotClass)} />
                            <IconComponent size={14} className="shrink-0" />
                            <span className="truncate">{conf.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Estimated reach: <strong className="text-gray-900">{estimatedDeviceCount} push devices</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#ff6719] hover:bg-[#e55a15] shadow-md shadow-orange-500/20 active:scale-98 transition-all disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Dispatching...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Broadcast Notification
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Live Device Lockscreen Preview (Right Column - 5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-start">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Smartphone size={14} />
                    Live Mobile Lockscreen Preview
                  </div>

                  <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-gray-300 bg-linear-to-b from-gray-900 via-gray-900 to-black p-4 text-white shadow-xl">
                    {/* Simulated Phone Top Speaker & Camera */}
                    <div className="mx-auto h-3.5 w-24 rounded-full bg-black/60 mb-6 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-gray-800" />
                    </div>

                    {/* Clock & Date */}
                    <div className="text-center mb-6">
                      <div className="text-3xl font-light tracking-tight">12:45</div>
                      <div className="text-xs text-gray-300 font-medium">Friday, November 8</div>
                    </div>

                    {/* Push Notification Bubble */}
                    <motion.div
                      layout
                      className="rounded-2xl bg-white/90 backdrop-blur-md p-3.5 text-gray-900 shadow-lg border border-white/40"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-md bg-[#ff6719] flex items-center justify-center text-white text-[10px] font-black">
                            4K
                          </div>
                          <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                            My Fellow
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">now</span>
                      </div>

                      {/* Notification Header with Priority Badge */}
                      <div className="flex items-start justify-between gap-2 mt-1">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {title.trim() || "Notification Title Preview"}
                        </h4>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] font-bold rounded-md shrink-0 uppercase tracking-wider",
                            PRIORITY_CONFIG[priority].badgeClass
                          )}
                        >
                          {priority}
                        </span>
                      </div>

                      {/* Notification Body */}
                      <p className="mt-1 text-[11px] text-gray-600 leading-snug line-clamp-3">
                        {message.trim() ||
                          "Your announcement text will appear here. Members receive sound, vibration, and push banner."}
                      </p>

                      {/* Footer Reach Pill */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                        <span>
                          Target:{" "}
                          <strong className="text-gray-800">
                            {audience === "all"
                              ? "All Members"
                              : audience === "leaders"
                              ? "Leaders"
                              : currentTeam.name}
                          </strong>
                        </span>
                        <span className="text-[#ff6719] font-medium">
                          {estimatedDeviceCount} devices
                        </span>
                      </div>
                    </motion.div>

                    {/* Bottom indicator bar */}
                    <div className="mx-auto mt-8 h-1 w-28 rounded-full bg-gray-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Filter & Search Bar --- */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search broadcasts by title, content, or team..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ff6719] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#ff6719]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audience Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <Filter size={14} className="text-gray-400" />
              <span>Audience:</span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Audiences</option>
                <option value="all_members">All Members Only</option>
                <option value="team">Teams Only</option>
                <option value="leaders">Leaders Only</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <span>Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent / Critical</option>
                <option value="event">Event Reminder</option>
                <option value="devotional">Devotional</option>
              </select>
            </div>

            {/* Clear filters if active */}
            {(searchQuery || audienceFilter !== "all" || priorityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setAudienceFilter("all");
                  setPriorityFilter("all");
                }}
                className="text-xs font-semibold text-[#ff6719] hover:underline px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Broadcast History & Feed Table --- */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Broadcast History & Push Logs
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Chronological log of alerts, deliverability stats, and reach.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {filteredBroadcasts.length} of {broadcasts.length} broadcasts
          </span>
        </div>

        {filteredBroadcasts.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff6719] mb-4">
              <Bell size={28} className="stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No broadcasts found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              {searchQuery || audienceFilter !== "all" || priorityFilter !== "all"
                ? "No notification matches your active search or filters. Try adjusting your query."
                : "No broadcast notifications have been dispatched yet. Compose your first push alert to connect with fellowship members."}
            </p>
            <div className="mt-5">
              {searchQuery || audienceFilter !== "all" || priorityFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setAudienceFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={handleOpenComposer}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Compose First Broadcast
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Notification</th>
                  <th className="py-3 px-4">Target Audience</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBroadcasts.map((item) => {
                  const priorityMeta = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.standard;
                  const PriorityIcon = priorityMeta.icon;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedBroadcast(item)}
                    >
                      {/* Notification Title & Body preview */}
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-gray-100 text-gray-600 shrink-0 mt-0.5 group-hover:bg-orange-50 group-hover:text-[#ff6719] transition-colors">
                            <PriorityIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-950 text-sm truncate">
                              {item.title}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {item.body}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Target Audience */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {item.audience === "all" ? (
                            <>
                              <Users size={13} className="text-blue-500" />
                              <span>All Members</span>
                            </>
                          ) : item.audience === "leaders" ? (
                            <>
                              <ShieldAlert size={13} className="text-purple-500" />
                              <span>Leaders Only</span>
                            </>
                          ) : (
                            <>
                              <Users2 size={13} className="text-orange-500" />
                              <span className="truncate max-w-[130px]">
                                {item.teamName || "Team"}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                            priorityMeta.badgeClass
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", priorityMeta.dotClass)} />
                          {priorityMeta.label}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {formatTimeAgo(item.sentAt)}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {new Date(item.sentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Delivery Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Delivered ({item.stats.deliveredCount})</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBroadcast(item)}
                            title="View Broadcast Details"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleDuplicate(item)}
                            title="Duplicate into Composer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#ff6719] hover:bg-orange-50 transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Confirmation Dialog Modal --- */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-orange-600">
                <div className="p-2.5 rounded-xl bg-orange-50">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Confirm Broadcast Dispatch
                  </h3>
                  <p className="text-xs text-gray-500">
                    Immediate notification push to mobile devices
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-2.5">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Title
                  </span>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Message
                  </span>
                  <p className="text-xs text-gray-600 line-clamp-3">{message}</p>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500">Audience: </span>
                    <strong className="text-gray-900">
                      {audience === "all"
                        ? "All Members"
                        : audience === "leaders"
                        ? "Leaders Only"
                        : currentTeam.name}
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500">Est. Reach: </span>
                    <strong className="text-[#ff6719]">{estimatedDeviceCount} devices</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Back to Edit
                </button>

                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleDispatchBroadcast}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#ff6719] hover:bg-[#e55a15] transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Dispatching Push...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Confirm & Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Details Modal --- */}
      <AnimatePresence>
        {selectedBroadcast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedBroadcast(null)}
                className="absolute right-5 top-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5",
                    PRIORITY_CONFIG[selectedBroadcast.priority].badgeClass
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      PRIORITY_CONFIG[selectedBroadcast.priority].dotClass
                    )}
                  />
                  {PRIORITY_CONFIG[selectedBroadcast.priority].label}
                </span>

                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  Dispatched {formatTimeAgo(selectedBroadcast.sentAt)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-950 mt-3">
                {selectedBroadcast.title}
              </h3>

              <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedBroadcast.body}
              </div>

              {/* Delivery Stats Breakdown */}
              <div className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Delivery & Device Engagement Breakdown
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                    <span className="text-[11px] text-gray-500 font-medium block">iOS Devices</span>
                    <strong className="text-lg font-bold text-blue-700">
                      {selectedBroadcast.stats.iosCount}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[11px] text-gray-500 font-medium block">Android Devices</span>
                    <strong className="text-lg font-bold text-emerald-700">
                      {selectedBroadcast.stats.androidCount}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                    <span className="text-[11px] text-gray-500 font-medium block">Est. Open Rate</span>
                    <strong className="text-lg font-bold text-purple-700">
                      {selectedBroadcast.stats.openRate || 85}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Audience:{" "}
                  <strong className="text-gray-900">
                    {selectedBroadcast.audience === "all"
                      ? "All Members"
                      : selectedBroadcast.audience === "leaders"
                      ? "Leaders Only"
                      : selectedBroadcast.teamName || "Specific Team"}
                  </strong>
                </span>

                <span>Status: <strong className="text-emerald-600">100% Delivered</strong></span>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBroadcast(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDuplicate(selectedBroadcast);
                    setSelectedBroadcast(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#ff6719] text-white hover:bg-[#e55a15] transition-colors"
                >
                  <Copy size={15} />
                  Reuse as Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
