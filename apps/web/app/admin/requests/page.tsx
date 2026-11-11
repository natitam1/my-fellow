"use client";

import api from "@/lib/api";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  HelpCircle,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  User,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

// ─── TYPES ─────────────────────────────────────────────────────────────

interface TeamJoinRequest {
  _id: string;
  fullName: string;
  phoneNumber: string;
  department: string;
  year: string;
  telegramHandle: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
  teamId?: {
    _id: string;
    name: string;
  };
}

interface DevotionWriterRequest {
  _id: string;
  fullName: string;
  phoneNumber: string;
  telegramHandle: string;
  department?: string;
  year?: string;
  sampleTopic: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
  userId?: {
    _id?: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  member: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    telegramHandle?: string;
    department?: string;
    year?: string;
  };
  subject?: string;
  category: string;
  message: string;
  imageUrl?: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: string;
}

// ─── FALLBACK MOCK DATA ────────────────────────────────────────────────

const MOCK_JOIN_REQUESTS: TeamJoinRequest[] = [
  {
    _id: "join-mock-1",
    fullName: "Natnael Tefera",
    phoneNumber: "+251911447788",
    department: "Software Engineering",
    year: "4th Year",
    telegramHandle: "@natnael_t",
    status: "pending",
    message:
      "I have 2 years of audio mixing and livestreaming experience and would love to serve in the Sound & Technical ministry during weekly fellowship services.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    teamId: {
      _id: "team-tech",
      name: "Media & Technical Team",
    },
  },
  {
    _id: "join-mock-2",
    fullName: "Marta Girma",
    phoneNumber: "+251922556677",
    department: "Electrical & Computer Eng.",
    year: "3rd Year",
    telegramHandle: "@marta_g",
    status: "pending",
    message:
      "Passionate about worship and praise. Played keyboard in my high school fellowship and eager to worship with the 4 Kilo Praise team.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    teamId: {
      _id: "team-worship",
      name: "Praise & Worship Team",
    },
  },
  {
    _id: "join-mock-3",
    fullName: "Amanuel Bekele",
    phoneNumber: "+251933667788",
    department: "Civil Engineering",
    year: "2nd Year",
    telegramHandle: "@aman_bek",
    status: "approved",
    message:
      "Eager to help in ushering and welcoming freshmen students during weekly fellowships and special conferences.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    teamId: {
      _id: "team-ushering",
      name: "Ushering & Hospitality",
    },
  },
];

const MOCK_WRITER_REQUESTS: DevotionWriterRequest[] = [
  {
    _id: "writer-mock-1",
    fullName: "Bruk Tesfaye",
    phoneNumber: "+251911234567",
    telegramHandle: "@bruk_t",
    department: "Software Engineering",
    year: "4th Year",
    sampleTopic: "Walking in Divine Purpose Amidst Academic Pressure",
    message:
      "I have been writing weekly devotional reflections for our campus dorm fellowship for 2 years. My passion is helping students integrate their walk with God into everyday engineering challenges, keeping identity in Christ steadfast during exam seasons.\n\nSample Excerpt:\n'When waves of deadlines threaten to submerge our peace, Philippians 4:6-7 bids us trade our panic for prayer. True student excellence is not measured by academic metrics alone, but by our surrender to the Master Architect.'",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    _id: "writer-mock-2",
    fullName: "Selamawit Haile",
    phoneNumber: "+251922334455",
    telegramHandle: "@selam_h",
    department: "Architecture",
    year: "3rd Year",
    sampleTopic: "The Master Architect: God's Blueprint for Our Youth",
    message:
      "I feel called to contribute devotional writing focused on God's design, renewal, and holy beauty in our daily routines. I completed the fellowship discipleship cohort last semester.\n\nSample Excerpt:\n'Just as an architect envisions the cathedral long before laying the foundation stone, the Lord has predetermined good works for each believer (Ephesians 2:10). Do not despise the humble season of hidden preparation.'",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
  {
    _id: "writer-mock-3",
    fullName: "Dawit Abebe",
    phoneNumber: "+251933445566",
    telegramHandle: "@dawit_ab",
    department: "Mechanical Engineering",
    year: "5th Year",
    sampleTopic: "Recharging in the Secret Place (Psalm 91)",
    message:
      "Former writer for campus Christian bulletin. Interested in writing brief daily audio devotion scripts and written guides for the fellowship mobile application.",
    status: "approved",
    adminNotes: "Approved - high quality spiritual depth and disciplined theology.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    _id: "supp-mock-1",
    ticketId: "SUP-1082",
    member: {
      fullName: "Kaleb Mengistu",
      phoneNumber: "+251912445566",
      email: "kaleb.m@gmail.com",
      telegramHandle: "@kalebm",
      department: "Computer Science",
      year: "3rd Year",
    },
    subject: "Unable to verify payment for Annual Spiritual Retreat",
    category: "Event Registration",
    message:
      "Greetings! I transferred the 250 ETB fee for the Spiritual Conference via CBE Birr, but the app registration still says 'Payment Pending'. Attached is my transaction SMS screenshot. Please help verify my badge.",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&auto=format&fit=crop&q=80",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    _id: "supp-mock-2",
    ticketId: "SUP-1079",
    member: {
      fullName: "Bethlehem Tadesse",
      phoneNumber: "+251944112233",
      email: "bethy.t@gmail.com",
      telegramHandle: "@betty_t",
      department: "Civil Engineering",
      year: "2nd Year",
    },
    subject: "Request for Pastoral Counseling / Prayer Session",
    category: "Prayer & Pastoral",
    message:
      "Hello fellowship leadership, I am going through a difficult family bereavement this semester and feeling overwhelmed academically. I would love to connect with a fellowship pastoral counselor or elder for prayer and guidance.",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    _id: "supp-mock-3",
    ticketId: "SUP-1065",
    member: {
      fullName: "Yonas Getachew",
      phoneNumber: "+251955778899",
      email: "yonas.g@gmail.com",
      telegramHandle: "@yonas_g",
      department: "Mechanical Engineering",
      year: "4th Year",
    },
    subject: "Audio devotional playback stops unexpectedly on mobile",
    category: "App Issue",
    message:
      "Whenever I try to play today's audio devotional using mobile data, the playback pauses after 10 seconds. Attached screenshot shows the playback error screen.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80",
    status: "in-progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    _id: "supp-mock-4",
    ticketId: "SUP-1050",
    member: {
      fullName: "Hanna Worku",
      phoneNumber: "+251911998877",
      email: "hanna.w@gmail.com",
      telegramHandle: "@hanna_w",
      department: "Biomedical Engineering",
      year: "5th Year",
    },
    subject: "Certificate of Fellowship Leadership Request",
    category: "Fellowship Team",
    message:
      "I completed my term as Worship Team Sub-lead and need an official fellowship testimonial certificate for graduation. Thank you very much!",
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
];

type ActiveTab = "team" | "devotion" | "support";
type StatusFilter = "all" | "pending" | "approved" | "rejected" | "in-progress" | "resolved";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("team");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Data sets
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>([]);
  const [writerRequests, setWriterRequests] = useState<DevotionWriterRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // Modals state
  const [selectedWriter, setSelectedWriter] = useState<DevotionWriterRequest | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [selectedSupport, setSelectedSupport] = useState<SupportTicket | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ─── DATA FETCHING ───────────────────────────────────────────────────

  const fetchAllData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Team Join Requests
      try {
        const joinRes = await api.get("/join-requests");
        const joinData = joinRes.data?.data || joinRes.data || [];
        if (Array.isArray(joinData) && joinData.length > 0) {
          setJoinRequests(joinData);
        } else {
          setJoinRequests(MOCK_JOIN_REQUESTS);
        }
      } catch (err) {
        console.warn("Failed fetching join requests, using mock data:", err);
        setJoinRequests(MOCK_JOIN_REQUESTS);
      }

      // 2. Fetch Devotion Writer Applications
      try {
        const writerRes = await api.get("/devotions/writer-requests");
        const writerData = writerRes.data?.data || writerRes.data || [];
        if (Array.isArray(writerData) && writerData.length > 0) {
          setWriterRequests(writerData);
        } else {
          setWriterRequests(MOCK_WRITER_REQUESTS);
        }
      } catch (err) {
        console.warn("Failed fetching writer applications, using mock data:", err);
        setWriterRequests(MOCK_WRITER_REQUESTS);
      }

      // 3. Fetch Support Tickets
      try {
        const supportRes = await api.get("/admin/support");
        const supportData = supportRes.data?.data || supportRes.data || [];
        if (Array.isArray(supportData) && supportData.length > 0) {
          setSupportTickets(supportData);
        } else {
          setSupportTickets(MOCK_SUPPORT_TICKETS);
        }
      } catch (err) {
        console.warn("Failed fetching support tickets, using mock data:", err);
        setSupportTickets(MOCK_SUPPORT_TICKETS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── TAB COUNTERS ───────────────────────────────────────────────────

  const pendingCounts = useMemo(() => {
    return {
      team: joinRequests.filter((r) => r.status === "pending").length,
      devotion: writerRequests.filter((w) => w.status === "pending").length,
      support: supportTickets.filter((s) => s.status === "pending").length,
    };
  }, [joinRequests, writerRequests, supportTickets]);

  // ─── ACTIONS: TEAM JOIN REQUESTS ────────────────────────────────────

  const handleUpdateJoinStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
    setActionLoading(id);

    try {
      await api.patch(`/join-requests/${id}/status`, { status });
      toast.success(`Request marked as ${status}`);
      setJoinRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      console.error("Backend update error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update request status";
      toast.error(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── ACTIONS: DEVOTION WRITER APPLICATIONS ──────────────────────────

  const handleUpdateWriterStatus = async (
    id: string,
    status: "approved" | "rejected",
    notes?: string
  ) => {
    const actionLabel = status === "approved" ? "Approve as Devotion Writer" : "Reject Application";
    if (!confirm(`Are you sure you want to ${actionLabel}?`)) return;
    setActionLoading(id);

    try {
      await api.patch(`/devotions/writer-requests/${id}/status`, {
        status,
        adminNotes: notes || undefined,
      });
      toast.success(status === "approved" ? "Writer approved successfully!" : "Application rejected");
      setWriterRequests((prev) =>
        prev.map((w) =>
          w._id === id
            ? { ...w, status, adminNotes: notes || w.adminNotes }
            : w
        )
      );
    } catch (err: any) {
      console.error("Backend update error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update writer application status";
      toast.error(errMsg);
    } finally {
      setActionLoading(null);
      if (selectedWriter?._id === id) {
        setSelectedWriter(null);
        setAdminNotesInput("");
      }
    }
  };

  // ─── ACTIONS: SUPPORT TICKETS ───────────────────────────────────────

  const handleUpdateSupportStatus = async (
    id: string,
    status: "in-progress" | "resolved"
  ) => {
    setActionLoading(id);

    try {
      await api.patch(`/admin/support/${id}/status`, { status });
      toast.success(`Ticket status updated to ${status}`);
      setSupportTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status } : t))
      );
      if (selectedSupport?._id === id) {
        setSelectedSupport((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      console.error("Backend update error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update support ticket status";
      toast.error(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── FILTERED DATA ──────────────────────────────────────────────────

  const filteredJoinRequests = useMemo(() => {
    return joinRequests.filter((req) => {
      // Status filter
      if (statusFilter !== "all" && req.status !== statusFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = req.fullName.toLowerCase().includes(query);
        const phoneMatch = req.phoneNumber.toLowerCase().includes(query);
        const tgMatch = req.telegramHandle?.toLowerCase().includes(query);
        const deptMatch = req.department?.toLowerCase().includes(query);
        const teamMatch = req.teamId?.name?.toLowerCase().includes(query);
        const msgMatch = req.message?.toLowerCase().includes(query);
        return nameMatch || phoneMatch || tgMatch || deptMatch || teamMatch || msgMatch;
      }
      return true;
    });
  }, [joinRequests, statusFilter, searchQuery]);

  const filteredWriterRequests = useMemo(() => {
    return writerRequests.filter((req) => {
      // Status filter
      if (statusFilter !== "all" && req.status !== statusFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = req.fullName.toLowerCase().includes(query);
        const phoneMatch = req.phoneNumber.toLowerCase().includes(query);
        const tgMatch = req.telegramHandle?.toLowerCase().includes(query);
        const deptMatch = req.department?.toLowerCase().includes(query);
        const topicMatch = req.sampleTopic?.toLowerCase().includes(query);
        const msgMatch = req.message?.toLowerCase().includes(query);
        return nameMatch || phoneMatch || tgMatch || deptMatch || topicMatch || msgMatch;
      }
      return true;
    });
  }, [writerRequests, statusFilter, searchQuery]);

  const filteredSupportTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      // Status filter
      if (statusFilter === "approved" && ticket.status !== "resolved") return false;
      if (statusFilter === "rejected") return false; // Not applicable for support
      if (statusFilter !== "all" && statusFilter !== "approved" && ticket.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const idMatch = ticket.ticketId?.toLowerCase().includes(query);
        const nameMatch = ticket.member.fullName.toLowerCase().includes(query);
        const phoneMatch = ticket.member.phoneNumber.toLowerCase().includes(query);
        const tgMatch = ticket.member.telegramHandle?.toLowerCase().includes(query);
        const subjMatch = ticket.subject?.toLowerCase().includes(query);
        const catMatch = ticket.category?.toLowerCase().includes(query);
        const msgMatch = ticket.message?.toLowerCase().includes(query);
        return idMatch || nameMatch || phoneMatch || tgMatch || subjMatch || catMatch || msgMatch;
      }
      return true;
    });
  }, [supportTickets, statusFilter, searchQuery]);

  // Helper date formatter
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-(--screen-2xl) mx-auto">
      {/* ─── HEADER & SUMMARY ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Requests & Inquiries Center
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-[#ff6719]">
              Admin Hub
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Review and process fellowship join applications, devotion writers, and member support tickets.
          </p>
        </div>

        <button
          onClick={() => fetchAllData(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all shadow-xs disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin text-[#ff6719]" : "text-gray-500"} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* ─── QUICK METRICS CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Team Join */}
        <div
          onClick={() => setActiveTab("team")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "team"
              ? "bg-white border-[#ff6719] shadow-sm ring-2 ring-orange-500/10"
              : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff6719]">
                <UserPlus size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Team Requests</p>
                <p className="text-lg font-bold text-gray-900">{joinRequests.length}</p>
              </div>
            </div>
            {pendingCounts.team > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                {pendingCounts.team} pending
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                All reviewed
              </span>
            )}
          </div>
        </div>

        {/* Writer Applications */}
        <div
          onClick={() => setActiveTab("devotion")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "devotion"
              ? "bg-white border-[#ff6719] shadow-sm ring-2 ring-orange-500/10"
              : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Devotion Writers</p>
                <p className="text-lg font-bold text-gray-900">{writerRequests.length}</p>
              </div>
            </div>
            {pendingCounts.devotion > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
                {pendingCounts.devotion} pending
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                All reviewed
              </span>
            )}
          </div>
        </div>

        {/* Support Tickets */}
        <div
          onClick={() => setActiveTab("support")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === "support"
              ? "bg-white border-[#ff6719] shadow-sm ring-2 ring-orange-500/10"
              : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <LifeBuoy size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Support Inquiries</p>
                <p className="text-lg font-bold text-gray-900">{supportTickets.length}</p>
              </div>
            </div>
            {pendingCounts.support > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                {pendingCounts.support} open
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                Resolved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── THREE TAB NAVIGATION ─────────────────────────────────── */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6" aria-label="Requests Tabs">
          <button
            onClick={() => {
              setActiveTab("team");
              setStatusFilter("all");
            }}
            className={`py-3.5 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "team"
                ? "border-[#ff6719] text-[#ff6719] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <UserPlus size={18} />
            <span>Team Join Requests</span>
            {pendingCounts.team > 0 && (
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === "team"
                    ? "bg-[#ff6719] text-white"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {pendingCounts.team}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("devotion");
              setStatusFilter("all");
            }}
            className={`py-3.5 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "devotion"
                ? "border-[#ff6719] text-[#ff6719] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BookOpen size={18} />
            <span>Devotion Writer Applications</span>
            {pendingCounts.devotion > 0 && (
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === "devotion"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {pendingCounts.devotion}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("support");
              setStatusFilter("all");
            }}
            className={`py-3.5 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "support"
                ? "border-[#ff6719] text-[#ff6719] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <LifeBuoy size={18} />
            <span>Member Support & Inquiries</span>
            {pendingCounts.support > 0 && (
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === "support"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {pendingCounts.support}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* ─── SEARCH & FILTER CONTROLS ─────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="flex-1 relative w-full md:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={
              activeTab === "team"
                ? "Search team requests by name, phone, team, or department..."
                : activeTab === "devotion"
                  ? "Search writer applications by name, topic, or department..."
                  : "Search support tickets by ID, member, category, or keyword..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#ff6719]/10 focus:border-[#ff6719]/30 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-500">
            <Filter size={14} className="text-gray-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="py-2 pl-3 pr-8 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 focus:bg-white transition-all cursor-pointer outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            {activeTab === "support" ? (
              <>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </>
            ) : (
              <>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </>
            )}
          </select>

          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs text-gray-500 hover:text-[#ff6719] px-2 py-1.5 underline transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ─── LOADING STATE ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-gray-100 rounded-xl shadow-xs">
          <Loader2 className="animate-spin text-[#ff6719] mb-3" size={32} />
          <p className="text-sm font-medium text-gray-600">Loading fellowship requests...</p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════
              TAB 1: TEAM JOIN REQUESTS
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Showing {filteredJoinRequests.length} of {joinRequests.length} team requests
                </p>
              </div>

              {filteredJoinRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex flex-col items-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6719] mb-3">
                    <UserPlus size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">No team join requests found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-1">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search criteria or resetting the status filter."
                      : "New team join applications submitted through the mobile app will appear here."}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
                  {filteredJoinRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Member Avatar */}
                        <div className="w-11 h-11 rounded-full bg-linear-to-tr from-[#ff6719]/15 to-[#ff6719]/5 border border-orange-200 flex items-center justify-center text-[#ff6719] font-bold shrink-0 text-sm">
                          {req.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        {/* Member Details */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">
                              {req.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full bg-orange-50 text-[#ff6719] border border-orange-200">
                              {req.teamId?.name || "General Fellowship"}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full capitalize ${
                                req.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : req.status === "rejected"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {req.status === "pending" && <Clock size={11} className="mr-1" />}
                              {req.status === "approved" && <Check size={11} className="mr-1" />}
                              {req.status === "rejected" && <X size={11} className="mr-1" />}
                              {req.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-gray-400" />
                              <span className="font-medium text-gray-800">{req.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-gray-400" />
                              <span>{req.department} ({req.year})</span>
                            </div>
                            {req.telegramHandle && (
                              <div className="flex items-center gap-1.5">
                                <Send size={13} className="text-blue-400" />
                                <a
                                  href={`https://t.me/${req.telegramHandle.replace("@", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                  {req.telegramHandle}
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Clock size={13} />
                              <span>Applied {formatDate(req.createdAt)}</span>
                            </div>
                          </div>

                          {req.message && (
                            <div className="mt-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-700 italic">
                              <span className="font-semibold text-gray-500 not-italic mr-1.5">Note:</span>
                              &quot;{req.message}&quot;
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        {req.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateJoinStatus(req._id, "approved")}
                              disabled={actionLoading === req._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                              title="Approve team member"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateJoinStatus(req._id, "rejected")}
                              disabled={actionLoading === req._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Reject request"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">
                            Status finalized
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: DEVOTION WRITER APPLICATIONS
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "devotion" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Showing {filteredWriterRequests.length} of {writerRequests.length} writer applications
                </p>
              </div>

              {filteredWriterRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex flex-col items-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">No writer applications found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-1">
                    {searchQuery || statusFilter !== "all"
                      ? "No applications matched your filter criteria."
                      : "When members apply to write devotionals, their writing samples will appear here."}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
                  {filteredWriterRequests.map((writer) => (
                    <div
                      key={writer._id}
                      className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Writer Avatar */}
                        <div className="w-11 h-11 rounded-full bg-linear-to-tr from-purple-500/15 to-purple-500/5 border border-purple-200 flex items-center justify-center text-purple-700 font-bold shrink-0 text-sm">
                          {writer.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        {/* Writer Details */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">
                              {writer.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              <Sparkles size={11} />
                              Writer Candidate
                            </span>
                            <span
                              className={`px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full capitalize ${
                                writer.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : writer.status === "rejected"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {writer.status === "pending" && <Clock size={11} className="mr-1" />}
                              {writer.status === "approved" && <Check size={11} className="mr-1" />}
                              {writer.status === "rejected" && <X size={11} className="mr-1" />}
                              {writer.status}
                            </span>
                          </div>

                          {/* Sample Devotion Topic badge */}
                          <div className="p-2 rounded-lg bg-purple-50/50 border border-purple-100 flex items-start gap-2">
                            <BookOpen size={14} className="text-purple-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                                Proposed Devotion Topic
                              </p>
                              <p className="text-xs font-semibold text-gray-900 mt-0.5">
                                &ldquo;{writer.sampleTopic}&rdquo;
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-gray-400" />
                              <span className="font-medium text-gray-800">{writer.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-gray-400" />
                              <span>{writer.department || "Campus"} ({writer.year || "Student"})</span>
                            </div>
                            {writer.telegramHandle && (
                              <div className="flex items-center gap-1.5">
                                <Send size={13} className="text-blue-400" />
                                <a
                                  href={`https://t.me/${writer.telegramHandle.replace("@", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                  {writer.telegramHandle}
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Clock size={13} />
                              <span>Applied {formatDate(writer.createdAt)}</span>
                            </div>
                          </div>

                          {/* Writing sample snippet */}
                          {writer.message && (
                            <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                              <span className="font-semibold text-gray-700">Writing Sample Excerpt: </span>
                              {writer.message}
                            </div>
                          )}

                          {writer.adminNotes && (
                            <div className="p-2 rounded-md bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                              <span className="font-semibold">Reviewer Notes: </span>
                              {writer.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons & Review Modal trigger */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedWriter(writer);
                            setAdminNotesInput(writer.adminNotes || "");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>View Sample</span>
                        </button>

                        {writer.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateWriterStatus(writer._id, "approved")}
                              disabled={actionLoading === writer._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                              title="Approve as devotion writer"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateWriterStatus(writer._id, "rejected")}
                              disabled={actionLoading === writer._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Reject application"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: MEMBER SUPPORT & INQUIRIES
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "support" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Showing {filteredSupportTickets.length} of {supportTickets.length} support tickets
                </p>
              </div>

              {filteredSupportTickets.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex flex-col items-center shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                    <LifeBuoy size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">No support tickets found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-1">
                    {searchQuery || statusFilter !== "all"
                      ? "No inquiries matched your search criteria."
                      : "Support requests and inquiries submitted by members will appear here."}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
                  {filteredSupportTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Category Icon */}
                        <div className="w-11 h-11 rounded-full bg-linear-to-tr from-blue-500/15 to-blue-500/5 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                          <LifeBuoy size={20} />
                        </div>

                        {/* Ticket Details */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                              {ticket.ticketId}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {ticket.category}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full capitalize ${
                                ticket.status === "resolved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : ticket.status === "in-progress"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {ticket.status === "pending" && <Clock size={11} className="mr-1" />}
                              {ticket.status === "in-progress" && <RefreshCw size={11} className="mr-1" />}
                              {ticket.status === "resolved" && <Check size={11} className="mr-1" />}
                              {ticket.status}
                            </span>
                          </div>

                          {ticket.subject && (
                            <h4 className="text-sm font-bold text-gray-900">
                              {ticket.subject}
                            </h4>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5 font-medium text-gray-900">
                              <User size={13} className="text-gray-400" />
                              <span>{ticket.member.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-gray-400" />
                              <span>{ticket.member.phoneNumber}</span>
                            </div>
                            {ticket.member.telegramHandle && (
                              <div className="flex items-center gap-1.5">
                                <Send size={13} className="text-blue-400" />
                                <a
                                  href={`https://t.me/${ticket.member.telegramHandle.replace("@", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                  {ticket.member.telegramHandle}
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Clock size={13} />
                              <span>Submitted {formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>

                          {/* Message snippet */}
                          <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            {ticket.message}
                          </p>

                          {/* Screenshot attachment preview thumbnail */}
                          {ticket.imageUrl && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-semibold text-gray-500">Attachment:</span>
                              <button
                                onClick={() => setPreviewImage(ticket.imageUrl || null)}
                                className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                              >
                                <ExternalLink size={12} className="text-gray-500 group-hover:text-gray-800" />
                                <span>Preview Screenshot</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <button
                          onClick={() => setSelectedSupport(ticket)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>View Ticket</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {ticket.status !== "in-progress" && (
                            <button
                              onClick={() => handleUpdateSupportStatus(ticket._id, "in-progress")}
                              disabled={actionLoading === ticket._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Mark ticket as in progress"
                            >
                              <RefreshCw size={13} />
                              <span>In Progress</span>
                            </button>
                          )}

                          {ticket.status !== "resolved" && (
                            <button
                              onClick={() => handleUpdateSupportStatus(ticket._id, "resolved")}
                              disabled={actionLoading === ticket._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                              title="Mark ticket as resolved"
                            >
                              <Check size={14} />
                              <span>Resolve</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: DEVOTION WRITER DETAILS & SAMPLE
          ═══════════════════════════════════════════════════════════ */}
      {selectedWriter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Devotion Writer Application
                  </h3>
                  <p className="text-xs text-gray-500">
                    Candidate Profile & Theological Writing Review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWriter(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Applicant Card */}
              <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                    Applicant Information
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    {selectedWriter.fullName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {selectedWriter.department || "Campus"} | {selectedWriter.year || "Student"}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-gray-600 sm:text-right">
                  <p className="font-medium text-gray-800">{selectedWriter.phoneNumber}</p>
                  {selectedWriter.telegramHandle && (
                    <a
                      href={`https://t.me/${selectedWriter.telegramHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 sm:justify-end"
                    >
                      {selectedWriter.telegramHandle}
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <p className="text-gray-400">
                    Applied on {formatDate(selectedWriter.createdAt)}
                  </p>
                </div>
              </div>

              {/* Sample Topic */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Proposed Devotion Topic
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900">
                  {selectedWriter.sampleTopic}
                </div>
              </div>

              {/* Writing Sample */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Writing Sample & Application Statement
                </label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto font-serif">
                  {selectedWriter.message || "No sample writing text provided."}
                </div>
              </div>

              {/* Admin Review Notes */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Reviewer Notes & Feedback (Optional)
                </label>
                <textarea
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Add feedback, approval remarks, or theological guidance..."
                  rows={2}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#ff6719]/10 focus:border-[#ff6719]/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  selectedWriter.status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedWriter.status === "rejected"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                Current Status: {selectedWriter.status}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWriter(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    handleUpdateWriterStatus(selectedWriter._id, "rejected", adminNotesInput)
                  }
                  disabled={actionLoading === selectedWriter._id}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  onClick={() =>
                    handleUpdateWriterStatus(selectedWriter._id, "approved", adminNotesInput)
                  }
                  disabled={actionLoading === selectedWriter._id}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Approve as Writer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: SUPPORT TICKET DETAILS
          ═══════════════════════════════════════════════════════════ */}
      {selectedSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <LifeBuoy size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Support Ticket Details
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Ticket ID: {selectedSupport.ticketId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupport(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Member Contact
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {selectedSupport.member.fullName}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedSupport.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                  <p>Phone: <span className="font-medium text-gray-900">{selectedSupport.member.phoneNumber}</span></p>
                  {selectedSupport.member.telegramHandle && (
                    <p>
                      Telegram:{" "}
                      <a
                        href={`https://t.me/${selectedSupport.member.telegramHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {selectedSupport.member.telegramHandle}
                      </a>
                    </p>
                  )}
                  {selectedSupport.member.department && (
                    <p>Dept: {selectedSupport.member.department}</p>
                  )}
                  {selectedSupport.member.year && (
                    <p>Year: {selectedSupport.member.year}</p>
                  )}
                </div>
              </div>

              {selectedSupport.subject && (
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <p className="text-sm font-semibold text-gray-900 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    {selectedSupport.subject}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Inquiry Message
                </label>
                <p className="text-xs sm:text-sm text-gray-800 p-3 bg-gray-50 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
                  {selectedSupport.message}
                </p>
              </div>

              {selectedSupport.imageUrl && (
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Attached Screenshot / Proof
                  </label>
                  <div
                    onClick={() => setPreviewImage(selectedSupport.imageUrl || null)}
                    className="relative cursor-pointer group rounded-lg overflow-hidden border border-gray-200 max-h-48 bg-gray-100 flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedSupport.imageUrl}
                      alt="Support attachment"
                      className="max-h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <ExternalLink size={14} />
                      Click to Enlarge
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  selectedSupport.status === "resolved"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedSupport.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                Status: {selectedSupport.status}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSupport(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                {selectedSupport.status !== "in-progress" && (
                  <button
                    onClick={() => handleUpdateSupportStatus(selectedSupport._id, "in-progress")}
                    disabled={actionLoading === selectedSupport._id}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Set In Progress
                  </button>
                )}
                {selectedSupport.status !== "resolved" && (
                  <button
                    onClick={() => handleUpdateSupportStatus(selectedSupport._id, "resolved")}
                    disabled={actionLoading === selectedSupport._id}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: SCREENSHOT IMAGE LIGHTBOX
          ═══════════════════════════════════════════════════════════ */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2 shadow-2xl cursor-default"
          >
            <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100 mb-2">
              <span className="text-xs font-bold text-gray-700">Attachment Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Open Original <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Screenshot attachment preview"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
