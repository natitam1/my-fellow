"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Music,
  Video,
  Flame,
  Heart,
  BookOpen,
  Wrench,
  Users,
  HeartHandshake,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FELLOWSHIP_TEAMS, MinistryTeam } from "@/lib/directory-data";
import { JoinTeamModal } from "@/components/teams/JoinTeamModal";

// Icon mapper for the 8 teams
const TEAM_ICONS: Record<string, React.ReactNode> = {
  Music: <Music className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  Flame: <Flame className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Wrench: <Wrench className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  HeartHandshake: <HeartHandshake className="h-6 w-6" />,
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<MinistryTeam[]>(FELLOWSHIP_TEAMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamForJoin, setSelectedTeamForJoin] = useState<MinistryTeam | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [submittedTeamIds, setSubmittedTeamIds] = useState<string[]>([]);

  const categories = [
    "All",
    "Spiritual Life",
    "Media & Arts",
    "Outreach & Care",
    "Logistics & Tech",
  ];

  const filteredTeams = teams.filter((t) => {
    if (selectedCategory !== "All" && t.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.about.toLowerCase().includes(q) ||
        t.leader.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenJoin = (team: MinistryTeam) => {
    setSelectedTeamForJoin(team);
    setJoinModalOpen(true);
  };

  const handleJoinSuccess = (teamId: string) => {
    setSubmittedTeamIds((prev) => [...prev, teamId]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <section className="border-b border-border/60 bg-muted/20 py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <Badge
            variant="outline"
            className="border-[#FF6719]/40 bg-[#FF6719]/10 text-[#FF6719] font-semibold text-xs px-3 py-1"
          >
            AAU ECSF Ministry Teams
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            The 8 Fellowship Ministry Teams
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            "There are different kinds of service, but the same Lord." — 1 Corinthians 12:5.
            Find your place of service, build lifelong Christian friendships, and use your talents to minister to the campus.
          </p>

          {/* Quick Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6719]" />
              Worship & Praise
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6719]" />
              Media & Tech
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6719]" />
              Prayer & Care
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6719]" />
              Outreach & Charity
            </span>
          </div>
        </div>
      </section>

      {/* Directory Search & Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? "bg-[#FF6719] text-white border-[#FF6719]"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat} {cat === "All" && `(${teams.length})`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ministry teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-border"
            />
          </div>
        </div>

        {/* Teams List */}
        {filteredTeams.length === 0 ? (
          <Card className="border-dashed border-border bg-card/40 text-center py-12">
            <CardContent className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-base font-semibold text-foreground">No teams found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No fellowship team matches your search query. Try exploring other categories.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                View All 8 Teams
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTeams.map((team) => {
              const hasApplied = submittedTeamIds.includes(team.id);

              return (
                <Card
                  key={team.id}
                  className="overflow-hidden border-border/80 bg-card hover:border-[#FF6719]/50 transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Icon, Name, Category, Member Count */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6719]/10 text-[#FF6719] border border-[#FF6719]/25 shadow-xs group-hover:scale-105 transition-transform">
                          {TEAM_ICONS[team.iconName] || <Users className="h-6 w-6" />}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-foreground leading-tight">
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold border-border text-muted-foreground"
                            >
                              {team.category}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {team.membersCount} Active Members
                            </span>
                          </div>
                        </div>
                      </div>

                      {team.isAcceptingMembers && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold shrink-0"
                        >
                          Recruiting
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      {team.description}
                    </p>

                    {/* Meeting Schedule & Campus Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs">
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="h-3.5 w-3.5 text-[#FF6719] shrink-0" />
                        <span className="truncate">{team.meetingDay}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-[#FF6719] shrink-0" />
                        <span className="truncate">{team.meetingTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-[#FF6719] shrink-0" />
                        <span className="truncate">{team.location}</span>
                      </div>
                    </div>

                    {/* Key Responsibilities */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                        Core Activities & Focus:
                      </span>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {team.responsibilities.slice(0, 3).map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#FF6719] shrink-0 mt-0.5" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Team Coordinator Snippet */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-border">
                          {team.leader.imageUrl && (
                            <AvatarImage src={team.leader.imageUrl} alt={team.leader.name} />
                          )}
                          <AvatarFallback className="bg-muted text-foreground text-[10px] font-bold">
                            {team.leader.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground text-xs leading-none">
                            {team.leader.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {team.leader.role}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`https://t.me/${team.leader.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" />
                        @{team.leader.telegram.replace(/^@/, "")}
                      </a>
                    </div>
                  </div>

                  {/* Card Footer: Join Ministry Team Action */}
                  <div className="px-6 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Open to all enrolled students
                    </span>

                    {hasApplied ? (
                      <Button
                        size="sm"
                        disabled
                        variant="outline"
                        className="text-xs h-8.5 font-medium border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Request Submitted
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleOpenJoin(team)}
                        className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs h-8.5 shadow-xs"
                      >
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        Join Ministry Team
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Commitment Banner */}
        <Card className="border-border/80 bg-muted/30 p-6 sm:p-8 mt-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                First Time Serving at Fellowship?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No previous campus leadership experience is required. Each ministry team provides training, personal spiritual mentorship, and an encouraging community to grow in faith while serving Christ.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Button asChild variant="outline" className="text-xs border-border">
                <Link href="/leaders">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-[#FF6719]" />
                  Meet the Leaders
                </Link>
              </Button>
              <Button asChild className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs">
                <Link href="/profile">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  View My Member Profile
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Join Request Dialog Modal */}
      <JoinTeamModal
        team={selectedTeamForJoin}
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
