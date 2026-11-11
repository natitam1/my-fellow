"use client";

import React, { useState } from "react";
import { EventLocation } from "@/lib/events-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

interface EventLocationMapProps {
  location: EventLocation;
}

export function EventLocationMap({ location }: EventLocationMapProps) {
  const [copied, setCopied] = useState(false);

  const coordsString = `${location.coordinates.lat.toFixed(
    4
  )}, ${location.coordinates.lng.toFixed(4)}`;

  const copyCoords = () => {
    navigator.clipboard.writeText(coordsString);
    setCopied(true);
    toast.success("Coordinates copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-border/70 bg-card overflow-hidden">
      {/* Map visual graphic banner */}
      <div className="relative h-44 sm:h-52 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Subtle SVG Grid pattern for campus blueprint vibe */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FF6719 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Pulsing Pin Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-primary/30 rounded-full animate-ping" />
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-2 border-white">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 bg-black/80 backdrop-blur-xs border border-white/20 rounded-full text-white text-xs font-semibold shadow-xs">
            {location.room || location.name}
          </div>
        </div>

        {/* Top-Right Badge: Coordinates */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white/90 text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>{coordsString}</span>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <h4 className="font-bold text-base text-foreground">
              {location.name}
            </h4>
          </div>
          {location.room && (
            <p className="text-sm font-medium text-foreground/80 pl-6">
              Specific Hall: <strong>{location.room}</strong>
            </p>
          )}
          <p className="text-xs text-muted-foreground pl-6">
            {location.address}
          </p>
        </div>

        {location.directions && (
          <div className="p-3 rounded-xl bg-muted/60 border border-border/50 text-xs text-muted-foreground flex items-start gap-2">
            <Navigation className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-0.5">Campus Directions:</strong>
              {location.directions}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Button
            asChild
            size="sm"
            className="gap-1.5 text-xs font-medium"
          >
            <a
              href={
                location.mapUrl ||
                `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyCoords}
            className="gap-1.5 text-xs font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Coordinates
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
