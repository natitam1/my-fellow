"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  HeartHandshake,
  Calendar,
  BookOpen,
  Users,
  Home,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { AuthModal } from "./AuthModal";
import { cn } from "@/lib/utils";

export const APP_SHELL_PREFIXES = [
  "/community",
  "/devotions",
  "/events",
  "/programs",
  "/givings",
  "/giving",
  "/store",
  "/teams",
  "/leaders",
  "/profile",
] as const;

export function isAppShellRoute(pathname: string): boolean {
  return APP_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Devotions", href: "/devotions", icon: BookOpen },
  { name: "Community", href: "/community", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Giving", href: "/givings", icon: HeartHandshake },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Yield to Admin Sidebar on /admin and to Twitter/Instagram AppShell on companion app pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/onboarding") ||
    isAppShellRoute(pathname)
  ) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "F";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200",
          isScrolled
            ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
            : "bg-background/60 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Mark */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logo-primary.png"
                alt="4 Kilo Fellowship"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              My Fellow
            </span>
          </Link>

          {/* Centered Minimal Pill Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-md"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150",
                    active
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex h-9 w-9 rounded-full" />

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 p-1 pr-2.5 transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <Avatar className="h-7 w-7">
                      {user.profileImage ? (
                        <AvatarImage
                          src={user.profileImage}
                          alt={user.fullName || "User"}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <div className="flex flex-col space-y-0.5 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user.fullName || "Fellowship Member"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.phoneNumber || user.email || "4 Kilo Member"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/community"
                      className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs font-medium"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Open App Feed</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs font-medium"
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs font-semibold text-primary focus:text-primary"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" />
                          <span>Admin Portal</span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="h-9 rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/90"
              >
                Sign in
              </Button>
            )}

            {/* Mobile Menu Sheet */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex flex-col w-[290px] p-0"
              >
                <SheetHeader className="p-5 border-b border-border/60 text-left">
                  <SheetTitle className="flex items-center gap-2.5 text-base font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Image
                        src="/images/logo-primary.png"
                        alt="4 Kilo Fellowship"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <span>My Fellow</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-border/60 p-4 flex items-center justify-between gap-3">
                  <ThemeToggle />
                  {!isAuthenticated ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setMobileOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Sign in
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-full"
                    >
                      <Link href="/profile">My Profile</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
