import React from "react";
import { BadgeCheck, Sparkles } from "lucide-react";
import { ActorSummary } from "@/types/community";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActorBadgeProps {
  actor?: ActorSummary | null;
  role?: string | null;
  ministryBadge?: string | null;
  isVerified?: boolean;
  className?: string;
}

export function ActorBadge({
  actor,
  role,
  ministryBadge,
  isVerified,
  className,
}: ActorBadgeProps) {
  const isOfficial = actor?.type === "official" || actor?.handle === "fellow";
  const isTeam = actor?.type === "team" || Boolean(actor?.teamId);

  return (
    <div className={cn("inline-flex items-center gap-1.5 flex-wrap", className)}>
      {/* Official Fellowship Orange Badge */}
      {isOfficial && (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-semibold text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3 fill-primary text-primary" />
          <span>Official Fellow</span>
        </Badge>
      )}

      {/* Ministry Team Badge */}
      {isTeam && !isOfficial && (
        <Badge
          variant="outline"
          className="bg-muted/60 text-muted-foreground border-border/80 font-medium text-[11px] px-2 py-0.5 rounded-full"
        >
          {actor?.displayName || ministryBadge || "Ministry Team"}
        </Badge>
      )}

      {/* Verified Checkmark */}
      {(isVerified || actor?.isVerified) && (
        <BadgeCheck
          className={cn(
            "h-4 w-4 shrink-0",
            isOfficial ? "text-primary fill-primary/20" : "text-blue-500 fill-blue-500/20"
          )}
          aria-label="Verified Member"
        />
      )}

      {/* Fellowship Role / Department for Regular Members */}
      {!isOfficial && !isTeam && (role || ministryBadge) && (
        <span className="text-[11px] text-muted-foreground font-normal">
          • {ministryBadge || role}
        </span>
      )}
    </div>
  );
}
