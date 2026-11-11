"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Calendar,
  Heart,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Quote,
  Flame,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DevotionIsoFigure,
  CommunityIsoFigure,
  GivingIsoFigure,
  EventsIsoFigure,
  StoreIsoFigure,
  AdminIsoFigure,
} from "@/components/landing/IsometricFigures";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"devotions" | "community" | "givings" | "events">("devotions");

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 selection:bg-primary/20">
      {/* ── 1. MINIMAL SLEEK HERO SECTION ── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white">
        {/* Subtle dot matrix grid background */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/90 bg-white text-neutral-700 text-xs font-medium tracking-tight shadow-xs mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span>Addis Ababa University</span>
            <span className="text-neutral-300">•</span>
            <span className="text-primary font-semibold">4 Kilo Fellowship</span>
          </div>

          {/* Clean Sharp Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-neutral-900 leading-[1.08] max-w-4xl mx-auto text-balance">
            Growing in Christ.
            <br />
            <span className="text-neutral-400 font-normal">Walking in Purpose.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            The official digital ecosystem for AAU 4 Kilo Christian Students Fellowship.
            Daily Scripture audio, student testimonies, weekly gatherings, and campus welfare in one place.
          </p>

          {/* Call to action fully-rounded buttons with ripple */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="rounded-full font-medium">
              <Link href="/devotions">
                <BookOpen className="mr-2 h-4 w-4" />
                Read Today&apos;s Devotion
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link href="/community">
                <Users className="mr-2 h-4 w-4" />
                Explore Community
              </Link>
            </Button>
          </div>

          {/* Hero Centered Architectural Showcase Graphic */}
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="relative rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>4KILO_ECSF_PLATFORM_V2</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                  <span>ONLINE // VERIFIED</span>
                </div>
              </div>

              {/* Devotion Audio Bar Spotlight */}
              <div className="rounded-2xl bg-white border border-neutral-200 p-5 text-left shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                      Daily Devotion
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">Today • Ephesians 4:1-3</span>
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900">
                    Walking Worthy of the Calling
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md line-clamp-1">
                    &quot;I urge you to walk in a manner worthy of the calling to which you have been called...&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button size="sm" asChild className="rounded-full">
                    <Link href="/devotions">
                      <Headphones className="h-3.5 w-3.5 mr-1.5" />
                      Listen Stream
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST / CAMPUS MINISTRY STRIP ── */}
      <section className="py-10 border-y border-neutral-200/60 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">
            Serving 1,200+ Students Across AAU 4 Kilo Campus Departments
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
              <div className="text-xl font-bold text-neutral-900">8 Teams</div>
              <div className="text-xs text-neutral-500 mt-0.5">Ministry Wings</div>
            </div>
            <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
              <div className="text-xl font-bold text-neutral-900">365 Days</div>
              <div className="text-xs text-neutral-500 mt-0.5">Devotional Series</div>
            </div>
            <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
              <div className="text-xl font-bold text-neutral-900">100% Free</div>
              <div className="text-xs text-neutral-500 mt-0.5">Open Source</div>
            </div>
            <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
              <div className="text-xl font-bold text-neutral-900">Telebirr & CBE</div>
              <div className="text-xs text-neutral-500 mt-0.5">Student Welfare Fund</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ODELLA SIGNATURE 6-CARD BENTO GRID ── */}
      <section className="py-20 md:py-28 bg-white border-b border-neutral-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Odella Headline Rhythm */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              <span>UNIFIED CAMPUS PLATFORM</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.15]">
              Worship. Fellowship.
              <br />
              Discipleship. <span className="text-neutral-400 font-normal">And Service.</span>
            </h2>
            <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Every tool, ministry resource, and administrative capability built specifically for the Christian students of Addis Ababa University 4 Kilo Campus.
            </p>
          </div>

          {/* 6-Card Bento Grid (2x3 or 3x2 responsive) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Card 1: Devotions & Audio */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group">
              <div className="w-full flex items-center justify-center mb-6">
                <DevotionIsoFigure />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                  In Your Quiet Time
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                  Daily Scripture readings written by campus leaders, peer audio narration, and reflection prompts to keep you grounded before lectures begin.
                </p>
                <div className="pt-2">
                  <Link
                    href="/devotions"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Read Devotionals <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Actor Community Feed */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group">
              <div className="w-full flex items-center justify-center mb-6">
                <CommunityIsoFigure />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Unified Campus Voices
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                  Post prayer requests, praise reports, and campus announcements. Express yourself as a student or post verified updates on behalf of your ministry wing.
                </p>
                <div className="pt-2">
                  <Link
                    href="/community"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Join Campus Feed <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Student Welfare & Transparent Giving */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group">
              <div className="w-full flex items-center justify-center mb-6">
                <GivingIsoFigure />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Direct Student Welfare
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                  Contribute directly to cafeteria meal cards, emergency medical support, and campus welfare via Telebirr or CBE Birr with zero administrative overhead.
                </p>
                <div className="pt-2">
                  <Link
                    href="/givings"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Give Transparently <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 4: Conferences & Gatherings */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group">
              <div className="w-full flex items-center justify-center mb-6">
                <EventsIsoFigure />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Conferences & Passes
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                  Register for the Annual Spiritual Retreat, Friday acoustic worship, and dorm Bible study circles. Receive instant digital passes with scannable barcodes.
                </p>
                <div className="pt-2">
                  <Link
                    href="/events"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Reserve Your Seat <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 5: Campus Store & Literature */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group">
              <div className="w-full flex items-center justify-center mb-6">
                <StoreIsoFigure />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Campus Literature & Merch
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                  Access subsidized study Bibles, fellowship hoodies, Christian literature, and songbooks delivered straight within the 4 Kilo campus grounds.
                </p>
                <div className="pt-2">
                  <Link
                    href="/store"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Browse Fellowship Store <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 6: Mission-Critical Admin */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-xs group">
              <div className="w-full flex items-center justify-center mb-6">
                <AdminIsoFigure />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                  Integrated Admin Back-Office
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                  Fellowship executives manage student registries, devotion schedules, welfare disbursements, and content approvals in one central back-office.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Access Admin Portal <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. THE 8 MINISTRY TEAMS BENTO ── */}
      <section className="py-20 border-t border-neutral-200/60 bg-neutral-50/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Serve in Fellowship
            </h2>
            <p className="text-sm text-neutral-600">
              Discover your calling alongside campus peers in one of our 8 active ministry teams.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Worship Team", desc: "Leading weekly praise & acoustic worship gatherings." },
              { name: "Prayer & Intercession", desc: "Standing in early morning prayer for AAU students." },
              { name: "Media & Sound", desc: "Recording devotion audios, camera, and sound desk." },
              { name: "Charity & Welfare", desc: "Providing meal tickets and welfare to students in need." },
              { name: "Literature & Books", desc: "Distributing Bibles, Christian books, and study guides." },
              { name: "Discipleship", desc: "Mentoring freshmen and building dorm Bible circles." },
              { name: "Counseling", desc: "Confidential pastoral guidance and academic advice." },
              { name: "Technical & Web", desc: "Maintaining open-source fellowship apps and bots." },
            ].map((team) => (
              <div
                key={team.name}
                className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:border-primary/50 transition-colors shadow-2xs space-y-2"
              >
                <div className="text-sm font-bold text-neutral-900">{team.name}</div>
                <p className="text-xs text-neutral-500 leading-relaxed">{team.desc}</p>
                <Link
                  href="/teams"
                  className="inline-flex items-center text-[11px] font-semibold text-primary hover:underline pt-1"
                >
                  Join Wing <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FINAL SLEEK CTA SECTION ── */}
      <section className="py-20 md:py-24 bg-white border-t border-neutral-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto">
            <Flame className="h-6 w-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Be Part of Fellowship Life at 4 Kilo
          </h2>

          <p className="text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Whether you are a freshman finding your way or a graduating senior, you are warmly invited to walk together with us in Christ.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="rounded-full">
              <Link href="/devotions">
                Read Today&apos;s Devotion
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <a href="https://t.me/I4U_TEAM_bot" target="_blank" rel="noopener noreferrer">
                Open Telegram Bot
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
