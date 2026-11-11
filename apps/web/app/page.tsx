import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-background/80 to-muted/20 py-16 md:py-24 lg:py-28">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Addis Ababa University 4 Kilo ECSF
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Growing in Christ,{" "}
                <span className="text-primary inline-block">Walking in Purpose</span>{" "}
                on Campus.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                The official open-source digital home for the 4 Kilo Christian Students Fellowship.
                Daily devotionals with audio streaming, vibrant student community, weekly fellowship gatherings, giving, and ministry service.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" asChild className="rounded-lg shadow-sm font-medium">
                  <Link href="/devotions">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Today&apos;s Devotion
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-lg">
                  <Link href="/community">
                    <Users className="mr-2 h-4 w-4" />
                    Join Campus Community
                  </Link>
                </Button>
              </div>

              {/* Quick stats / trust chips */}
              <div className="pt-6 border-t border-border/40 grid grid-cols-3 gap-4 max-w-lg text-left">
                <div>
                  <div className="text-2xl font-bold text-foreground">8+</div>
                  <div className="text-xs text-muted-foreground">Ministry Teams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">365</div>
                  <div className="text-xs text-muted-foreground">Daily Devotionals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">1,200+</div>
                  <div className="text-xs text-muted-foreground">Campus Students</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Today's Devotion Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 to-primary/10 opacity-70 blur-xl" />
                <Card className="relative overflow-hidden border border-border shadow-xl bg-card">
                  <div className="p-1 bg-primary" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary">
                        Today&apos;s Devotion
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-primary" /> Daily Bread
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                        <Link href="/devotions">Walking Worthy of the Calling</Link>
                      </h3>
                      <p className="text-xs font-semibold text-primary">Ephesians 4:1-3</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-muted/50 border border-border/60 text-xs italic text-muted-foreground leading-relaxed">
                      <Quote className="h-3 w-3 inline text-primary mr-1" />
                      &quot;I therefore, a prisoner for the Lord, urge you to walk in a manner worthy of the calling to which you have been called, with all humility and gentleness...&quot;
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          4K
                        </div>
                        <span className="text-xs font-medium text-foreground">Fellowship Editorial</span>
                      </div>
                      <Button size="sm" asChild className="h-8">
                        <Link href="/devotions">
                          Read & Listen
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Experience Features Grid */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Everything in One Digital Fellowship
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Access every part of fellowship life directly on your browser or mobile phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Devotionals */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Daily Devotionals & Audio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start your morning on campus with scripture reflections, prayer points, and integrated audio streaming recorded by fellow students.
                </p>
                <Link href="/devotions" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  Browse devotions <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 2: Community Feed */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Student Community Feed</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with fellow Christian students at AAU 4 Kilo. Share campus testimonies, prayer requests, and fellowship announcements.
                </p>
                <Link href="/community" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  Join discussion <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 3: Conferences & Events */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Gatherings & Conferences</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Register for annual campus retreats, weekly Friday worship nights, seminars, and special outreaches with instant digital pass issuance.
                </p>
                <Link href="/events" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  View upcoming events <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 4: Givings */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Giving & Student Welfare</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Support disadvantaged university students with cafeteria meal tickets, medical aid, and ministry outreach via Telebirr or CBE Birr.
                </p>
                <Link href="/givings" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  Give securely <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 5: Fellowship Store */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Campus Book & Resource Store</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fellowship apparel, study Bibles (Amharic & English), discipleship notebooks, and Christian literature with campus pickup.
                </p>
                <Link href="/store" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  Explore catalog <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 6: Ministry Teams */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">8 Ministry Teams</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Serve in Worship, Prayer, Media, Charity, Literature, Technical, Discipleship, or Counseling teams during your academic years.
                </p>
                <Link href="/teams" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  Join a team <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Weekly Fellowship Schedule Teaser */}
      <section className="py-14 border-t border-b border-border/40 bg-muted/20">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="outline" className="text-primary border-primary/30">
                Weekly Fellowship Gatherings
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">
                Join Us This Week on AAU 4 Kilo Campus
              </h3>
              <p className="text-sm text-muted-foreground">
                All university students are warmly welcomed regardless of year or department.
              </p>
            </div>
            <Button asChild className="shrink-0 font-medium">
              <Link href="/programs">
                View Full Weekly Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile App Download Callout */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <Smartphone className="h-4 w-4" /> Mobile App Available
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Take Fellowship With You Anywhere
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enjoy offline audio devotionals, lock-screen playback, instant conference check-ins, and campus notifications directly on Android and iOS.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/catalog">
                    Download Android APK
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://t.me/I4U_TEAM_bot" target="_blank" rel="noopener noreferrer">
                    Open Telegram Bot
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <Image
                  src="/images/logo-primary.png"
                  alt="4 Kilo Fellowship Logo"
                  width={64}
                  height={64}
                  className="mx-auto rounded-xl"
                />
                <div className="text-xs font-bold text-foreground">AAU ECSF</div>
                <div className="text-[11px] text-muted-foreground">Version 2.0 Web</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
