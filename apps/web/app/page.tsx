"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Flame,
  HeartHandshake,
  MapPin,
  Play,
  Users,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/siteConfig";
import {
  fetchLiveLandingData,
  type LiveCommunityPost,
  type LiveDevotion,
  type LiveEvent,
  type LiveProgram,
  type LiveTeam,
} from "@/lib/live-fellowship-data";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [todayDevotion, setTodayDevotion] = useState<LiveDevotion | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [programs, setPrograms] = useState<LiveProgram[]>([]);
  const [teams, setTeams] = useState<LiveTeam[]>([]);
  const [featuredPost, setFeaturedPost] = useState<LiveCommunityPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveLandingData()
      .then((data) => {
        if (cancelled) return;
        setTodayDevotion(data.devotion);
        setEvents(data.events);
        setPrograms(data.programs);
        setTeams(data.teams);
        setFeaturedPost(data.featuredPost);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nextEvent = events[0] ?? null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* 1. EDITORIAL HERO */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {siteConfig.shortCampus}
            </p>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
              Where 4 Kilo students
              <br />
              gather,{" "}
              <span className="inline-block rounded-2xl bg-primary/12 px-3.5 py-0.5 text-primary ring-1 ring-primary/20">
                grow in faith
              </span>
              ,
              <br />
              and walk together.
            </h1>

            <p className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Daily morning devotionals, campus prayer cells, weekly gatherings,
              and transparent student meal support in one place.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 px-7 text-sm font-semibold shadow-sm"
              >
                <Link href="/community">
                  Open community feed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-full border-border/80 px-7 text-sm font-semibold hover:bg-muted/50"
              >
                <Link href="/devotions">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  Read today&apos;s devotion
                </Link>
              </Button>
            </div>
          </div>

          {/* 2. LIVE INTERACTIVE PHONE & CAMPUS SHOWCASE CANVAS */}
          <div className="relative mt-12 sm:mt-16 rounded-[2rem] border border-primary/20 bg-linear-to-br from-orange-500 via-orange-600 to-amber-700 dark:from-orange-950 dark:via-neutral-900 dark:to-neutral-950 p-6 sm:p-10 md:p-12 overflow-hidden shadow-xl">
            <div
              className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>{siteConfig.fellowshipName}</span>
              </div>

              <div className="hidden sm:flex flex-wrap items-center gap-2">
                {["Daily Quiet Time", "Campus Feed", "Weekly Programs", "Meal Fund"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/95 dark:bg-neutral-900/90 px-3 py-1 text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 shadow-xs"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Live Student Reflection Card */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 shadow-lg border border-white/40 dark:border-neutral-800 space-y-3">
                  {loading ? (
                    <div className="space-y-2.5">
                      <Skeleton className="h-9 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ) : featuredPost ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-orange-100 dark:bg-orange-950/60 text-primary font-bold text-xs flex items-center justify-center">
                            {getInitials(featuredPost.authorName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1 truncate">
                              {featuredPost.authorName}
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {featuredPost.authorRole || "4 Kilo Fellowship"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-3">
                        {featuredPost.body}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-neutral-500">
                        <span className="text-primary font-semibold">
                          {featuredPost.likesCount} likes
                        </span>
                        <span>{featuredPost.repliesCount} replies</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Student community feed
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Share prayer requests, scripture reflections, and campus
                        encouragement with fellow students.
                      </p>
                      <Link
                        href="/community"
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                      >
                        Visit community
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="hidden lg:flex items-center justify-between rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 px-4 py-3 text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Morning quiet time</p>
                      <p className="text-[11px] text-white/75">
                        Synced across Android and Web
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/devotions"
                    className="text-xs font-semibold text-amber-300 hover:underline"
                  >
                    Open
                  </Link>
                </div>
              </div>

              {/* Center Phone Frame Mockup (Live Devotion) */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-full max-w-[290px] rounded-[2.4rem] border-[6px] border-neutral-950 bg-neutral-950 p-1.5 shadow-2xl">
                  <div className="rounded-[2rem] bg-white dark:bg-neutral-900 overflow-hidden">
                    <div className="flex justify-center pt-2.5 pb-2 bg-white dark:bg-neutral-900">
                      <div className="h-4 w-20 rounded-full bg-neutral-950" />
                    </div>

                    <div className="px-4 pb-5 space-y-3.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          Today&apos;s Devotion
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <Flame className="h-3 w-3" /> Live
                        </span>
                      </div>

                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : todayDevotion ? (
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2">
                            {todayDevotion.title}
                          </h3>
                          {todayDevotion.scripture && (
                            <p className="text-[11px] font-medium text-neutral-500">
                              {todayDevotion.scripture}
                            </p>
                          )}
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3 italic">
                            &quot;{todayDevotion.verseText}&quot;
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                            Daily Scripture & Audio
                          </h3>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            Read and listen to daily reflections written by 4 Kilo
                            students and mentors.
                          </p>
                        </div>
                      )}

                      <div className="rounded-xl bg-neutral-100 dark:bg-neutral-800 p-2.5 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            Audio reflection
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            Listen in the devotion library
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        asChild
                        className="w-full h-9 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                      >
                        <Link href="/devotions">Open full reflection</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Campus Event & Welfare Card */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 shadow-lg border border-white/40 dark:border-neutral-800 space-y-2.5">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : nextEvent ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Upcoming
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-500 truncate">
                          {nextEvent.date}
                          {nextEvent.time ? ` · ${nextEvent.time}` : ""}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                        {nextEvent.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{nextEvent.location}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Campus events
                      </span>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Weekly fellowship gatherings
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        See upcoming worship nights, Bible studies, and campus
                        conferences.
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 shadow-lg border border-white/40 dark:border-neutral-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                      Student meal fund
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Direct cafeteria support via Chapa
                    </p>
                  </div>
                  <Link
                    href="/givings"
                    className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary hover:text-white transition-colors"
                    aria-label="Open student meal fund"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAMPUS PILLARS (Zero hardcoded fake numbers) */}
      <section className="py-16 md:py-20 border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Life at Arat Kilo
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built by students, for the actual week on campus.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/devotions"
              className="group rounded-3xl bg-primary text-primary-foreground p-7 flex flex-col justify-between min-h-[200px] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Morning quiet time
              </span>
              <div className="space-y-1.5 pt-6">
                <p className="text-2xl font-bold tracking-tight flex items-center justify-between">
                  Daily Devotionals
                  <ArrowUpRight className="h-5 w-5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </p>
                <p className="text-sm text-white/85 leading-relaxed">
                  Short daily Scripture meditations in Amharic and English
                  written by students and mentors before morning classes.
                </p>
              </div>
            </Link>

            <Link
              href="/programs"
              className="group rounded-3xl border border-border/80 bg-card p-7 flex flex-col justify-between min-h-[200px] hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Campus rhythm
              </span>
              <div className="space-y-1.5 pt-6">
                <p className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                  {programs.length > 0
                    ? `${programs.length} Weekly Programs`
                    : "Weekly Gatherings"}
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dorm prayer watches, department Bible studies, and our Friday
                  fellowship gathering open to every student.
                </p>
              </div>
            </Link>

            <Link
              href="/givings"
              className="group rounded-3xl border border-border/80 bg-card p-7 flex flex-col justify-between min-h-[200px] hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mutual aid
              </span>
              <div className="space-y-1.5 pt-6">
                <p className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                  Student Meal Fund
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Direct contributions via Chapa and Telebirr supporting
                  cafeteria meal tickets and emergency student welfare.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. LIVE WEEKLY SCHEDULE & NEXT GATHERING */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Next Event */}
            <div className="lg:col-span-5 space-y-5">
              <Badge
                variant="outline"
                className="rounded-full border-primary/30 text-primary text-[11px] font-semibold px-3 py-0.5"
              >
                Next campus gathering
              </Badge>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-4/5" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : nextEvent ? (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    {nextEvent.title}
                  </h2>
                  {nextEvent.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {nextEvent.description}
                    </p>
                  )}

                  <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3 text-sm">
                    <div className="flex items-center gap-2.5 text-foreground font-medium">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        {nextEvent.date}
                        {nextEvent.time ? ` · ${nextEvent.time}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>{nextEvent.location}</span>
                    </div>
                    {nextEvent.speaker && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <span>Speaker: {nextEvent.speaker}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Campus events & conferences
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Check the events calendar for upcoming Friday fellowships,
                    worship evenings, and semester retreats at 4 Kilo.
                  </p>
                </>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  asChild
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-10 text-xs font-semibold"
                >
                  <Link href="/events">View all events</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full px-5 h-10 text-xs font-semibold"
                >
                  <Link href="/programs">Full weekly timetable</Link>
                </Button>
              </div>
            </div>

            {/* Live Weekly Timetable */}
            <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Weekly fellowship timetable
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live schedule from campus coordinators
                  </p>
                </div>
                <Link
                  href="/programs"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  All programs
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <Skeleton key={idx} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              ) : programs.length > 0 ? (
                <div className="space-y-3">
                  {programs.map((prog) => (
                    <div
                      key={prog.id}
                      className="rounded-2xl border border-border/60 bg-muted/15 hover:bg-muted/35 transition-colors p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[10px] font-semibold px-2.5"
                          >
                            {prog.dayOfWeek}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">
                            {prog.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {prog.startTime}
                          {prog.endTime ? ` to ${prog.endTime}` : ""} ·{" "}
                          {prog.location}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        Weekly
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Weekly programs are updated each semester
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open the programs page to view the full campus timetable.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full mt-2"
                  >
                    <Link href="/programs">Open timetable</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. LIVE MINISTRY TEAMS */}
      <section className="py-16 md:py-20 border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Serve together
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Ministry teams you can join
              </h2>
            </div>
            <Link
              href="/teams"
              className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Explore all teams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((idx) => (
                <Skeleton key={idx} className="h-44 w-full rounded-2xl" />
              ))}
            </div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className="rounded-2xl border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <CardTitle className="text-base font-bold">
                        {team.name}
                      </CardTitle>
                      {typeof team.memberCount === "number" && (
                        <Badge
                          variant="secondary"
                          className="rounded-full text-[10px] font-medium shrink-0"
                        >
                          {team.memberCount} students
                        </Badge>
                      )}
                    </div>
                    {team.description && (
                      <CardDescription className="text-xs leading-relaxed line-clamp-3">
                        {team.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {(team.meetingTime || team.meetingLocation) && (
                      <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border/60 pt-3">
                        {team.meetingTime && (
                          <div>
                            Meets:{" "}
                            <span className="font-medium text-foreground">
                              {team.meetingTime}
                            </span>
                          </div>
                        )}
                        {team.meetingLocation && (
                          <div>
                            Venue:{" "}
                            <span className="font-medium text-foreground">
                              {team.meetingLocation}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full rounded-full text-xs h-9 font-semibold"
                    >
                      <Link href="/teams">Apply to join</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Ministry teams directory
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Browse active worship, prayer, Bible study, outreach, and
                student welfare teams on the teams page.
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full mt-2"
              >
                <Link href="/teams">Browse teams</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 6. DARK EDITORIAL CLOSING CTA BANNER */}
      <section className="py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="relative mx-auto max-w-6xl rounded-[2rem] bg-neutral-950 text-white p-8 sm:p-14 overflow-hidden border border-neutral-800">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-orange-400">
                <HeartHandshake className="h-4 w-4" />
                Open to every student
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Come as you are to our weekly campus fellowship.
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Whether you just moved into freshman dorms or are finishing your
                final thesis, you have a place here. Join the web community or
                message our Telegram bot.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full bg-primary hover:bg-primary/90 text-white px-7 font-semibold"
              >
                <Link href="/community">Join community</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-full border-neutral-700 bg-transparent text-white hover:bg-neutral-900 hover:text-white px-6 font-semibold"
              >
                <a
                  href={siteConfig.links.telegramBot}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram bot
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div
            className="pointer-events-none select-none mt-10 text-center text-[13vw] sm:text-[96px] font-black tracking-tighter leading-none text-white/[0.04]"
            aria-hidden="true"
          >
            4 KILO ECSF
          </div>
        </div>
      </section>
    </div>
  );
}
