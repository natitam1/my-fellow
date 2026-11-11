"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Phone,
  Mail,
  Send,
  Calendar,
  GraduationCap,
  Users,
  Sparkles,
  ExternalLink,
  Clock,
  Heart,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FELLOWSHIP_LEADERS, FellowshipLeader } from "@/lib/directory-data";

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<FellowshipLeader[]>(FELLOWSHIP_LEADERS);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<"all" | "executive" | "ministry" | "advisory">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/leaders", window.location.origin);
        if (category !== "all") url.searchParams.set("type", category);
        if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());

        const res = await fetch(url.toString());
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setLeaders(json.data);
          }
        }
      } catch {
        // Fall back to FELLOWSHIP_LEADERS
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLeaders, 200);
    return () => clearTimeout(timer);
  }, [category, searchQuery]);

  const filteredLeaders = leaders.filter((l) => {
    if (category !== "all" && l.category !== category) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.role.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <section className="border-b border-border/60 bg-muted/20 py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <Badge
            variant="outline"
            className="border-[#FF6719]/40 bg-[#FF6719]/10 text-[#FF6719] font-semibold text-xs px-3 py-1"
          >
            AAU ECSF Leadership Council
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Fellowship Leaders & Executive Directory
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            "Whoever wants to become great among you must be your servant." — Matthew 20:26.
            Meet the student executives, ministry coordinators, and faculty advisors serving the 4 Kilo fellowship.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-[#FF6719]" />
              6 Executive Committee Officers
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="h-4 w-4 text-emerald-500" />
              8 Ministry Heads
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <GraduationCap className="h-4 w-4 text-sky-500" />
              Faculty Mentorship
            </span>
          </div>
        </div>
      </section>

      {/* Directory Search & Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCategory("all")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                category === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              All Leaders ({leaders.length})
            </button>
            <button
              onClick={() => setCategory("executive")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                category === "executive"
                  ? "bg-[#FF6719] text-white border-[#FF6719]"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Executive Committee
            </button>
            <button
              onClick={() => setCategory("ministry")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                category === "ministry"
                  ? "bg-[#FF6719] text-white border-[#FF6719]"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Ministry Heads
            </button>
            <button
              onClick={() => setCategory("advisory")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                category === "advisory"
                  ? "bg-[#FF6719] text-white border-[#FF6719]"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Advisory & Mentors
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-border"
            />
          </div>
        </div>

        {/* Leaders Grid */}
        {filteredLeaders.length === 0 ? (
          <Card className="border-dashed border-border bg-card/40 text-center py-12">
            <CardContent className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-base font-semibold text-foreground">No leaders found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No fellowship officer matches "{searchQuery}". Try searching with another role title or filter.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLeaders.map((leader) => (
              <Card
                key={leader.id}
                className="overflow-hidden border-border/80 bg-card hover:border-[#FF6719]/40 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  {/* Card Header with Avatar and Office Info */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="h-16 w-16 border-2 border-border group-hover:border-[#FF6719]/60 transition-colors">
                          <AvatarImage src={leader.imageUrl} alt={leader.name} className="object-cover" />
                          <AvatarFallback className="bg-[#FF6719]/15 text-[#FF6719] font-bold text-lg">
                            {leader.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {leader.isVerified && (
                          <div
                            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-background"
                            title="Verified Fellowship Leader"
                          >
                            <ShieldCheck className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
                            leader.category === "executive"
                              ? "border-[#FF6719]/40 bg-[#FF6719]/10 text-[#FF6719]"
                              : leader.category === "ministry"
                              ? "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              : "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {leader.role}
                        </Badge>
                        <h3 className="text-base font-bold text-foreground truncate">
                          {leader.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 shrink-0" />
                          <span className="truncate">{leader.department}</span>
                          {leader.yearOfStudy && <span>• {leader.yearOfStudy}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-4 text-xs text-foreground/80 leading-relaxed line-clamp-3">
                      {leader.bio}
                    </p>

                    {/* Favorite Scripture */}
                    {leader.favoriteVerse && (
                      <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground italic">
                        "{leader.favoriteVerse}"
                      </div>
                    )}

                    {/* Office Hours */}
                    {leader.officeHours && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3 text-[#FF6719] shrink-0" />
                        <span className="truncate">{leader.officeHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Links Footer */}
                <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {leader.telegram && (
                      <a
                        href={`https://t.me/${leader.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline p-1"
                        title="Message on Telegram"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Telegram</span>
                      </a>
                    )}
                    {leader.phoneNumber && (
                      <a
                        href={`tel:${leader.phoneNumber}`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-1"
                        title="Call Leader"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground p-1"
                        title="Send Email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <a
                    href={`https://t.me/${leader.telegram ? leader.telegram.replace(/^@/, "") : ""}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-[#FF6719] hover:underline flex items-center gap-0.5"
                  >
                    Contact
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Banner: Leadership Consultation & Pastoral Care */}
        <Card className="border-border/80 bg-muted/30 p-6 sm:p-8 mt-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Need Personal Spiritual Guidance or Pastoral Care?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Our executive committee and prayer leaders maintain confidential open office hours for any student seeking counsel, encouragement, or campus crisis support.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild variant="outline" className="text-xs border-border">
                <Link href="/teams">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-[#FF6719]" />
                  Join a Ministry Team
                </Link>
              </Button>
              <Button asChild className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs">
                <a href="https://t.me/yonas_fellow" target="_blank" rel="noreferrer">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Fellowship Telegram Helpdesk
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
