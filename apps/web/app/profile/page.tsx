"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Phone,
  Mail,
  Send,
  GraduationCap,
  Briefcase,
  Users,
  LogOut,
  Edit3,
  Calendar,
  CreditCard,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, User } from "@/context/AuthContext";
import { SpiritualStreakCard } from "@/components/profile/SpiritualStreakCard";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { RegisteredEventsList } from "@/components/profile/RegisteredEventsList";
import { GivingHistoryList } from "@/components/profile/GivingHistoryList";
import { AuthModal } from "@/components/layout/AuthModal";
import { toast } from "sonner";

// Default fellowship sample member when unauthenticated
const DEMO_MEMBER: User = {
  id: "demo-user-1",
  _id: "demo-user-1",
  fullName: "Yohannes Bekele",
  phoneNumber: "+251911223344",
  email: "yohannes.b@aau.edu.et",
  role: "member",
  team: "Worship & Praise Team",
  department: "Software Engineering",
  yearOfStudy: "Year 4",
  bio: "Living as salt and light on campus. Passionate about vocal worship, student discipleship, and building scalable tech for the Kingdom.",
  telegramUserName: "@yonas_fellow",
  profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
  streakCount: 14,
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUser } = useAuth();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [localDemoUser, setLocalDemoUser] = useState<User>(DEMO_MEMBER);

  // Active member profile is user if logged in, otherwise localDemoUser
  const activeUser = isAuthenticated && user ? user : localDemoUser;

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

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Banner if viewing as demo / guest */}
      {!isAuthenticated && (
        <div className="bg-[#FF6719]/10 border-b border-[#FF6719]/25 py-2.5 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-foreground text-center sm:text-left">
              <Sparkles className="h-4 w-4 text-[#FF6719] shrink-0" />
              <span>
                <strong>Fellowship Guest Mode:</strong> You are viewing a preview profile. Sign in to access your personal streak, event passes, and giving receipts.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAuthModalOpen(true)}
                className="h-7 text-xs border-[#FF6719]/40 hover:bg-[#FF6719]/10 text-foreground"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Profile Header & Main Member Card */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-xs shadow-xs overflow-hidden">
          {/* Subtle Accent Header Banner */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 border-b border-border/40 relative">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FF6719_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur-md border-white/10 text-white/90 text-xs px-2.5 py-1 flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#FF6719]" />
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
                      src={activeUser.profileImage}
                      alt={activeUser.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#FF6719]/15 text-[#FF6719] text-2xl font-bold">
                      {activeUser.fullName
                        ? activeUser.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "MF"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="absolute bottom-1 right-1 p-1.5 bg-[#FF6719] hover:bg-[#FF6719]/90 text-white rounded-full shadow-xs border-2 border-background transition-transform hover:scale-110"
                    title="Change profile picture"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {activeUser.fullName}
                    </h1>
                    <Badge
                      className="bg-[#FF6719]/10 text-[#FF6719] border border-[#FF6719]/30 text-xs font-semibold px-2 py-0.5"
                    >
                      {activeUser.role ? activeUser.role.toUpperCase() : "MEMBER"}
                    </Badge>
                  </div>

                  {/* Ministry Team & Academic Details */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-muted-foreground">
                    {activeUser.team && (
                      <span className="flex items-center gap-1.5 font-medium text-foreground bg-secondary px-2.5 py-1 rounded-md">
                        <Users className="h-3.5 w-3.5 text-[#FF6719]" />
                        {activeUser.team}
                      </span>
                    )}
                    {activeUser.department && (
                      <span className="flex items-center gap-1.5 bg-secondary/80 px-2.5 py-1 rounded-md">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                        {activeUser.department}
                      </span>
                    )}
                    {activeUser.yearOfStudy && (
                      <span className="bg-secondary/60 px-2 py-1 rounded-md text-xs font-medium">
                        {activeUser.yearOfStudy}
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
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Share
                </Button>

                <Button
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs h-9 shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Button>

                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs h-9 border-red-500/20 text-red-600 hover:bg-red-500/10 hover:border-red-500/40"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                    Sign Out
                  </Button>
                )}
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
                  "{activeUser.bio || "Growing in Christ, walking in academic excellence, and serving the 4 Kilo Fellowship body."}"
                </p>
              </div>

              {/* Direct Contacts */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Fellowship Contacts
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone className="h-3.5 w-3.5 text-[#FF6719]" />
                    <span className="font-mono">{activeUser.phoneNumber}</span>
                  </div>

                  {activeUser.telegramUserName && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Send className="h-3.5 w-3.5 text-sky-500" />
                      <a
                        href={`https://t.me/${activeUser.telegramUserName.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline font-medium text-sky-600 dark:text-sky-400"
                      >
                        {activeUser.telegramUserName}
                      </a>
                    </div>
                  )}

                  {activeUser.email && (
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{activeUser.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Streak Counter Card */}
        <SpiritualStreakCard initialStreak={activeUser.streakCount || 14} />

        {/* Member Activities Tabs: Events, Givings, Ministry */}
        <div className="space-y-4">
          <Tabs defaultValue="events" className="w-full">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <TabsList className="bg-muted/70 p-1">
                <TabsTrigger value="events" className="text-xs sm:text-sm font-medium gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  My Registered Events
                </TabsTrigger>
                <TabsTrigger value="giving" className="text-xs sm:text-sm font-medium gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Giving History
                </TabsTrigger>
                <TabsTrigger value="ministry" className="text-xs sm:text-sm font-medium gap-1.5">
                  <Users className="h-3.5 w-3.5" />
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
                    <Badge className="bg-[#FF6719]/15 text-[#FF6719] border-[#FF6719]/30 mb-2">
                      Active Fellowship Ministry
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground">
                      {activeUser.team || "Worship & Praise Team"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                      You are an enrolled member of this ministry team. Make sure to attend weekly preparation sessions and spiritual rehearsals.
                    </p>
                  </div>

                  <Button asChild className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white font-medium text-xs">
                    <Link href="/teams">
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      Browse All 8 Ministry Teams
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium">Weekly Rehearsal:</span>
                    <p className="font-semibold text-foreground">Wednesdays & Saturdays at 5:30 PM</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium">Campus Location:</span>
                    <p className="font-semibold text-foreground">Main Chapel Hall (Auditorium)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-medium">Team Leader Contact:</span>
                    <p className="font-semibold text-foreground">Bereket Tadesse (@bereket_worship)</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        currentUser={activeUser}
        onProfileUpdated={(updated) => {
          if (!isAuthenticated) {
            setLocalDemoUser(updated);
          } else {
            refreshUser();
          }
        }}
      />

      {/* Auth Modal for Guest Sign In */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
    </div>
  );
}
