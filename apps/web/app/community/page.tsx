"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Hash,
  X,
  Filter,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { Post, FeedTab } from "@/types/community";
import { getCommunityFeed } from "@/lib/communityApi";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard } from "@/components/community/PostCard";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { WhoToFollowWidget } from "@/components/community/WhoToFollowWidget";
import { PrayerPromptWidget } from "@/components/community/PrayerPromptWidget";
import { CommunityBanner } from "@/components/community/CommunityBanner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function CommunityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state
  const initialTab = (searchParams.get("tab") as FeedTab) || "all";
  const activeTag = searchParams.get("tag") || null;

  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<{ t: string; id: string } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [composerDefaultTag, setComposerDefaultTag] = useState<string | undefined>(
    activeTag ? `#${activeTag}` : undefined
  );

  // Sync tab with URL if changed
  const handleTabChange = (newTab: FeedTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(window.location.search);
    if (newTab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", newTab);
    }
    router.replace(`/community?${params.toString()}`);
  };

  const clearTagFilter = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("tag");
    router.replace(`/community?${params.toString()}`);
  };

  // Fetch feed
  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCommunityFeed({
        tab: activeTab,
        tag: activeTag || undefined,
        limit: 20,
      });
      setPosts(res.items);
      setNextCursor(res.nextCursor || null);
      setHasMore(Boolean(res.hasMore));
    } catch (err) {
      console.error("Failed to load community feed:", err);
      toast.error("Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, activeTag]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Load more pagination
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getCommunityFeed({
        tab: activeTab,
        tag: activeTag || undefined,
        cursor: nextCursor.t,
        limit: 20,
      });
      setPosts((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor || null);
      setHasMore(Boolean(res.hasMore));
    } catch (err) {
      toast.error("Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  const handlePrayerPromptClick = (tag: string) => {
    if (tag === "#prayer") {
      setActiveTab("prayer_requests");
    }
    setComposerDefaultTag(tag);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Fellowship Banner */}
        <CommunityBanner />

        {/* Main Grid: Feed + Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column */}
          <main className="lg:col-span-8 space-y-4">
            {/* Actor-Based Post Composer */}
            <PostComposer
              key={composerDefaultTag || activeTab}
              defaultTag={composerDefaultTag}
              onPostCreated={handlePostCreated}
            />

            {/* Channels & Tabs */}
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md pt-2 pb-1 space-y-2">
              <CommunityTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />

              {/* Tag Filter Chip if active */}
              {activeTag && (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-medium">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filtering by tag:</span>
                    <span className="font-bold underline">#{activeTag}</span>
                  </div>
                  <button
                    onClick={clearTagFilter}
                    className="p-1 rounded-md hover:bg-primary/20 text-primary transition-colors"
                    aria-label="Clear filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Post Feed List */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">
                  Loading fellowship reflections...
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-10 text-center bg-card/40 space-y-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    No posts found in this channel
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {activeTab === "prayer_requests"
                      ? "There are currently no active prayer requests. Be the first to share your prayer item!"
                      : activeTab === "announcements"
                      ? "No official ministry announcements right now. Check back soon!"
                      : "Be the first to share an encouraging word or testimony with the fellowship."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("all");
                    clearTagFilter();
                  }}
                  className="text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  View All Feed
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="text-xs font-semibold h-9 px-6 rounded-lg border-border hover:bg-muted"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <span>Load More Reflections</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar Widgets */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            {/* Standing in Prayer Prompt */}
            <PrayerPromptWidget onPromptClick={handlePrayerPromptClick} />

            {/* Ministry Teams / Who to Follow */}
            <WhoToFollowWidget />

            {/* Fellowship Code of Love & Honor Card */}
            <div className="border border-border/60 bg-card rounded-xl p-4 sm:p-5 shadow-xs space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Fellowship Community Standards</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                4 Kilo ECSF is built on mutual edification, biblical honor, and love.
                We speak the truth in love and pray continuously for our campus students.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                <span>Addis Ababa University</span>
                <span className="font-semibold text-primary">AAU ECSF</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CommunityContent />
    </Suspense>
  );
}
