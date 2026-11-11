"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Devotion,
} from "@/types/devotion";
import {
  fetchDevotionById,
  recordDevotionView,
  toggleDevotionLike,
  DEFAULT_DEVOTIONS,
} from "@/lib/devotions-api";
import { DevotionAudioPlayer } from "@/components/devotions/DevotionAudioPlayer";
import { DevotionComments } from "@/components/devotions/DevotionComments";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Check,
  ShieldCheck,
  BookOpen,
  Headphones,
  Type,
  Sparkles,
  Quote,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DevotionPageProps {
  params: Promise<{ id: string }>;
}

export default function DevotionDetailPage({ params }: DevotionPageProps) {
  const resolvedParams = use(params);
  const devotionId = resolvedParams.id;

  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Typography reading settings
  const [isSerif, setIsSerif] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchDevotionById(devotionId)
      .then((res) => {
        if (isMounted && res.data) {
          setDevotion(res.data);
          setLikesCount(res.data.likes || 0);
          setIsLiked(Boolean(res.data.isLiked));
          setIsLoading(false);

          // Track public view
          recordDevotionView(res.data._id || res.data.id || devotionId);
        }
      })
      .catch((err) => {
        console.error("Failed to load devotion:", err);
        if (isMounted) setIsLoading(false);
      });

    // Check saved state from localStorage
    if (typeof window !== "undefined") {
      const savedKey = `saved_devotion_${devotionId}`;
      setIsSaved(localStorage.getItem(savedKey) === "true");
      const likedKey = `devotion_like_${devotionId}`;
      if (localStorage.getItem(likedKey) === "true") {
        setIsLiked(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [devotionId]);

  // Handle like toggle
  const handleLike = async () => {
    if (!devotion) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleDevotionLike(devotion._id || devotion.id || devotionId);
      setIsLiked(res.liked);
      if (res.likes !== undefined) {
        setLikesCount(res.likes);
      }
      toast.success(res.liked ? "Liked devotional" : "Unliked");
    } catch {
      // Revert if failed
    }
  };

  // Handle bookmark toggle
  const handleSaveToggle = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (typeof window !== "undefined") {
      localStorage.setItem(`saved_devotion_${devotionId}`, String(nextSaved));
    }
    toast.success(
      nextSaved
        ? "Saved to your quiet time bookmarks"
        : "Removed from bookmarks",
    );
  };

  // Handle share link
  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: devotion?.title || "Daily Devotional",
          text: `Daily Devotion: "${devotion?.title}" — AAU 4-Kilo Fellowship`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
        return;
      }
    } catch {}

    // Fallback: clipboard copy
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Devotion link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-64 sm:h-80 bg-muted rounded-2xl" />
          <div className="h-8 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!devotion) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-foreground">Devotion Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          The devotional reflection you are looking for may have been moved or
          updated.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/devotions">Back to Daily Devotions</Link>
        </Button>
      </div>
    );
  }

  // Format paragraphs from content
  const contentParagraphs = (devotion.content || devotion.caption || "")
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  // Font size class mapping
  const fontSizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed sm:text-[17px] sm:leading-loose",
    lg: "text-lg leading-loose sm:text-xl",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ─── STICKY TOP NAV ─── */}
      <div className="sticky top-0 z-30 border-b border-border/80 bg-card/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground -ml-2"
          >
            <Link href="/devotions">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Devotions
            </Link>
          </Button>

          {/* Quick Reader Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Serif / Sans Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSerif(!isSerif)}
              className={`h-8 px-2 text-xs font-mono transition-colors ${
                isSerif
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Serif font for quiet reading"
            >
              <Type className="w-3.5 h-3.5 mr-1" />
              {isSerif ? "Serif" : "Sans"}
            </Button>

            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center rounded-lg border border-border/70 p-0.5 bg-secondary/50 text-xs">
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  fontSize === "sm"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize("base")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  fontSize === "base"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  fontSize === "lg"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                A+
              </button>
            </div>

            {/* Bookmark button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSaveToggle}
              className={`h-8 w-8 ${
                isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Bookmark devotion"
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-primary" : ""}`}
              />
            </Button>

            {/* Share button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Share devotion link"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* ─── DEVOTIONAL HEADER ─── */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {devotion.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {devotion.type === "voice" ? (
                <>
                  <Headphones className="w-3.5 h-3.5 text-primary" />
                  {devotion.duration || "Audio Devotion"}
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  {devotion.duration || "4 min read"}
                </>
              )}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {devotion.viewsFormatted || devotion.views} views
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {devotion.title}
          </h1>

          {/* Author attribution row */}
          <div className="pt-2 flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              {devotion.authorAvatar ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
                  <Image
                    src={devotion.authorAvatar}
                    alt={devotion.author}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {devotion.author.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    {devotion.author}
                  </span>
                  {devotion.actorType === "official" && (
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{devotion.authorRole || "Fellowship Contributor"}</span>
                  {devotion.authorHandle && (
                    <>
                      <span>•</span>
                      <span>{devotion.authorHandle}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Like Counter Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={`text-xs h-8 px-3 rounded-full gap-1.5 transition-colors ${
                isLiked
                  ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                  : "border-border hover:border-red-500/40 text-muted-foreground"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{likesCount}</span>
            </Button>
          </div>
        </header>

        {/* ─── COVER BANNER ─── */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden border border-border/80 bg-muted">
          <Image
            src={devotion.image}
            alt={devotion.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* ─── AUDIO PLAYER BAR (If voice devotion or audioUrl is present) ─── */}
        {devotion.audioUrl && (
          <section className="space-y-2">
            <DevotionAudioPlayer
              audioUrl={devotion.audioUrl}
              title={devotion.title}
              author={devotion.author}
              duration={devotion.duration}
              variant="inline"
            />
          </section>
        )}

        {/* ─── SCRIPTURE ANCHOR QUOTE BLOCK ─── */}
        {devotion.scriptureText && (
          <section className="relative rounded-2xl border border-primary/30 bg-primary/[0.04] p-5 sm:p-6 shadow-xs overflow-hidden">
            <Quote className="absolute -right-3 -bottom-3 w-20 h-20 text-primary/10 -rotate-12 pointer-events-none" />
            <div className="relative space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scripture Anchor — {devotion.scriptureReference}</span>
              </div>
              <blockquote className="text-base sm:text-lg font-medium italic text-foreground leading-relaxed pl-1">
                {devotion.scriptureText}
              </blockquote>
            </div>
          </section>
        )}

        {/* ─── DEVOTIONAL BODY TEXT ─── */}
        <div
          className={`space-y-5 text-foreground/90 transition-all ${fontSizeClasses[fontSize]} ${
            isSerif ? "font-serif" : "font-sans"
          }`}
        >
          {contentParagraphs.map((paragraph, idx) => (
            <p key={idx} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* ─── PRAYER & QUIET TIME REFLECTION SECTION ─── */}
        <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Prayer & Daily Meditation</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Take two minutes in quietness before the Lord. Bring today&apos;s
              fellowship word into your campus life, studies, and relationships:
            </p>

            <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 text-xs sm:text-sm italic text-foreground leading-relaxed">
              {devotion.prayer ||
                `“ጌታ ሆይ፤ የሰማሁትን ቃል በልቤ አኑረው። በዛሬው ቀኔ ውስጥ እርምጃዬን በቃልህ ምራው፤ ክርስቶስን በሕይወቴ ለመግለጥ ጸጋህን ስጠኝ። አሜን።”`}
            </div>
          </div>

          {/* Tags */}
          {devotion.tags && devotion.tags.length > 0 && (
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Tags:</span>
              {devotion.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* ─── BOTTOM SHARE & ENGAGEMENT BAR ─── */}
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="w-4 h-4 text-primary fill-primary" />
            <span>Encourage a brother or sister on campus today</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs h-8 gap-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  Share Devotion
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveToggle}
              className="text-xs h-8 gap-1.5"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isSaved ? "fill-primary text-primary" : ""}`}
              />
              {isSaved ? "Bookmarked" : "Save"}
            </Button>
          </div>
        </div>

        {/* ─── COMMUNITY REFLECTIONS & COMMENTS ─── */}
        <DevotionComments
          devotionId={devotion._id || devotion.id || devotionId}
          devotionTitle={devotion.title}
        />

        {/* ─── NEXT DEVOTIONS RECOMMENDATION ─── */}
        <section className="pt-8 border-t border-border/80 space-y-4">
          <h3 className="text-base font-bold text-foreground">
            More Daily Devotionals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEFAULT_DEVOTIONS.filter(
              (d) => (d._id || d.id) !== (devotion._id || devotion.id),
            )
              .slice(0, 2)
              .map((item) => {
                const id = item._id || item.id;
                return (
                  <Link
                    key={id}
                    href={`/devotions/${id}`}
                    className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xs transition-all flex items-start gap-3 group"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-primary font-medium">
                        {item.date} • {item.duration}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.scriptureReference}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      </article>
    </div>
  );
}
