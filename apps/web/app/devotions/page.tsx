"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Devotion,
  UserStreak,
} from "@/types/devotion";
import {
  fetchDevotions,
  fetchUserStreak,
  recordStreakCheckIn,
  toggleDevotionLike,
  ALL_FALLBACK_DEVOTIONS,
  FORMATTED_MOCK_DEVOTIONS,
} from "@/lib/devotions-api";
import { DevotionWriterModal } from "@/components/devotions/DevotionWriterModal";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Flame,
  Headphones,
  BookOpen,
  Sparkles,
  Calendar,
  PenLine,
  Eye,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  X,
  Filter,
  Quote,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TAG_FILTERS = [
  "All",
  "Faith",
  "Prayer",
  "Wisdom",
  "Hope",
  "Campus Life",
  "Exams",
  "Patience",
  "Grace",
  "Fellowship",
];

const DATE_FILTERS = [
  { id: "all", label: "All Dates" },
  { id: "today", label: "Today" },
  { id: "week", label: "Past 7 Days" },
  { id: "month", label: "This Month" },
];

export default function DevotionsPage() {
  const { user, isAdmin } = useAuth();

  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "text" | "voice">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 4,
    longestStreak: 12,
  });
  const [streakCheckedToday, setStreakCheckedToday] = useState(false);
  const [writerModalOpen, setWriterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hero Card Interactive States
  const [heroLiked, setHeroLiked] = useState(false);
  const [heroLikesCount, setHeroLikesCount] = useState(0);
  const [heroBookmarked, setHeroBookmarked] = useState(false);
  const [saidAmen, setSaidAmen] = useState(false);
  const [amenCount, setAmenCount] = useState(38);
  const [showFullReflection, setShowFullReflection] = useState(false);

  // Archive Card Interactive States
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  // Fetch Devotions & Streak with automatic fallback to MOCK_DEVOTIONS
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchDevotions(), fetchUserStreak()])
      .then(([devotionsRes, streakData]) => {
        if (!isMounted) return;

        if (devotionsRes?.data && Array.isArray(devotionsRes.data) && devotionsRes.data.length > 0) {
          setDevotions(devotionsRes.data);
        } else {
          // Seamless fallback to centralized MOCK_DEVOTIONS
          setDevotions(ALL_FALLBACK_DEVOTIONS);
        }

        if (streakData) {
          setStreak(streakData);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn("Devotions API unavailable, using centralized mock devotions:", err);
        if (isMounted) {
          setDevotions(ALL_FALLBACK_DEVOTIONS);
          setIsLoading(false);
        }
      });

    // Check streak check-in from localStorage
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      const lastCheck = localStorage.getItem("devotion_last_checkin_date");
      if (lastCheck === today) {
        setStreakCheckedToday(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Today's Devotion (Featured or first available)
  const todayDevotion = useMemo(() => {
    if (!devotions.length) return null;
    return devotions.find((d) => d.featured) || devotions[0];
  }, [devotions]);

  // Synchronize hero states when todayDevotion resolves
  useEffect(() => {
    if (!todayDevotion) return;
    const id = todayDevotion._id || todayDevotion.id || "hero-today";
    const initialLiked = typeof window !== "undefined" && localStorage.getItem(`devotion_like_${id}`) === "true";
    const initialSaved = typeof window !== "undefined" && localStorage.getItem(`saved_devotion_${id}`) === "true";
    const initialAmen = typeof window !== "undefined" && localStorage.getItem(`devotion_amen_${id}`) === "true";

    setHeroLiked(initialLiked || Boolean(todayDevotion.isLiked));
    setHeroLikesCount((todayDevotion.likes || 142) + (initialLiked ? 1 : 0));
    setHeroBookmarked(initialSaved || Boolean(todayDevotion.isSaved));
    setSaidAmen(initialAmen);
    setAmenCount(38 + (initialAmen ? 1 : 0));
  }, [todayDevotion]);

  // Handle Hero Like Action
  const handleHeroLike = async () => {
    if (!todayDevotion) return;
    const id = todayDevotion._id || todayDevotion.id || "hero-today";
    const nextState = !heroLiked;
    setHeroLiked(nextState);
    setHeroLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (typeof window !== "undefined") {
      localStorage.setItem(`devotion_like_${id}`, String(nextState));
    }
    toast.success(nextState ? "Added to your liked devotionals ❤️" : "Removed from likes");

    try {
      await toggleDevotionLike(id);
    } catch {
      // Non-blocking
    }
  };

  // Handle Hero Bookmark Action
  const handleHeroBookmark = () => {
    if (!todayDevotion) return;
    const id = todayDevotion._id || todayDevotion.id || "hero-today";
    const nextState = !heroBookmarked;
    setHeroBookmarked(nextState);

    if (typeof window !== "undefined") {
      localStorage.setItem(`saved_devotion_${id}`, String(nextState));
    }
    toast.success(nextState ? "Saved to your quiet time bookmarks 🔖" : "Removed from bookmarks");
  };

  // Handle Hero Amen Action
  const handleAmen = () => {
    if (saidAmen) {
      toast.info("You've already joined in today's fellowship prayer!");
      return;
    }
    setSaidAmen(true);
    setAmenCount((prev) => prev + 1);
    if (todayDevotion) {
      const id = todayDevotion._id || todayDevotion.id || "hero-today";
      if (typeof window !== "undefined") {
        localStorage.setItem(`devotion_amen_${id}`, "true");
      }
    }
    toast.success("Amen! Your prayer was united with the fellowship family.");
  };

  // Handle Copy / Share Link
  const handleShare = async (item: Devotion, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const id = item._id || item.id || "";
    const url = typeof window !== "undefined" ? `${window.location.origin}/devotions/${id}` : "";

    if (navigator?.clipboard && url) {
      await navigator.clipboard.writeText(url);
      toast.success("Devotional link copied to clipboard!");
    } else {
      toast.info("Sharing devotion: " + item.title);
    }
  };

  // Handle Archive Item Like
  const handleArchiveLike = async (item: Devotion, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = item._id || item.id || "";
    const current = Boolean(likedMap[id]);
    const next = !current;
    setLikedMap((prev) => ({ ...prev, [id]: next }));
    setLikesCountMap((prev) => ({
      ...prev,
      [id]: (prev[id] ?? item.likes ?? 0) + (next ? 1 : -1),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem(`devotion_like_${id}`, String(next));
    }
    toast.success(next ? "Liked devotional ❤️" : "Removed like");

    try {
      await toggleDevotionLike(id);
    } catch {
      // Non-blocking
    }
  };

  // Handle Archive Item Bookmark
  const handleArchiveBookmark = (item: Devotion, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = item._id || item.id || "";
    const current = Boolean(savedMap[id]);
    const next = !current;
    setSavedMap((prev) => ({ ...prev, [id]: next }));

    if (typeof window !== "undefined") {
      localStorage.setItem(`saved_devotion_${id}`, String(next));
    }
    toast.success(next ? "Saved to bookmarks 🔖" : "Removed from bookmarks");
  };

  // Streak check-in handler
  const handleCheckIn = async () => {
    if (streakCheckedToday) {
      toast.info("You've already completed today's quiet time check-in!");
      return;
    }

    try {
      const updated = await recordStreakCheckIn();
      setStreak(updated);
      setStreakCheckedToday(true);
      if (typeof window !== "undefined") {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem("devotion_last_checkin_date", today);
      }
      toast.success(
        `Quiet time recorded! 🔥 ${updated.currentStreak} day streak! Keep drawing near to God.`,
      );
    } catch {
      // Fallback streak simulation
      const newStreak = {
        currentStreak: streak.currentStreak + 1,
        longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
      };
      setStreak(newStreak);
      setStreakCheckedToday(true);
      if (typeof window !== "undefined") {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem("devotion_last_checkin_date", today);
      }
      toast.success(
        `Quiet time recorded! 🔥 ${newStreak.currentStreak} day streak! Keep drawing near to God.`,
      );
    }
  };

  // Filtered Archive Devotions
  const filteredDevotions = useMemo(() => {
    return devotions.filter((d) => {
      // Media type filter
      if (selectedMediaType === "voice" && d.type !== "voice") return false;
      if (selectedMediaType === "text" && d.type !== "text") return false;

      // Tag filter
      if (selectedTag !== "All") {
        const hasTag = d.tags?.some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase(),
        );
        if (!hasTag) return false;
      }

      // Date filter
      if (selectedDateFilter === "today") {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (!d.date?.startsWith(todayStr)) return false;
      } else if (selectedDateFilter === "week") {
        const itemDate = new Date(d.date).getTime();
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        if (itemDate < sevenDaysAgo) return false;
      } else if (selectedDateFilter === "month") {
        const itemDate = new Date(d.date).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 86400000;
        if (itemDate < thirtyDaysAgo) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = d.title?.toLowerCase().includes(query);
        const matchesAuthor = d.author?.toLowerCase().includes(query);
        const matchesScripture = d.scriptureReference?.toLowerCase().includes(query);
        const matchesTags = d.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesContent = d.content?.toLowerCase().includes(query);
        const matchesPrayer = d.prayer?.toLowerCase().includes(query);
        return (
          matchesTitle ||
          matchesAuthor ||
          matchesScripture ||
          matchesTags ||
          matchesContent ||
          matchesPrayer
        );
      }

      return true;
    });
  }, [devotions, selectedTag, selectedDateFilter, selectedMediaType, searchQuery]);

  const isLeaderOrAdmin = isAdmin || user?.role === "leader";

  return (
    <div className="min-h-screen bg-background">
      {/* ─── TOP HEADER BAR ─── */}
      <header className="border-b border-border/80 bg-card/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-inner">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Daily Devotionals
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/10 px-2 py-0.5 rounded-full"
                >
                  AAU ECSF
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                AAU 4-Kilo Christian Students Fellowship Quiet Time & Word Meditation
              </p>
            </div>
          </div>

          {/* Action Button: Apply to Write Devotionals */}
          <div className="flex items-center gap-2">
            {isLeaderOrAdmin ? (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-4 shadow-sm"
              >
                <Link href="/admin/devotions/new">
                  <PenLine className="w-3.5 h-3.5 mr-1.5" />
                  Write Devotion
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setWriterModalOpen(true)}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-4 font-medium shadow-sm transition-all hover:scale-[1.02]"
              >
                <PenLine className="w-3.5 h-3.5 mr-1.5" />
                Apply to Write Devotionals
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* ─── STREAK COUNTER BANNER ─── */}
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] via-card to-primary/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Flame className="w-6 h-6 fill-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {streak.currentStreak} Day Quiet Time Streak
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-background/90 border-primary/30 text-primary font-mono font-semibold"
                >
                  Best: {streak.longestStreak} days
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo; — Psalm 119:105
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleCheckIn}
            disabled={streakCheckedToday}
            className={`rounded-full text-xs h-9 px-4 font-medium transition-all ${
              streakCheckedToday
                ? "bg-secondary text-muted-foreground border border-border"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:scale-[1.02]"
            }`}
          >
            {streakCheckedToday ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5 text-green-600" />
                Quiet Time Logged Today
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 mr-1.5 fill-current" />
                Mark Today&apos;s Quiet Time
              </>
            )}
          </Button>
        </section>

        {/* ─── TODAY'S DEVOTION HERO CARD ─── */}
        {todayDevotion && (
          <section className="relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-md transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Cover Image & Quick Tag Column */}
              <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-auto min-h-[300px] overflow-hidden bg-muted">
                <Image
                  src={todayDevotion.image}
                  alt={todayDevotion.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

                {/* Badges on Cover */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Today&apos;s Devotional
                  </span>
                  {todayDevotion.type === "voice" && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/70 backdrop-blur-md text-white flex items-center gap-1 border border-white/10">
                      <Headphones className="w-3 h-3 text-primary" />
                      {todayDevotion.duration || "Audio"}
                    </span>
                  )}
                </div>

                {/* Author Info Overlay on Mobile / Cover bottom */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2.5">
                    {todayDevotion.authorAvatar ? (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20">
                        <Image
                          src={todayDevotion.authorAvatar}
                          alt={todayDevotion.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                        {todayDevotion.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span>{todayDevotion.author}</span>
                        {todayDevotion.actorType === "official" && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <span className="text-[11px] text-white/80">
                        {todayDevotion.authorRole || "Fellowship Contributor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Devotional Details, Scripture Verse, Body Reflection, Prayer Card */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{todayDevotion.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{todayDevotion.duration || "5 min read"}</span>
                    </div>

                    {/* Bookmark & Like Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleHeroLike}
                        className={`h-8 px-2.5 rounded-full text-xs font-medium transition-all ${
                          heroLiked
                            ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Like devotional"
                      >
                        <Heart
                          className={`w-4 h-4 mr-1 transition-transform active:scale-125 ${
                            heroLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                        <span>{heroLikesCount}</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleHeroBookmark}
                        className={`h-8 px-2.5 rounded-full text-xs font-medium transition-all ${
                          heroBookmarked
                            ? "text-primary bg-primary/10 hover:bg-primary/20"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Bookmark for later"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            heroBookmarked ? "fill-primary text-primary" : ""
                          }`}
                        />
                        <span className="hidden sm:inline ml-1">
                          {heroBookmarked ? "Saved" : "Save"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleShare(todayDevotion, e)}
                        className="h-8 px-2 rounded-full text-xs text-muted-foreground hover:text-foreground"
                        title="Share Devotional"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Formatted Scripture Reference Pill & Title */}
                  <div className="space-y-2">
                    {todayDevotion.scriptureReference && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{todayDevotion.scriptureReference}</span>
                      </div>
                    )}

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
                      <Link href={`/devotions/${todayDevotion._id || todayDevotion.id}`}>
                        {todayDevotion.title}
                      </Link>
                    </h2>
                  </div>

                  {/* Scripture Verse Callout Box */}
                  {todayDevotion.scriptureText && (
                    <div className="relative rounded-2xl border-l-4 border-primary bg-gradient-to-r from-primary/[0.08] to-primary/[0.02] p-4 sm:p-5 shadow-inner">
                      <Quote className="w-5 h-5 text-primary/40 absolute top-3 right-3" />
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                          Anchor Scripture • የዕለቱ ቃል
                        </span>
                        <blockquote className="text-xs sm:text-sm italic font-serif leading-relaxed text-foreground/90">
                          &ldquo;{todayDevotion.scriptureText}&rdquo;
                        </blockquote>
                        {todayDevotion.scriptureReference && (
                          <div className="text-[11px] font-medium text-muted-foreground text-right pt-1">
                            — {todayDevotion.scriptureReference}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Body Reflection */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Spiritual Reflection • ማሰላሰያ
                    </span>
                    <div
                      className={`text-xs sm:text-sm text-foreground/85 leading-relaxed space-y-2.5 ${
                        !showFullReflection ? "line-clamp-4" : ""
                      }`}
                    >
                      {todayDevotion.content ? (
                        todayDevotion.content
                          .split("\n\n")
                          .map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))
                      ) : (
                        <p>{todayDevotion.caption}</p>
                      )}
                    </div>

                    {todayDevotion.content && todayDevotion.content.length > 280 && (
                      <button
                        type="button"
                        onClick={() => setShowFullReflection(!showFullReflection)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        {showFullReflection ? (
                          <>
                            Show Less <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Read Full Reflection <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Fellowship Prayer Card */}
                  {todayDevotion.prayer && (
                    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-background to-primary/[0.04] p-4 sm:p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkle className="w-4 h-4 fill-primary" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold tracking-tight text-foreground">
                              Daily Fellowship Prayer
                            </h4>
                            <span className="text-[10px] text-muted-foreground">
                              የዕለቱ የጸሎት አቅጣጫ
                            </span>
                          </div>
                        </div>

                        {/* Amen reflection button */}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAmen}
                          className={`rounded-full text-xs h-7 px-3 font-medium transition-all ${
                            saidAmen
                              ? "bg-primary/10 text-primary border-primary/40"
                              : "border-primary/30 hover:bg-primary/10 text-foreground"
                          }`}
                        >
                          <Heart className={`w-3 h-3 mr-1 ${saidAmen ? "fill-primary text-primary" : ""}`} />
                          <span>Amen ({amenCount})</span>
                        </Button>
                      </div>

                      <p className="text-xs sm:text-sm italic font-serif leading-relaxed text-muted-foreground pl-2 border-l-2 border-primary/40">
                        &ldquo;{todayDevotion.prayer}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Link / CTA */}
                <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {todayDevotion.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] font-normal px-2.5 py-0.5 rounded-full"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    asChild
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-5 shadow-sm w-full sm:w-auto"
                  >
                    <Link href={`/devotions/${todayDevotion._id || todayDevotion.id}`}>
                      {todayDevotion.type === "voice" ? (
                        <>
                          <Headphones className="w-3.5 h-3.5 mr-1.5" />
                          Listen & Meditate
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                          Open Full Devotional
                        </>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── ARCHIVE FILTER & SEARCH BAR ─── */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                Devotional Archive
                <span className="text-xs font-normal text-muted-foreground">
                  ({filteredDevotions.length} reflections)
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Filter by date, topic tag, audio format, or search Scripture references
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search by keyword, verse, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 text-xs h-9 rounded-full bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Date & Media Type Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/50">
            {/* Date Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Date:
              </span>
              {DATE_FILTERS.map((df) => {
                const isSelected = selectedDateFilter === df.id;
                return (
                  <button
                    key={df.id}
                    type="button"
                    onClick={() => setSelectedDateFilter(df.id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {df.label}
                  </button>
                );
              })}
            </div>

            {/* Media Type Toggle */}
            <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-full border border-border">
              <button
                type="button"
                onClick={() => setSelectedMediaType("all")}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                  selectedMediaType === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Formats
              </button>
              <button
                type="button"
                onClick={() => setSelectedMediaType("text")}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                  selectedMediaType === "text"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                Text
              </button>
              <button
                type="button"
                onClick={() => setSelectedMediaType("voice")}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                  selectedMediaType === "voice"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Headphones className="w-3 h-3" />
                Audio
              </button>
            </div>
          </div>

          {/* Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {TAG_FILTERS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-card border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── DEVOTION CARDS GRID ─── */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/50 bg-card p-4 animate-pulse space-y-3"
                >
                  <div className="h-44 bg-muted rounded-xl" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDevotions.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-card p-6">
              <Filter className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <h4 className="text-base font-semibold text-foreground">
                No devotions found
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                No devotional reflections match your active filters or search query &ldquo;{searchQuery}&rdquo;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTag("All");
                  setSelectedDateFilter("all");
                  setSelectedMediaType("all");
                  setSearchQuery("");
                }}
                className="rounded-full text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDevotions.map((item) => {
                const id = item._id || item.id || "";
                const isLiked = Boolean(likedMap[id]) || Boolean(item.isLiked);
                const isSaved = Boolean(savedMap[id]) || Boolean(item.isSaved);
                const currentLikes = likesCountMap[id] ?? item.likes ?? 0;

                return (
                  <article
                    key={id}
                    className="group rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  >
                    {/* Card Cover */}
                    <Link
                      href={`/devotions/${id}`}
                      className="relative h-44 w-full overflow-hidden bg-muted block"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      {/* Format Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md ${
                            item.type === "voice"
                              ? "bg-primary text-primary-foreground"
                              : "bg-black/60 text-white border border-white/10"
                          }`}
                        >
                          {item.type === "voice" ? (
                            <>
                              <Headphones className="w-3 h-3" />
                              Audio {item.duration || "Meditation"}
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3" />
                              {item.duration || "4 min read"}
                            </>
                          )}
                        </span>
                      </div>

                      {/* Date Badge on bottom right */}
                      <span className="absolute bottom-2.5 right-3 text-[11px] font-medium text-white/90">
                        {item.date}
                      </span>
                    </Link>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {item.scriptureReference && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                            <BookOpen className="w-3 h-3" />
                            <span>{item.scriptureReference}</span>
                          </div>
                        )}

                        <h4 className="text-base font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          <Link href={`/devotions/${id}`}>{item.title}</Link>
                        </h4>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.caption || item.content}
                        </p>
                      </div>

                      {/* Footer: Author & Interactive Like/Bookmark Actions */}
                      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-foreground truncate">
                            {item.author}
                          </span>
                          {item.actorType === "official" && (
                            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>

                        {/* Interactive Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                          <button
                            type="button"
                            onClick={(e) => handleArchiveLike(item, e)}
                            className={`p-1 rounded-full transition-all ${
                              isLiked ? "text-red-500" : "hover:text-foreground"
                            }`}
                            title="Like"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isLiked ? "fill-red-500 text-red-500" : ""
                              }`}
                            />
                          </button>
                          <span>{currentLikes}</span>

                          <button
                            type="button"
                            onClick={(e) => handleArchiveBookmark(item, e)}
                            className={`p-1 rounded-full transition-all ${
                              isSaved ? "text-primary" : "hover:text-foreground"
                            }`}
                            title="Bookmark"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isSaved ? "fill-primary text-primary" : ""
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleShare(item, e)}
                            className="p-1 rounded-full hover:text-foreground"
                            title="Share link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── APPLY TO WRITE DEVOTIONALS INVITATION SECTION ─── */}
        <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.05] p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
            <PenLine className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Has God Placed a Word on Your Heart?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every week, 4 Kilo Fellowship students, graduates, and ministry leaders
              share quiet time scriptures and prayer reflections. Apply to write devotionals.
            </p>
          </div>
          <div>
            <Button
              type="button"
              onClick={() => setWriterModalOpen(true)}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm h-10 px-6 font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <PenLine className="w-4 h-4 mr-2" />
              Apply to Write Devotionals
            </Button>
          </div>
        </section>
      </main>

      {/* Writer Modal */}
      <DevotionWriterModal
        open={writerModalOpen}
        onOpenChange={setWriterModalOpen}
      />
    </div>
  );
}
