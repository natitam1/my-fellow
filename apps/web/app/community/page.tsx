"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  Filter,
  ShieldCheck,
  Megaphone,
  HeartHandshake,
  Flame,
  Users,
  PenSquare,
} from "lucide-react";
import { Post, FeedTab } from "@/types/community";
import { getCommunityFeed } from "@/lib/communityApi";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard } from "@/components/community/PostCard";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { CommentsSheet } from "@/components/community/CommentsSheet";
import { CommunityFeedSkeleton } from "@/components/community/CommunityFeedSkeleton";
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

  // Comments Sheet state
  const [activePostForComments, setActivePostForComments] = useState<Post | null>(null);
  const [commentsSheetOpen, setCommentsSheetOpen] = useState(false);

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
    } catch {
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

  const handleOpenComments = (post: Post) => {
    setActivePostForComments(post);
    setCommentsSheetOpen(true);
  };

  const handleCommentAdded = (postId: string, newReply: Post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              counts: {
                ...p.counts,
                replies: (p.counts?.replies || 0) + 1,
              },
            }
          : p
      )
    );
  };

  const renderEmptyState = () => {
    let icon = <Sparkles className="h-6 w-6 text-primary" />;
    let title = "No reflections found in this channel";
    let desc = "Be the first brother or sister to share an encouraging word or reflection.";

    if (activeTag) {
      title = `No posts tagged #${activeTag}`;
      desc = "No fellowship member has used this hashtag yet. Start the conversation!";
    } else if (activeTab === "prayer_requests") {
      icon = <HeartHandshake className="h-6 w-6 text-primary" />;
      title = "No active prayer requests";
      desc = "There are currently no active prayer requests in this channel. Share what is on your heart or pray for one another.";
    } else if (activeTab === "announcements") {
      icon = <Megaphone className="h-6 w-6 text-primary" />;
      title = "No official announcements right now";
      desc = "Stay tuned! Fellowship leadership and ministry teams will post campus schedule updates and event alerts here.";
    } else if (activeTab === "testimonies") {
      icon = <Flame className="h-6 w-6 text-amber-500" />;
      title = "No testimonies recorded yet";
      desc = "Has God done something remarkable in your exams, project deadlines, or life on campus? Celebrate His faithfulness here!";
    } else if (activeTab === "following") {
      icon = <Users className="h-6 w-6 text-primary" />;
      title = "Your Following feed is quiet";
      desc = "Follow fellowship ministries and student cell groups from the right sidebar to see their latest reflections here.";
    }

    return (
      <div className="border border-dashed border-border/80 rounded-2xl p-8 sm:p-12 text-center bg-card/50 space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          {icon}
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-foreground text-base">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {desc}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTab("all");
              clearTagFilter();
            }}
            className="text-xs rounded-full font-medium h-8 px-4"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            View All Feed
          </Button>
          <Button
            size="sm"
            onClick={() => {
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
            className="text-xs rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 px-4"
          >
            <PenSquare className="h-3.5 w-3.5 mr-1.5" />
            Share a Reflection
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* Fellowship Campus Banner */}
        <CommunityBanner />

        {/* Main Grid: Feed + Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Feed Column */}
          <section aria-label="Community Feed" className="lg:col-span-8 space-y-4">
            {/* Actor-Based Post Composer */}
            <PostComposer
              key={composerDefaultTag || activeTab}
              defaultTag={composerDefaultTag}
              onPostCreated={handlePostCreated}
            />

            {/* Channels & Tabs */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md pt-2 pb-1 space-y-2">
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

            {/* Post Feed List / Loading Skeletons */}
            {isLoading ? (
              <CommunityFeedSkeleton count={3} />
            ) : posts.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onCommentClick={handleOpenComments}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="text-xs font-semibold h-9 px-6 rounded-full border-border hover:bg-muted"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                          <span>Loading more reflections...</span>
                        </>
                      ) : (
                        <span>Load More Reflections</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>

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

      {/* Real-time Comments Drawer / Sheet */}
      <CommentsSheet
        post={activePostForComments}
        open={commentsSheetOpen}
        onOpenChange={setCommentsSheetOpen}
        onCommentAdded={handleCommentAdded}
      />
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
