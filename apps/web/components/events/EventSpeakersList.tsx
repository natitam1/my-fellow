"use client";

import React from "react";
import Image from "next/image";
import { EventSpeaker } from "@/lib/events-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface EventSpeakersListProps {
  speakers: EventSpeaker[];
}

export function EventSpeakersList({ speakers }: EventSpeakersListProps) {
  if (!speakers || speakers.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
        Guest ministers and speakers will be updated soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {speakers.map((speaker) => (
        <Card
          key={speaker.id}
          className="border border-border/70 bg-card overflow-hidden hover:border-primary/40 hover:shadow-2xs transition-all"
        >
          <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center space-y-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shrink-0 shadow-xs">
              {speaker.avatarUrl ? (
                <Image
                  src={speaker.avatarUrl}
                  alt={speaker.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-lg">
                  {speaker.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>

            <div className="space-y-1 w-full">
              <h4 className="font-bold text-base text-foreground">
                {speaker.name}
              </h4>
              <Badge variant="outline" className="text-primary border-primary/30 text-[11px]">
                {speaker.role}
              </Badge>
              {speaker.affiliation && (
                <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 pt-1">
                  <GraduationCap className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{speaker.affiliation}</span>
                </p>
              )}
            </div>

            {speaker.bio && (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed pt-1 border-t border-border/50">
                {speaker.bio}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
