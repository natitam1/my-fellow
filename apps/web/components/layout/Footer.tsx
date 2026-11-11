"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Send,
  Github,
  MapPin,
  Mail,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function Footer() {
  const pathname = usePathname();

  // If in admin dashboard, public footer should not display
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-background text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Image
                  src="/images/logo-primary.png"
                  alt="4 Kilo Fellowship"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    My Fellow
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  AAU 4-Kilo Christian Students Fellowship
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Connecting and spiritually nurturing university students at Addis
              Ababa University through Scripture, prayer, worship, discipleship,
              and kingdom impact.
            </p>

            {/* Telegram & GitHub Open Source Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="https://t.me/I4U_TEAM_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Fellowship Telegram</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>

              <a
                href={siteConfig.links.githubRepo || "https://github.com/natitam1/my-fellow"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Open Source Monorepo</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Fellowship
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/devotions"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Daily Devotions
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Community & Teams
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Gatherings & Events
                </Link>
              </li>
              <li>
                <Link
                  href="/giving"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Digital Giving
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Fellowship Store
                </Link>
              </li>
              <li>
                <Link
                  href="/leaders"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Leaders Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/delete-account"
                  className="text-red-500 hover:text-red-600 transition-colors font-medium"
                >
                  Delete Account
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Help & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Contact Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Campus Gathering
            </h4>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  Addis Ababa University (AAU)
                  <br />
                  4-Kilo Campus, King George VI St, Addis Ababa
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  Friday Fellowship: 5:30 PM
                  <br />
                  Sunday Service: 9:00 AM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:contact@4kilofellowship.org"
                  className="hover:text-primary transition-colors"
                >
                  contact@4kilofellowship.org
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>
              © {currentYear} AAU 4-Kilo Evangelical Christian Students
              Fellowship (ECSF).
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Services Operational
              </span>
            </div>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              Built with <Heart className="h-3 w-3 fill-primary text-primary" /> for the Kingdom
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
