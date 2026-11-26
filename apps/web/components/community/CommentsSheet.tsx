"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Heart,
  Send,
  Loader2,
  Sparkles,
  GraduationCap,
  CornerDownRight,
  ShieldCheck,
} from "lucide-react";
import { Post } from "@/types/community";
import { getPostThread, createPost, toggleLike } from "@/lib/communityApi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommentsSheetProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentAdded?: (postId: string, newReply: Post) => void;
}

const QUICK_REACTIONS = [
  "Amen! 🙏",
  "Praying with you! 🤍",
  "Glory to God! ✨",
  "Such an encouraging word! 📖",
];

export function CommentsSheet({
  post,
  open,
  onOpenChange,
  onCommentAdded,
}: CommentsSheetProps) {
  const { user, isAuthenticated } = useAuth();
  const [replies, setReplies] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedReplyIds, setLikedReplyIds] = useState<Record<string, boolean>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch thread replies whenever target post changes and sheet opens
  useEffect(() => {
    if (!open || !post) return;

    let isMounted = true;
    setIsLoading(true);

    getPostThread(post.id)
      .then((data) => {
        if (isMounted) {
          setReplies(data.replies || []);
          const likedMap: Record<string, boolean> = {};
          (data.replies || []).forEach((r) => {
            if (r.viewer?.liked) likedMap[r.id] = true;
          });
          setLikedReplyIds(likedMap);
        }
      })
      .catch((err) => {
        console.error("Failed to load replies:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, post]);

  const handleQuickReaction = (text: string) => {
    setNewCommentText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const created = await createPost({
        parentId: post.id,
        body: trimmed,
      });

      // Optimistically append new reply
      const replyItem: Post = {
        ...created,
        author: {
          id: user?.id || "me",
          username: user?.fullName ? user.fullName.toLowerCase().replace(/\s+/g, "_") : "fellow_student",
          displayName: user?.fullName || "Fellowship Member",
          avatar: user?.profileImage ? { urls: { sm: user.profileImage, md: user.profileImage, lg: user.profileImage, original: user.profileImage } } : null,
          isVerified: false,
          fellowshipRole: "Fellowship Member",
          department: user?.department || "Student",
          year: user?.yearOfStudy || "Year 3",
        },
      };

      setReplies((prev) => [...prev, replyItem]);
      setNewCommentText("");
      toast.success("Comment added!");

      if (onCommentAdded) {
        onCommentAdded(post.id, replyItem);
      }

      // Scroll to new comment
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLikeReply = async (replyId: string) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to like comments");
      return;
    }

    const isCurrentlyLiked = !!likedReplyIds[replyId];
    setLikedReplyIds((prev) => ({ ...prev, [replyId]: !isCurrentlyLiked }));
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? {
              ...r,
              counts: {
                ...r.counts,
                likes: isCurrentlyLiked
                  ? Math.max(0, (r.counts?.likes || 0) - 1)
                  : (r.counts?.likes || 0) + 1,
              },
            }
          : r
      )
    );

    try {
      await toggleLike(replyId, isCurrentlyLiked);
    } catch {
      // Revert on error
      setLikedReplyIds((prev) => ({ ...prev, [replyId]: isCurrentlyLiked }));
    }
  };

  const formatCommentTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diffSec < 60) return "just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return `${Math.floor(diffHours / 24)}d`;
    } catch {
      return "now";
    }
  };

  if (!post) return null;

  const originalAuthorName =
    post.authorActor?.displayName || post.author?.displayName || "Fellowship Member";
  const originalDepartment =
    post.authorActor?.department || post.author?.department;
  const originalYear = post.authorActor?.year || post.author?.year;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-background border-l border-border/80 shadow-2xl z-50"
        >
          {/* Header */}
          <SheetHeader className="p-4 sm:p-5 border-b border-border/60 text-left shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <SheetTitle className="text-base font-semibold text-foreground">
                Discussion & Reflections
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Campus fellowship conversation on {originalAuthorName}&apos;s post
            </SheetDescription>
          </SheetHeader>

          {/* Original Post Summary Bar */}
          <div className="p-4 bg-muted/30 border-b border-border/60 shrink-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border border-border/60 shrink-0">
                {post.authorActor?.avatarUrl || post.author?.avatar?.urls?.sm ? (
                  <AvatarImage
                    src={post.authorActor?.avatarUrl || post.author?.avatar?.urls?.sm}
                    alt={originalAuthorName}
                  />
                ) : null}
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                  {originalAuthorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {originalAuthorName}
                  </span>
                  {(originalDepartment || originalYear) && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-primary/70 shrink-0" />
                      {originalDepartment}
                      {originalYear && ` · Y${originalYear}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                  {post.body}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Comments List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                      <Skeleton className="h-3 w-full rounded-md" />
                      <Skeleton className="h-3 w-3/4 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : replies.length === 0 ? (
              <div className="py-12 text-center space-y-2.5">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">No comments yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Be the first brother or sister to reply with an encouraging word or prayer.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => {
                  const replyAuthor =
                    reply.authorActor?.displayName || reply.author?.displayName || "Fellowship Member";
                  const replyAvatar =
                    reply.authorActor?.avatarUrl || reply.author?.avatar?.urls?.sm;
                  const replyDept = reply.authorActor?.department || reply.author?.department;
                  const replyYear = reply.authorActor?.year || reply.author?.year;
                  const isLiked = !!likedReplyIds[reply.id];

                  return (
                    <div
                      key={reply.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 border border-border/60 shrink-0">
                        {replyAvatar && <AvatarImage src={replyAvatar} alt={replyAuthor} />}
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {replyAuthor.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {replyAuthor}
                            </span>
                            {(replyDept || replyYear) && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <GraduationCap className="h-2.5 w-2.5 text-primary/70 shrink-0" />
                                {replyDept}
                                {replyYear && ` · Y${replyYear}`}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatCommentTime(reply.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 mt-1 whitespace-pre-line break-words leading-relaxed">
                          {reply.body}
                        </p>

                        {/* Reply Action */}
                        <div className="mt-2 flex items-center gap-3 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleToggleLikeReply(reply.id)}
                            className={cn(
                              "flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors",
                              isLiked && "text-red-500 font-semibold"
                            )}
                            aria-label="Like reply"
                          >
                            <Heart
                              className={cn(
                                "h-3.5 w-3.5",
                                isLiked && "fill-current"
                              )}
                            />
                            <span>{reply.counts?.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Quick Reaction Pills */}
          <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {QUICK_REACTIONS.map((reaction, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickReaction(reaction)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border/70 bg-card hover:bg-muted text-foreground/80 hover:text-foreground whitespace-nowrap transition-colors shrink-0"
              >
                {reaction}
              </button>
            ))}
          </div>

          {/* Bottom Comment Composer */}
          <form
            onSubmit={handleSubmitComment}
            className="p-3 sm:p-4 border-t border-border/60 bg-background shrink-0 space-y-2"
          >
            <div className="flex gap-2 items-start">
              <Textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write an encouraging reflection or prayer..."
                rows={2}
                className="resize-none text-xs rounded-xl border-border/70 focus-visible:ring-primary min-h-[56px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newCommentText.trim() || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-9 px-4 shrink-0 font-medium text-xs self-end"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1" />
                    <span>Reply</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Auth Modal Trigger for unauthenticated visitors */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
