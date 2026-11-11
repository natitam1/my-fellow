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
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Voice",
  "Text",
  "Faith",
  "Prayer",
  "Wisdom",
  "Hope",
  "Patience",
  "Grace",
  "Fellowship",
];

export default function DevotionsPage() {
  const { user, isAdmin } = useAuth();

  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 4,
    longestStreak: 12,
  });
  const [streakCheckedToday, setStreakCheckedToday] = useState(false);
  const [writerModalOpen, setWriterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Devotions & Streak
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchDevotions(), fetchUserStreak()])
      .then(([devotionsRes, streakData]) => {
        if (isMounted) {
          if (devotionsRes.data) {
            setDevotions(devotionsRes.data);
          }
          if (streakData) {
            setStreak(streakData);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading devotions:", err);
        if (isMounted) setIsLoading(false);
      });

    // Check if streak was already logged today
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

  // Today's Devotion (Featured or first item)
  const todayDevotion = useMemo(() => {
    if (!devotions.length) return null;
    return devotions.find((d) => d.featured) || devotions[0];
  }, [devotions]);

  // Filtered Archive Devotions
  const filteredDevotions = useMemo(() => {
    return devotions.filter((d) => {
      // Category filter
      if (selectedCategory === "Voice" && d.type !== "voice") return false;
      if (selectedCategory === "Text" && d.type !== "text") return false;
      if (
        selectedCategory !== "All" &&
        selectedCategory !== "Voice" &&
        selectedCategory !== "Text"
      ) {
        const hasTag = d.tags?.some(
          (t) => t.toLowerCase() === selectedCategory.toLowerCase(),
        );
        if (!hasTag) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesAuthor = d.author.toLowerCase().includes(query);
        const matchesScripture = d.scriptureReference
          ?.toLowerCase()
          .includes(query);
        const matchesTags = d.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesContent = d.content?.toLowerCase().includes(query);
        return (
          matchesTitle ||
          matchesAuthor ||
          matchesScripture ||
          matchesTags ||
          matchesContent
        );
      }

      return true;
    });
  }, [devotions, selectedCategory, searchQuery]);

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
      toast.error("Could not record streak check-in.");
    }
  };

  const isLeaderOrAdmin = isAdmin || user?.role === "leader";

  return (
    <div className="min-h-screen bg-background">
      {/* ─── TOP HEADER BAR ─── */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                Daily Devotionals
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  ECSF
                </span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                AAU 4-Kilo Fellowship Quiet Time & Audio Meditations
              </p>
            </div>
          </div>

          {/* Action Button: Writer / Admin */}
          <div className="flex items-center gap-2">
            {isLeaderOrAdmin ? (
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9">
                <Link href="/admin/devotions/new">
                  <PenLine className="w-3.5 h-3.5 mr-1.5" />
                  Write Devotion
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setWriterModalOpen(true)}
                className="text-xs h-9 border-primary/30 hover:border-primary/60 text-foreground hover:bg-primary/5"
              >
                <PenLine className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Become a Writer
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* ─── STREAK COUNTER BANNER ─── */}
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.07] via-background to-primary/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Flame className="w-6 h-6 fill-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {streak.currentStreak} Day Streak
                </span>
                <Badge variant="outline" className="text-[10px] bg-background/80 border-primary/30 text-primary font-mono">
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
            className={`text-xs h-9 font-medium transition-all ${
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

        {/* ─── TODAY'S DEVOTION HERO BANNER ─── */}
        {todayDevotion && (
          <section className="relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-sm group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Cover Image Banner */}
              <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-auto min-h-[260px] overflow-hidden bg-muted">
                <Image
                  src={todayDevotion.image}
                  alt={todayDevotion.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:hidden" />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Today&apos;s Devotion
                  </span>
                  {todayDevotion.type === "voice" && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                      <Headphones className="w-3 h-3 text-primary" />
                      {todayDevotion.duration || "Audio"}
                    </span>
                  )}
                </div>
              </div>

              {/* Devotional Details */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{todayDevotion.date}</span>
                    <span>•</span>
                    <span>{todayDevotion.duration || "5 min read"}</span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      <Link href={`/devotions/${todayDevotion._id || todayDevotion.id}`}>
                        {todayDevotion.title}
                      </Link>
                    </h2>

                    {todayDevotion.scriptureReference && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-md">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{todayDevotion.scriptureReference}</span>
                      </div>
                    )}
                  </div>

                  {todayDevotion.scriptureText && (
                    <blockquote className="border-l-2 border-primary/60 pl-3 py-0.5 text-xs sm:text-sm italic text-foreground/85 line-clamp-2">
                      {todayDevotion.scriptureText}
                    </blockquote>
                  )}

                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {todayDevotion.caption || todayDevotion.content}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Author / Actor Badge */}
                  <div className="flex items-center gap-2.5">
                    {todayDevotion.authorAvatar ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                        <Image
                          src={todayDevotion.authorAvatar}
                          alt={todayDevotion.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {todayDevotion.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {todayDevotion.author}
                        </span>
                        {todayDevotion.actorType === "official" && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {todayDevotion.authorRole || "Fellowship Contributor"}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 rounded-xl shadow-sm w-full sm:w-auto">
                    <Link href={`/devotions/${todayDevotion._id || todayDevotion.id}`}>
                      {todayDevotion.type === "voice" ? (
                        <>
                          <Headphones className="w-3.5 h-3.5 mr-1.5" />
                          Listen & Read
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                          Read Devotion
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
                  ({filteredDevotions.length})
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Filter by theme, listen to audio reflections, or search Scriptures
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search by topic, verse, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 text-xs h-9 bg-card"
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

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat === "Voice" && <Headphones className="w-3 h-3 inline mr-1" />}
                  {cat === "Text" && <BookOpen className="w-3 h-3 inline mr-1" />}
                  {cat}
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
                No devotions match your active filter &ldquo;{selectedCategory}&rdquo; or query &ldquo;{searchQuery}&rdquo;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDevotions.map((item) => {
                const id = item._id || item.id;
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md ${
                            item.type === "voice"
                              ? "bg-primary text-primary-foreground"
                              : "bg-black/60 text-white"
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

                      {/* Date on bottom right */}
                      <span className="absolute bottom-2.5 right-3 text-[11px] font-medium text-white/90">
                        {item.date}
                      </span>
                    </Link>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {item.scriptureReference && (
                          <span className="text-[11px] font-medium text-primary">
                            {item.scriptureReference}
                          </span>
                        )}

                        <h4 className="text-base font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          <Link href={`/devotions/${id}`}>{item.title}</Link>
                        </h4>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.caption || item.content}
                        </p>
                      </div>

                      {/* Footer: Author & Stats */}
                      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-foreground truncate">
                            {item.author}
                          </span>
                          {item.actorType === "official" && (
                            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.viewsFormatted || item.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500 fill-red-500/20" />
                            {item.likesFormatted || item.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── BECOME A WRITER INVITATION CARD ─── */}
        <section className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <PenLine className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Has God Placed a Word on Your Heart?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every week, student fellowship members and leaders contribute
              daily quiet time reflections. Apply to become an approved devotion writer.
            </p>
          </div>
          <div>
            <Button
              type="button"
              onClick={() => setWriterModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 px-5 rounded-xl shadow-sm"
            >
              <PenLine className="w-3.5 h-3.5 mr-1.5" />
              Become a Devotion Writer
            </Button>
          </div>
        </section>
      </div>

      {/* Writer Modal */}
      <DevotionWriterModal
        open={writerModalOpen}
        onOpenChange={setWriterModalOpen}
      />
    </div>
  );
}
