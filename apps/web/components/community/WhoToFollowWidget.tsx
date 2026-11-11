"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Check, Plus, ExternalLink, Sparkles } from "lucide-react";
import { ActorSummary } from "@/types/community";
import { getRecommendedActors } from "@/lib/communityApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WhoToFollowWidgetProps {
  className?: string;
  onSelectTag?: (tag: string) => void;
}

export function WhoToFollowWidget({ className, onSelectTag }: WhoToFollowWidgetProps) {
  const { isAuthenticated } = useAuth();
  const [actors, setActors] = useState<ActorSummary[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const list = await getRecommendedActors();
        if (isMounted) {
          setActors(list);
          const initialMap: Record<string, boolean> = {};
          list.forEach((a) => {
            initialMap[a.id] = Boolean(a.isFollowing);
          });
          setFollowingMap(initialMap);
        }
      } catch (err) {
        console.error("Failed to load recommended actors:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFollow = (actor: ActorSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please sign in to follow fellowship teams");
      return;
    }

    const current = followingMap[actor.id] || false;
    const next = !current;
    setFollowingMap((prev) => ({ ...prev, [actor.id]: next }));
    toast.success(next ? `Now following ${actor.displayName}` : `Unfollowed ${actor.displayName}`);
  };

  return (
    <div
      className={cn(
        "border border-border/60 bg-card rounded-xl p-4 sm:p-5 shadow-xs space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-semibold text-foreground text-sm tracking-tight">
            Ministry Teams
          </h3>
        </div>
        <Link
          href="/leaders"
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-0.5"
        >
          <span>All Teams</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>

      <div className="divide-y divide-border/40">
        {loading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Loading fellowship ministries...
          </div>
        ) : (
          actors.slice(0, 5).map((actor) => {
            const isFollowing = followingMap[actor.id] || false;
            const isOfficial = actor.type === "official" || actor.handle === "fellow";

            return (
              <div
                key={actor.id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    className={cn(
                      "h-8 w-8 shrink-0 border border-border/60",
                      isOfficial && "ring-1.5 ring-primary/40"
                    )}
                  >
                    {actor.avatarUrl && <AvatarImage src={actor.avatarUrl} alt={actor.displayName} />}
                    <AvatarFallback className="text-[10px] font-semibold bg-muted">
                      {actor.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {actor.displayName}
                      </span>
                      {isOfficial && (
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      @{actor.handle} • {actor.followersCount || actor.followerCount || 0} followers
                    </span>
                  </div>
                </div>

                <Button
                  variant={isFollowing ? "outline" : "secondary"}
                  size="sm"
                  onClick={(e) => handleToggleFollow(actor, e)}
                  className={cn(
                    "h-7 px-2.5 text-[11px] font-medium shrink-0 rounded-full",
                    isFollowing
                      ? "text-muted-foreground border-border hover:text-destructive hover:border-destructive/40"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      <span>Follow</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
