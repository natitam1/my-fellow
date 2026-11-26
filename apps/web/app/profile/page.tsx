"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Send,
  GraduationCap,
  Users,
  LogOut,
  Edit3,
  Calendar,
  CreditCard,
  Share2,
  ShieldCheck,
  LogIn,
  BookOpen,
  Flame,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { FELLOWSHIP_TEAMS } from "@/lib/directory-data";
import { SpiritualStreakCard } from "@/components/profile/SpiritualStreakCard";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { RegisteredEventsList } from "@/components/profile/RegisteredEventsList";
import { GivingHistoryList } from "@/components/profile/GivingHistoryList";
import { AuthModal } from "@/components/layout/AuthModal";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Successfully signed out of 4 Kilo Fellowship.");
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm font-medium">Loading your fellowship profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] bg-background flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 border-b border-border/40 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px]" />
            <Badge
              variant="outline"
              className="relative bg-black/60 backdrop-blur-md border-white/15 text-white text-xs px-3 py-1 flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              4 Kilo Fellowship · AAU ECSF
            </Badge>
          </div>

          <CardContent className="p-6 sm:p-8 text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <LogIn className="h-7 w-7" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Sign in to your Fellowship Profile
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                Access your personal devotional streak, campus event passes,
                giving receipts, and ministry team details using your Ethiopian
                phone number.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left text-xs">
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3 flex items-center gap-2.5">
                <Flame className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground">Devotional Streak</span>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3 flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground">Event Passes</span>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3 flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground">Giving Receipts</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                Sign In with Phone
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto border-border"
              >
                <Link href="/devotions">
                  <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                  Explore Devotions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }

  const matchedTeam = user.team
    ? FELLOWSHIP_TEAMS.find(
        (t) => t.name.toLowerCase() === user.team?.toLowerCase()
      )
    : undefined;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Profile Header & Main Member Card */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-xs shadow-xs overflow-hidden">
          {/* Subtle Accent Header Banner */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 border-b border-border/40 relative">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur-md border-white/10 text-white/90 text-xs px-2.5 py-1 flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                AAU ECSF Member
              </Badge>
            </div>
          </div>

          <CardContent className="px-5 sm:px-8 pb-6 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 -mt-14 sm:-mt-16">
              {/* Avatar + Main Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-md">
                    <AvatarImage
                      src={user.profileImage}
                      alt={user.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
                      {user.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "MF"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(true)}
                    className="absolute bottom-1 right-1 p-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xs border-2 border-background transition-transform hover:scale-110"
                    title="Change profile picture"
                    aria-label="Change profile picture"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {user.fullName || "Fellowship Member"}
                    </h1>
                    <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs font-semibold px-2 py-0.5">
                      {user.role ? user.role.toUpperCase() : "MEMBER"}
                    </Badge>
                  </div>

                  {/* Ministry Team & Academic Details */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-muted-foreground">
                    {user.team && (
                      <span className="flex items-center gap-1.5 font-medium text-foreground bg-secondary px-2.5 py-1 rounded-md">
                        <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {user.team}
                      </span>
                    )}
                    {user.department && (
                      <span className="flex items-center gap-1.5 bg-secondary/80 px-2.5 py-1 rounded-md">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        {user.department}
                      </span>
                    )}
                    {user.yearOfStudy && (
                      <span className="bg-secondary/60 px-2 py-1 rounded-md text-xs font-medium">
                        {user.yearOfStudy}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit, Share, Sign Out */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0 pt-2 md:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareProfile}
                  className="text-xs h-9 border-border hover:bg-muted"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" aria-hidden="true" />
                  Share
                </Button>

                <Button
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs h-9 shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Edit Profile
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs h-9 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Member Contact & Bio Details Grid */}
            <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bio */}
              <div className="md:col-span-2 space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  About Me / Life Verse
                </span>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic bg-muted/30 p-3 rounded-lg border border-border/40">
                  &ldquo;
                  {user.bio ||
                    "Growing in Christ, walking in academic excellence, and serving the 4 Kilo Fellowship body."}
                  &rdquo;
                </p>
              </div>

              {/* Direct Contacts */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Fellowship Contacts
                </span>
                <div className="space-y-1.5 text-xs">
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span className="font-mono">{user.phoneNumber}</span>
                    </div>
                  )}

                  {user.telegramUserName && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Send className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
                      <a
                        href={`https://t.me/${user.telegramUserName.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline font-medium text-sky-600 dark:text-sky-400"
                      >
                        {user.telegramUserName}
                      </a>
                    </div>
                  )}

                  {user.email && (
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Streak Counter Card */}
        <SpiritualStreakCard initialStreak={user.streakCount ?? 0} />

        {/* Member Activities Tabs: Events, Givings, Ministry */}
        <div className="space-y-4">
          <Tabs defaultValue="events" className="w-full">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <TabsList className="bg-muted/70 p-1">
                <TabsTrigger value="events" className="text-xs sm:text-sm font-medium gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  My Registered Events
                </TabsTrigger>
                <TabsTrigger value="giving" className="text-xs sm:text-sm font-medium gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                  Giving History
                </TabsTrigger>
                <TabsTrigger value="ministry" className="text-xs sm:text-sm font-medium gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Ministry Team
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Registered Events */}
            <TabsContent value="events" className="pt-3">
              <RegisteredEventsList />
            </TabsContent>

            {/* Tab 2: Giving History */}
            <TabsContent value="giving" className="pt-3">
              <GivingHistoryList />
            </TabsContent>

            {/* Tab 3: Ministry Team Status */}
            <TabsContent value="ministry" className="pt-3">
              <Card className="border-border/80 bg-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <Badge className="bg-primary/15 text-primary border-primary/30 mb-2">
                      {user.team && user.team !== "None"
                        ? "Active Fellowship Ministry"
                        : "Ministry Participation"}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground">
                      {user.team && user.team !== "None"
                        ? user.team
                        : "No Ministry Team Selected"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                      {user.team && user.team !== "None"
                        ? matchedTeam?.description ||
                          "You are an enrolled member of this ministry team. Stay connected with your team coordinator for weekly gatherings."
                        : "Join one of the 4 Kilo Fellowship ministry teams to serve, grow in gifts, and connect with fellow students."}
                    </p>
                  </div>

                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs"
                  >
                    <Link href="/teams">
                      <Users className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      Browse All 8 Ministry Teams
                    </Link>
                  </Button>
                </div>

                {matchedTeam && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground font-medium">Weekly Gathering:</span>
                      <p className="font-semibold text-foreground">
                        {matchedTeam.meetingDay} · {matchedTeam.meetingTime}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground font-medium">Campus Location:</span>
                      <p className="font-semibold text-foreground">{matchedTeam.location}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground font-medium">Team Leader Contact:</span>
                      <p className="font-semibold text-foreground">
                        {matchedTeam.leader.name} (@{matchedTeam.leader.telegram.replace(/^@/, "")})
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        currentUser={user}
        onProfileUpdated={() => {
          refreshUser();
        }}
      />
    </div>
  );
}
