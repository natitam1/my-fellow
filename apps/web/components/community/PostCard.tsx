"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Post } from "@/types/community";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActorBadge } from "./ActorBadge";
import { ImageGallery } from "./ImageGallery";
import { toggleLike, toggleBookmark, toggleRepost, deletePost } from "@/lib/communityApi";
import { parseScriptureQuote } from "@/lib/scriptureUtils";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  isDetail?: boolean;
  onPostDeleted?: (postId: string) => void;
  onCommentClick?: (post: Post) => void;
  className?: string;
}

export function PostCard({
  post,
  isDetail = false,
  onPostDeleted,
  onCommentClick,
  className,
}: PostCardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [liked, setLiked] = useState(post.viewer?.liked || false);
  const [likeCount, setLikeCount] = useState(post.counts?.likes || 0);
  const [bookmarked, setBookmarked] = useState(post.viewer?.bookmarked || false);
  const [reposted, setReposted] = useState(post.viewer?.reposted || false);
  const [repostCount, setRepostCount] = useState(post.counts?.reposts || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Author details
  const actor = post.authorActor;
  const isOfficial = actor?.type === "official" || actor?.handle === "fellow";
  const authorName = actor ? actor.displayName : post.author?.displayName || "Fellowship Member";
  const authorHandle = actor ? actor.handle : post.author?.username || "fellow";
  const avatarUrl =
    actor?.avatarUrl ||
    post.author?.avatar?.urls?.sm ||
    post.author?.avatar?.urls?.original ||
    null;

  // Student Department and Academic Year
  const department = actor?.department || post.author?.department;
  const academicYear = actor?.year || post.author?.year;

  // Formatted Scripture Quote Detection
  const parsedScripture = parseScriptureQuote(post.body);

  // Format relative timestamp
  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 60) return "just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please sign in to like fellowship posts");
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleLike(post.id, liked);
      if (typeof res.likeCount === "number") {
        setLikeCount(res.likeCount);
      }
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikeCount(post.counts?.likes || 0);
      toast.error("Failed to update reaction");
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please sign in to bookmark posts");
      return;
    }

    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);
    toast.success(nextBookmarked ? "Post saved to bookmarks" : "Post removed from bookmarks");

    try {
      await toggleBookmark(post.id, bookmarked);
    } catch {
      setBookmarked(bookmarked);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please sign in to repost");
      return;
    }

    const nextReposted = !reposted;
    setReposted(nextReposted);
    setRepostCount((prev) => (nextReposted ? prev + 1 : Math.max(0, prev - 1)));
    toast.success(nextReposted ? "Reposted to your followers" : "Repost removed");

    try {
      await toggleRepost(post.id, reposted);
    } catch {
      setReposted(reposted);
      setRepostCount(post.counts?.reposts || 0);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/community/post/${post.id}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${authorName} on 4 Kilo Fellowship`,
          text: post.body?.slice(0, 100) || "Check out this fellowship reflection",
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Post link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await deletePost(post.id);
      toast.success("Post deleted");
      if (onPostDeleted) {
        onPostDeleted(post.id);
      } else if (isDetail) {
        router.push("/community");
      }
    } catch (err) {
      toast.error("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCommentClick) {
      onCommentClick(post);
    } else if (!isDetail) {
      router.push(`/community/post/${post.id}#replies`);
    }
  };

  const canDelete =
    Boolean(user?.id && (user.id === post.author.id || user.id === post.createdByUserId)) ||
    isAdmin;

  // Render text with clickable hashtags and mentions
  const renderFormattedBody = (content: string | null) => {
    if (!content) return null;

    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        const tag = part.slice(1).replace(/[^a-zA-Z0-9_]/g, "");
        const trailing = part.slice(tag.length + 1);
        return (
          <React.Fragment key={index}>
            <Link
              href={`/community?tag=${tag.toLowerCase()}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:underline font-medium inline-block"
            >
              #{tag}
            </Link>
            {trailing}
          </React.Fragment>
        );
      }
      return part;
    });
  };

  return (
    <article
      onClick={() => {
        if (!isDetail) {
          router.push(`/community/post/${post.id}`);
        }
      }}
      className={cn(
        "group relative border border-border/60 bg-card rounded-xl p-4 sm:p-5 transition-all duration-200",
        !isDetail && "hover:border-border hover:shadow-xs cursor-pointer",
        isDeleting && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Repost Header if applicable */}
      {post.kind === "repost" && post.repostOf && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
          <Repeat2 className="h-3.5 w-3.5 text-primary" />
          <span>{post.author.displayName} reposted</span>
        </div>
      )}

      {/* Main Post Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={actor?.type === "team" ? `/community?actor=${actor.handle}` : "#"}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 group/avatar"
          >
            <Avatar
              className={cn(
                "h-10 w-10 border border-border/60 transition-transform duration-150 group-hover/avatar:scale-105",
                isOfficial && "ring-2 ring-primary/40"
              )}
            >
              {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {authorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground text-sm tracking-tight truncate hover:underline">
                {authorName}
              </span>
              <ActorBadge
                actor={actor}
                role={post.author?.fellowshipRole}
                ministryBadge={post.author?.ministryBadge}
                isVerified={post.author?.isVerified}
              />
            </div>

            {/* University Department & Year Info */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <span>@{authorHandle}</span>
              {(department || academicYear) && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-muted-foreground/90 font-medium">
                    <GraduationCap className="h-3 w-3 text-primary/70 shrink-0" />
                    <span>{department}</span>
                    {academicYear && <span>· Year {academicYear}</span>}
                  </span>
                </>
              )}
              <span>•</span>
              <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}>
                {formatTimestamp(post.createdAt)}
              </time>
            </div>
          </div>
        </div>

        {/* Post Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
              aria-label="More post options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={handleShare}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Copy post link</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBookmark}>
              <Bookmark className={cn("h-4 w-4 mr-2", bookmarked && "fill-current text-primary")} />
              <span>{bookmarked ? "Remove bookmark" : "Bookmark post"}</span>
            </DropdownMenuItem>
            {!isDetail && (
              <DropdownMenuItem onClick={() => router.push(`/community/post/${post.id}`)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                <span>Open discussion</span>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete post</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Formatted Scripture Quote Callout if found in post */}
      {parsedScripture && (
        <div className="mt-3 p-3.5 rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>{parsedScripture.reference}</span>
          </div>
          <p className="text-xs sm:text-sm italic text-foreground/90 leading-relaxed font-medium">
            &ldquo;{parsedScripture.quote}&rdquo;
          </p>
        </div>
      )}

      {/* Post Body (or Remaining Text after scripture quote) */}
      {parsedScripture ? (
        parsedScripture.remainingText ? (
          <div className="mt-2.5 text-sm text-foreground/90 whitespace-pre-line break-words leading-relaxed">
            {renderFormattedBody(parsedScripture.remainingText)}
          </div>
        ) : null
      ) : (
        post.body && (
          <div className="mt-3 text-sm text-foreground/90 whitespace-pre-line break-words leading-relaxed">
            {renderFormattedBody(post.body)}
          </div>
        )
      )}

      {/* Media Attachments Gallery */}
      {post.media && post.media.length > 0 && <ImageGallery media={post.media} />}

      {/* Quoted Post Card */}
      {post.quoted && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/community/post/${post.quoted?.id}`);
          }}
          className="mt-3 border border-border/80 rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-foreground">
              {post.quoted.authorActor?.displayName || post.quoted.author.displayName}
            </span>
            <span className="text-muted-foreground">
              @{post.quoted.authorActor?.handle || post.quoted.author.username}
            </span>
          </div>
          <p className="text-foreground/80 line-clamp-3">{post.quoted.body}</p>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-muted-foreground text-xs select-none">
        {/* Like Reaction Button */}
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 py-1 px-2.5 rounded-full transition-colors group/btn",
            liked
              ? "text-red-500 font-semibold bg-red-500/10"
              : "hover:text-red-500 hover:bg-red-500/10"
          )}
          aria-label={liked ? "Unlike reflection" : "Like reflection"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-150 group-active/btn:scale-125",
              liked && "fill-current"
            )}
          />
          <span>{likeCount}</span>
        </button>

        {/* Comment Discussion Button (Opens Comments Drawer / Sheet) */}
        <button
          type="button"
          onClick={handleCommentClick}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:text-primary hover:bg-primary/10 transition-colors group/btn"
          aria-label={`View comments (${post.counts?.replies || 0})`}
        >
          <MessageCircle className="h-4 w-4 transition-transform duration-150 group-active/btn:scale-110" />
          <span>{post.counts?.replies || 0}</span>
        </button>

        {/* Repost Toggle */}
        <button
          type="button"
          onClick={handleRepost}
          className={cn(
            "flex items-center gap-1.5 py-1 px-2.5 rounded-full transition-colors group/btn",
            reposted
              ? "text-green-500 font-semibold bg-green-500/10"
              : "hover:text-green-500 hover:bg-green-500/10"
          )}
          aria-label="Repost reflection"
        >
          <Repeat2
            className={cn(
              "h-4 w-4 transition-transform duration-150 group-active/btn:rotate-180",
              reposted && "stroke-[2.5]"
            )}
          />
          <span>{repostCount}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1 py-1 px-2.5 rounded-full hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Share reflection link"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            "flex items-center gap-1 py-1 px-2.5 rounded-full transition-colors",
            bookmarked ? "text-primary bg-primary/10" : "hover:text-primary hover:bg-primary/10"
          )}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark reflection"}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </button>
      </div>
    </article>
  );
}
