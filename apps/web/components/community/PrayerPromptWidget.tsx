"use client";

import React from "react";
import { HeartHandshake, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrayerPromptWidgetProps {
  onPromptClick?: (tag: string) => void;
  className?: string;
}

export function PrayerPromptWidget({
  onPromptClick,
  className,
}: PrayerPromptWidgetProps) {
  const handleClick = (tag: string = "#prayer") => {
    if (onPromptClick) {
      onPromptClick(tag);
    } else {
      // Smooth scroll to top of page where composer is
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className={cn(
        "border border-primary/20 bg-primary/5 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <HeartHandshake className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm tracking-tight leading-tight">
            Standing in Prayer
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            4 Kilo ECSF Intercession Network
          </p>
        </div>
      </div>

      <p className="text-xs text-foreground/80 leading-relaxed">
        “Carry each other’s burdens, and in this way you will fulfill the law of
        Christ.” — Galatians 6:2
      </p>

      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
        {["#prayer", "#exams", "#health", "#thanksgiving"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleClick(tag)}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-background/80 hover:bg-background border border-primary/20 text-primary transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      <Button
        onClick={() => handleClick("#prayer")}
        size="sm"
        className="w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg justify-between"
      >
        <span>Request Prayer</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
        <ShieldCheck className="h-3 w-3 text-muted-foreground/80 shrink-0" />
        <span>Our prayer ministry intercedes over every prayer item.</span>
      </div>
    </div>
  );
}
