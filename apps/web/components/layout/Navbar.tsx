"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  HeartHandshake,
  ShoppingBag,
  Calendar,
  BookOpen,
  Users,
  Home,
  Info,
  ChevronDown,
  Sparkles,
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

export const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Devotions", href: "/devotions", icon: BookOpen },
  { name: "Community", href: "/community", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Giving", href: "/giving", icon: HeartHandshake },
  { name: "Store", href: "/catalog", icon: ShoppingBag },
  { name: "Leaders", href: "/leaders", icon: Users },
  { name: "About", href: "/#about", icon: Info },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // If in admin dashboard, public navbar should yield to admin header
  if (pathname.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200",
          isScrolled
            ? "border-b border-border/80 bg-background/85 backdrop-blur-md shadow-xs"
            : "border-b border-transparent bg-background/95 backdrop-blur-xs"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10 shadow-xs transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo-primary.png"
                  alt="4 Kilo Fellowship"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    My Fellow
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-[11px] font-medium tracking-tight text-muted-foreground">
                  AAU 4-Kilo ECSF
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex lg:items-center lg:gap-1 pl-4">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                      active
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions: Theme toggle, Auth / Profile dropdown, Mobile trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle className="hidden sm:inline-flex" />

            {/* Auth section */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-0.5 transition-transform hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <Avatar className="h-9 w-9 border border-border shadow-xs">
                      {user.profileImage ? (
                        <AvatarImage
                          src={user.profileImage}
                          alt={user.fullName || "User"}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <div className="flex flex-col space-y-1 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user.fullName || "Fellowship Member"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.phoneNumber || user.email || "No contact"}
                    </p>
                    <div className="pt-1">
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wide">
                        {user.role ? user.role.replace("_", " ") : "Member"}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs font-medium"
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile?tab=giving"
                      className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs font-medium"
                    >
                      <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                      <span>My Giving & Orders</span>
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
                          <span>Admin Dashboard</span>
                        </div>
                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px]">
                          Staff
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden h-9 items-center gap-1.5 border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10 sm:inline-flex"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-9 bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
                >
                  <span>Get Started</span>
                </Button>
              </div>
            )}

            {/* Mobile sheet trigger (Hamburger) */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col w-[300px] sm:w-[360px] p-0">
                <SheetHeader className="p-5 border-b border-border/60 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <Image
                          src="/images/logo-primary.png"
                          alt="4 Kilo Fellowship"
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <SheetTitle className="text-base font-bold text-foreground">
                          My Fellow
                        </SheetTitle>
                        <p className="text-[11px] text-muted-foreground">
                          AAU 4-Kilo ECSF
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                {/* Mobile Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu
                  </div>
                  {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                        <span>{link.name}</span>
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Admin link for staff */}
                  {isAuthenticated && isAdmin && (
                    <div className="pt-2">
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </div>
                        <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px]">
                          Staff
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Drawer Footer: Auth state & theme */}
                <div className="border-t border-border/60 p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Theme
                    </span>
                    <ThemeToggle variant="inline" />
                  </div>

                  {isAuthenticated && user ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background border border-border/60">
                        <Avatar className="h-8 w-8">
                          {user.profileImage && (
                            <AvatarImage src={user.profileImage} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {user.fullName || "Fellowship Member"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {user.phoneNumber || user.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={() => setMobileOpen(false)}
                          className="h-8 text-xs"
                        >
                          <Link href="/profile">Profile</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            logout();
                            setMobileOpen(false);
                          }}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Log Out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Button
                        onClick={() => {
                          setMobileOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full h-10 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In / Register
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Guest Auth Dialog */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
    </>
  );
}

export default Navbar;
