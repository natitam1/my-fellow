"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityFeedSkeletonProps {
  count?: number;
}

export function CommunityFeedSkeleton({ count = 3 }: CommunityFeedSkeletonProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading community posts">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-border/60 bg-card rounded-xl p-4 sm:p-5 shadow-xs space-y-4 animate-pulse"
        >
          {/* Header Row: Avatar + Name + Department/Year + Action Menu */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28 sm:w-36 rounded-md" />
                  <Skeleton className="h-3.5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
              </div>
            </div>
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          </div>

          {/* Content Body Lines */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3.5 w-[94%] rounded-md" />
            <Skeleton className="h-3.5 w-[86%] rounded-md" />
            {index % 2 === 0 && <Skeleton className="h-3.5 w-[62%] rounded-md" />}
          </div>

          {/* Optional media placeholder on every second skeleton */}
          {index === 1 && (
            <Skeleton className="h-48 sm:h-64 w-full rounded-lg" />
          )}

          {/* Action Row */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-8 rounded-md" />
            <Skeleton className="h-6 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
