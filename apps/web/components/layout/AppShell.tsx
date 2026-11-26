"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Feather,
  HeartHandshake,
  Home,
  LogIn,
  LogOut,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  User as UserIcon,
  Users,
  UsersRound,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { AuthModal } from "./AuthModal";
import { isAppShellRoute } from "./Navbar";
import { siteConfig } from "@/config/siteConfig";
import {
  fetchLiveLandingData,
  type LiveDevotion,
  type LiveEvent,
} from "@/lib/live-fellowship-data";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { name: "Home", href: "/", icon: Home, exact: true },
  { name: "Community", href: "/community", icon: Users },
  { name: "Devotions", href: "/devotions", icon: BookOpen },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Programs", href: "/programs", icon: Clock },
  { name: "Giving", href: "/givings", icon: HeartHandshake },
  { name: "Store", href: "/store", icon: ShoppingBag },
  { name: "Teams", href: "/teams", icon: UsersRound },
  { name: "Leaders", href: "/leaders", icon: Compass },
  { name: "Profile", href: "/profile", icon: UserIcon },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [todayDevotion, setTodayDevotion] = useState<LiveDevotion | null>(null);
  const [nextEvent, setNextEvent] = useState<LiveEvent | null>(null);
  const inAppShell = isAppShellRoute(pathname);

  useEffect(() => {
    if (!inAppShell) return;
    let cancelled = false;
    fetchLiveLandingData()
      .then((data) => {
        if (cancelled) return;
        setTodayDevotion(data.devotion);
        setNextEvent(data.events[0] ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [inAppShell]);

  if (!inAppShell) {
    return <main className="flex-1">{children}</main>;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact || href === "/") return pathname === "/";
    if (href === "/givings") {
      return (
        pathname === "/givings" ||
        pathname.startsWith("/givings/") ||
        pathname === "/giving"
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const getInitials = (name?: string) => {
    if (!name) return "F";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const currentSectionTitle =
    SIDEBAR_ITEMS.find((item) => !("exact" in item && item.exact) && isActive(item.href))
      ?.name || "4 Kilo Fellowship";

  return (
    <>
      <div className="min-h-screen w-full bg-background text-foreground">
        <div className="mx-auto flex max-w-[1380px] justify-center">
          {/* 1. LEFT SIDEBAR RAIL (Twitter/X + Instagram Web pattern) */}
          <aside className="hidden md:flex sticky top-0 h-screen shrink-0 flex-col justify-between border-r border-border/60 px-2.5 py-4 lg:w-[244px] lg:px-4">
            <div className="flex flex-col gap-1">
              {/* Brand Mark */}
              <Link
                href="/"
                className="mb-3 flex items-center justify-center lg:justify-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <Image
                    src="/images/logo-primary.png"
                    alt="My Fellow"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-[15px] font-bold tracking-tight leading-none">
                    My Fellow
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    4 Kilo ECSF
                  </span>
                </div>
              </Link>

              {/* Navigation Rail Items */}
              <nav aria-label="App sidebar" className="flex flex-col gap-0.5">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, "exact" in item ? item.exact : false);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={item.name}
                      className={cn(
                        "group flex items-center justify-center lg:justify-start gap-3.5 rounded-full px-3 py-2.5 text-[15px] transition-all duration-150",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                          active ? "stroke-[2.3]" : "stroke-[1.9]",
                        )}
                      />
                      <span className="hidden lg:inline">{item.name}</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin"
                    title="Admin Portal"
                    className="mt-1 flex items-center justify-center lg:justify-start gap-3.5 rounded-full px-3 py-2.5 text-[15px] font-medium text-primary/90 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline">Admin Portal</span>
                  </Link>
                )}
              </nav>

              {/* Primary Compose CTA (Twitter/X style) */}
              <div className="mt-4 px-1">
                <Button
                  asChild
                  className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                >
                  <Link
                    href="/community"
                    className="flex items-center justify-center gap-2"
                  >
                    <Feather className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">New Reflection</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Bottom Account & Theme Bar */}
            <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
              <div className="flex items-center justify-center lg:justify-between px-1">
                <span className="hidden lg:inline text-xs font-medium text-muted-foreground">
                  Appearance
                </span>
                <ThemeToggle className="h-8 w-8 rounded-full" />
              </div>

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-center lg:justify-start gap-2.5 rounded-full p-1.5 transition-colors hover:bg-muted/70 focus:outline-none"
                    >
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        {user.profileImage ? (
                          <AvatarImage
                            src={user.profileImage}
                            alt={user.fullName || "User"}
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col text-left min-w-0 flex-1">
                        <span className="text-xs font-semibold truncate text-foreground">
                          {user.fullName || "Fellowship Member"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {user.phoneNumber || "AAU 4 Kilo"}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="w-56 p-1.5">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center gap-2 text-xs">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>View Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center gap-2 text-xs text-primary font-semibold">
                          <ShieldAlert className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer flex items-center gap-2 text-xs text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full rounded-full h-10 gap-2 text-xs font-semibold"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Sign in</span>
                </Button>
              )}
            </div>
          </aside>

          {/* 2. CENTER MAIN CONTENT COLUMN */}
          <main className="flex-1 min-w-0 pb-20 md:pb-8">
            {/* Compact Mobile Header (shown only < md) */}
            <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/85 px-4 backdrop-blur-xl md:hidden">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Image
                    src="/images/logo-primary.png"
                    alt="My Fellow"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {currentSectionTitle}
                </span>
              </Link>
              <div className="flex items-center gap-1.5">
                <ThemeToggle className="h-8 w-8 rounded-full" />
                {!isAuthenticated ? (
                  <Button
                    size="sm"
                    onClick={() => setAuthModalOpen(true)}
                    className="h-8 rounded-full bg-foreground text-background px-3 text-xs"
                  >
                    Sign in
                  </Button>
                ) : (
                  <Link href="/profile">
                    <Avatar className="h-8 w-8 border border-border">
                      {user?.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={user.fullName || "User"} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                        {getInitials(user?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}
              </div>
            </div>

            {children}
          </main>

          {/* 3. RIGHT CONTEXTUAL RAIL (Twitter/X style on xl+) */}
          <aside className="hidden xl:flex sticky top-0 h-screen w-[316px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border/60 px-5 py-5">
            {/* Today's Devotion Card */}
            {todayDevotion && (
              <div className="rounded-2xl border border-border/70 bg-muted/25 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    <Flame className="h-3.5 w-3.5" />
                    Today&apos;s quiet time
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {todayDevotion.scripture}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {todayDevotion.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed italic">
                  &quot;{todayDevotion.verseText}&quot;
                </p>
                <Link
                  href="/devotions"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-0.5"
                >
                  Read devotion
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Next Campus Event Card */}
            {nextEvent && (
              <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Upcoming at 4 Kilo
                </span>
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {nextEvent.title}
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {nextEvent.date} · {nextEvent.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{nextEvent.location}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full rounded-full h-8 text-xs font-semibold mt-1"
                >
                  <Link href="/events">View events</Link>
                </Button>
              </div>
            )}

            {/* Student Welfare Quick Card */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <HeartHandshake className="h-4 w-4" />
                <span>Student meal fund</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                100% of contributions go directly to cafeteria meal cards for classmates at 4 Kilo.
              </p>
              <Link
                href="/givings"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Give via Chapa
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Compact Right Rail Footer */}
            <div className="mt-auto pt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/support" className="hover:underline">
                Support
              </Link>
              <a
                href={siteConfig.links.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Telegram Bot
              </a>
              <span className="w-full pt-1 text-[10px] text-muted-foreground/70">
                © {new Date().getFullYear()} {siteConfig.fellowshipName}
              </span>
            </div>
          </aside>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
