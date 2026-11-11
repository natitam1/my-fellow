"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  User as UserIcon,
  Send,
  GraduationCap,
  BookOpen,
  Music,
  Video,
  Flame,
  HandHeart,
  Wrench,
  Users,
  Sparkles,
  CheckCircle2,
  Upload,
  RefreshCw,
  Camera,
  ArrowRight,
  School,
  AtSign,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AVATAR_PRESETS, getPrefilledAvatar } from "@/lib/avatar";

// Ministry Teams specified in requirements
const MINISTRY_TEAMS = [
  {
    id: "Worship",
    name: "Worship",
    subtitle: "Praise & worship leading, vocals, guitar, keyboard, and sound.",
    icon: Music,
  },
  {
    id: "Media",
    name: "Media",
    subtitle: "Photography, videography, live production, projection, and design.",
    icon: Video,
  },
  {
    id: "Prayer",
    name: "Prayer",
    subtitle: "Campus intercession, weekly fasting nights, and dawn prayer gatherings.",
    icon: Flame,
  },
  {
    id: "Charity",
    name: "Charity",
    subtitle: "Compassion outreach, needy student support, hospital & orphanage visits.",
    icon: HandHeart,
  },
  {
    id: "Literature",
    name: "Literature",
    subtitle: "Devotional writing, fellowship bulletins, library books, and editorial.",
    icon: BookOpen,
  },
  {
    id: "Technical",
    name: "Technical",
    subtitle: "Audio setups, equipment maintenance, stage acoustics, and campus tech.",
    icon: Wrench,
  },
  {
    id: "Discipleship",
    name: "Discipleship",
    subtitle: "Cell group leadership, bible study mentoring, and freshman nurturing.",
    icon: Users,
  },
  {
    id: "Counseling",
    name: "Counseling",
    subtitle: "Peer spiritual guidance, academic encouragement, and confidential support.",
    icon: Sparkles,
  },
];

// Academic Years of Study specified in requirements
const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduate",
];

// Quick department suggestions for Ethiopian University students
const DEPARTMENT_SUGGESTIONS = [
  "Computer Science",
  "Software Engineering",
  "Information Systems",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Medicine",
  "Pharmacy",
  "Applied Chemistry",
  "Applied Mathematics",
  "Applied Physics",
  "Statistics",
  "Architecture",
  "Economics",
];

export function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "";

  const { user, token, updateProfile, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [telegramUserName, setTelegramUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1st Year");
  const [team, setTeam] = useState("Worship");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate form if user data exists
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.telegramUserName) setTelegramUserName(user.telegramUserName.replace(/^@/, ""));
      if (user.department) setDepartment(user.department);
      if (user.yearOfStudy) setYearOfStudy(user.yearOfStudy);
      if (user.team) setTeam(user.team);
      if (user.profileImage) {
        setAvatarUrl(user.profileImage);
      } else {
        setAvatarUrl(getPrefilledAvatar(user.phoneNumber || user.id));
      }
    } else {
      setAvatarUrl(getPrefilledAvatar("student"));
    }
  }, [user]);

  // Handle custom image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        toast.success("Profile photo uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate a random avatar
  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    setAvatarUrl(getPrefilledAvatar(randomSeed));
    toast.info("Generated new avatar");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!department.trim()) {
      toast.error("Please enter your academic department");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        team,
        department: department.trim(),
        yearOfStudy,
        telegramUserName: telegramUserName.trim()
          ? `@${telegramUserName.trim().replace(/^@/, "")}`
          : undefined,
        profileImage: avatarUrl || undefined,
      };

      // Dispatches updateProfile (which saves via api.patch / api.put)
      await updateProfile(payload);

      // Also trigger relative POST /api/auth/profile or PUT /api/user/profile for strict spec compliance
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        await fetch("/api/auth/profile", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } catch {
        // Handled by updateProfile
      }

      toast.success("Welcome! Your profile has been created.");

      if (returnUrl) {
        router.push(returnUrl);
      } else if (
        user?.role === "admin" ||
        user?.role === "super_admin" ||
        user?.role === "leader"
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save profile. Please check your connection.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <Card className="border-border/80 shadow-md bg-card">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-border/50">
          <div className="flex justify-center">
            <div className="relative h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center p-2 border border-primary/20">
              <Image
                src="/images/logo-primary.png"
                alt="4 Kilo Fellowship"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Complete Your Fellowship Profile
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Set up your profile to connect with cell groups, ministry departments, and campus fellowship events.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6 pb-6">
            {/* Section 1: Avatar Selection / Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  1
                </span>
                <Label className="text-sm font-semibold text-foreground">
                  Profile Avatar
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-muted/40 border border-border/60">
                {/* Active Avatar */}
                <div className="relative shrink-0">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary bg-background shadow-xs flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90 transition-colors cursor-pointer"
                    title="Upload photo"
                    aria-label="Upload photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Avatar Presets & Randomize */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="text-xs font-medium text-muted-foreground block">
                    Choose an avatar or upload your own:
                  </span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`h-9 w-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarUrl === preset.url
                            ? "border-primary ring-2 ring-primary/20 scale-105"
                            : "border-border hover:border-primary/50"
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRandomizeAvatar}
                      className="h-9 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Random</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </span>
                <Label className="text-sm font-semibold text-foreground">
                  Personal Details
                </Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Dawit Bekele"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 h-10 border-input focus-visible:ring-primary focus-visible:ring-1 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="telegram" className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>Telegram Username</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                  </Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="telegram"
                      type="text"
                      placeholder="username"
                      value={telegramUserName}
                      onChange={(e) => setTelegramUserName(e.target.value)}
                      className="pl-9 h-10 border-input focus-visible:ring-primary focus-visible:ring-1 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Academic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  3
                </span>
                <Label className="text-sm font-semibold text-foreground">
                  Academic Information
                </Label>
              </div>

              {/* Academic Year of Study Selection */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground block">
                  Year of Study <span className="text-destructive">*</span>
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ACADEMIC_YEARS.map((year) => {
                    const isSelected = yearOfStudy === year;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setYearOfStudy(year)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                            : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-input"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department Input with Suggestions */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs font-medium text-foreground flex items-center gap-1">
                  <span>Academic Department / Field</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <School className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="department"
                    type="text"
                    placeholder="e.g. Computer Science or Applied Chemistry"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="pl-9 h-10 border-input focus-visible:ring-primary focus-visible:ring-1 text-sm"
                    required
                  />
                </div>

                {/* Suggestion Chips */}
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground block">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEPARTMENT_SUGGESTIONS.slice(0, 8).map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setDepartment(dept)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          department === dept
                            ? "bg-primary/10 border-primary/40 text-primary font-medium"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Ministry Team Calling */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    4
                  </span>
                  <Label className="text-sm font-semibold text-foreground">
                    Ministry Team
                  </Label>
                </div>
                <span className="text-xs text-muted-foreground">Select one team</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MINISTRY_TEAMS.map((t) => {
                  const isSelected = team === t.name;
                  const IconComp = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTeam(t.name)}
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                          : "border-border/70 bg-card hover:bg-muted/30 hover:border-border"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-sm font-semibold text-foreground block">
                          {t.name}
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                          {t.subtitle}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3.5 right-3 text-primary">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-4 pb-6 border-t border-border/50">
            <Button
              type="submit"
              disabled={isSubmitting || !fullName.trim() || !department.trim()}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving your profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile & Enter Fellowship</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              You can update your ministry team and academic details anytime in your profile settings.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
