"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FellowshipProgram } from "@/lib/programs-data";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Send,
  Mail,
  CheckCircle2,
  ExternalLink,
  CalendarPlus,
  Share2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProgramCardProps {
  program: FellowshipProgram;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const copyPhoneNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(program.leader.phoneNumber);
    setCopiedPhone(true);
    toast.success(`Copied ${program.leader.name}'s phone number!`);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const shareProgram = () => {
    const text = `${program.title} — AAU 4-Kilo Christian Students Fellowship\nTime: ${program.day}s at ${program.time}\nLocation: ${program.location.name} (${program.location.room})\nContact: ${program.leader.name} (${program.leader.phoneNumber})`;
    if (navigator.share) {
      navigator.share({ title: program.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setShareCopied(true);
      toast.success("Program details copied to clipboard!");
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-border/70 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Graphic Banner */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
          <Image
            src={program.image}
            alt={program.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <Badge
              variant="secondary"
              className="bg-background/95 backdrop-blur-xs text-foreground font-bold text-xs shadow-xs border-border/50"
            >
              Every {program.day}
            </Badge>
            <Badge
              variant="outline"
              className="bg-black/50 backdrop-blur-xs text-white border-white/20 text-[11px]"
            >
              {program.category}
            </Badge>
          </div>

          {program.badge && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-primary text-white font-semibold text-[10px]">
                {program.badge}
              </Badge>
            </div>
          )}

          {/* Bottom Time Bar */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1 font-mono font-medium drop-shadow-xs">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {program.time}
            </span>
            <span className="text-[11px] text-white/80 font-medium">
              {program.durationMinutes} mins
            </span>
          </div>
        </div>

        {/* Main Content */}
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
              {program.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {program.description}
            </p>
          </div>

          {/* Venue & Location info */}
          <div className="rounded-xl bg-muted/50 p-3 border border-border/50 space-y-1 text-xs">
            <div className="flex items-start gap-1.5 font-medium text-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div>
                <span>{program.location.name}</span>
                <span className="block text-[11px] text-primary font-semibold">
                  Hall / Room: {program.location.room}
                </span>
              </div>
            </div>
          </div>

          {/* Key Program Highlights */}
          {program.highlights && program.highlights.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                What to Expect:
              </span>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {program.highlights.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </div>

      {/* Footer: Leader Contact Info & Action Buttons */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-border/50 bg-card space-y-3">
        {/* Leader Contact Card */}
        <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted border border-primary/20 shrink-0">
              {program.leader.avatarUrl ? (
                <Image
                  src={program.leader.avatarUrl}
                  alt={program.leader.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-foreground">
                  {program.leader.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h5 className="font-semibold text-xs text-foreground truncate">
                {program.leader.name}
              </h5>
              <p className="text-[11px] text-muted-foreground truncate">
                {program.leader.role}
              </p>
            </div>
          </div>

          {/* Quick Contact Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`tel:${program.leader.phoneNumber}`}
              title={`Call ${program.leader.phoneNumber}`}
              className="p-1.5 rounded-lg border border-border/70 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>

            {program.leader.telegramHandle && (
              <a
                href={`https://t.me/${program.leader.telegramHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Telegram ${program.leader.telegramHandle}`}
                className="p-1.5 rounded-lg border border-border/70 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
            )}

            {program.leader.email && (
              <a
                href={`mailto:${program.leader.email}`}
                title={`Email ${program.leader.email}`}
                className="p-1.5 rounded-lg border border-border/70 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2">
          {/* Details Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs font-medium h-9"
              >
                Full Program Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <Badge variant="outline" className="w-fit text-primary border-primary/30 mb-1">
                  Every {program.day} • {program.time}
                </Badge>
                <DialogTitle className="text-xl font-bold">
                  {program.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {program.recurringSchedule}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">About This Gathering:</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description}
                  </p>
                </div>

                <div className="p-3 bg-muted/60 rounded-xl space-y-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Venue & Room
                  </span>
                  <p className="text-foreground">{program.location.name}</p>
                  <p className="text-primary font-medium">{program.location.room}</p>
                  <p className="text-muted-foreground text-[11px]">{program.location.address}</p>
                  <a
                    href={program.location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold pt-1"
                  >
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 border border-border rounded-xl space-y-2">
                  <span className="font-semibold text-foreground block">
                    Ministry Coordinator Contact:
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                      {program.leader.avatarUrl && (
                        <Image
                          src={program.leader.avatarUrl}
                          alt={program.leader.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{program.leader.name}</p>
                      <p className="text-muted-foreground text-[11px]">{program.leader.role}</p>
                      <p className="text-primary font-mono text-[11px]">{program.leader.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={shareProgram}
            className="text-xs h-9 px-3 gap-1.5"
            title="Share Schedule"
          >
            {shareCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}
