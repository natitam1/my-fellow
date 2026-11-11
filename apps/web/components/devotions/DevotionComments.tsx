"use client";

import React, { useState, useEffect } from "react";
import { DevotionComment } from "@/types/devotion";
import {
  fetchDevotionComments,
  postDevotionComment,
} from "@/lib/devotions-api";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  Heart,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface DevotionCommentsProps {
  devotionId: string;
  devotionTitle: string;
}

export function DevotionComments({
  devotionId,
  devotionTitle,
}: DevotionCommentsProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<DevotionComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchDevotionComments(devotionId)
      .then((data) => {
        if (isMounted) {
          setComments(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [devotionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to share a reflection with the fellowship.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await postDevotionComment(
        devotionId,
        newComment.trim(),
        user
          ? {
              fullName: user.fullName,
              profileImage: user.profileImage,
              role: user.role,
            }
          : undefined,
      );

      setComments((prev) => [created, ...prev]);
      setNewComment("");
      toast.success("Reflection posted! Thank you for sharing.");
    } catch {
      toast.error("Could not post reflection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setLikedCommentIds((prev) => {
      const current = Boolean(prev[commentId]);
      return { ...prev, [commentId]: !current };
    });

    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId || c.id === commentId) {
          const isCurrentlyLiked = likedCommentIds[commentId];
          const newLikes = isCurrentlyLiked
            ? Math.max(0, (c.likesCount || 1) - 1)
            : (c.likesCount || 0) + 1;
          return { ...c, likesCount: newLikes };
        }
        return c;
      }),
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-border/80">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Community Reflections
            </h3>
            <p className="text-xs text-muted-foreground">
              {comments.length} {comments.length === 1 ? "reflection" : "reflections"} on this quiet time
            </p>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm focus-within:border-primary/50 transition-colors">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {user?.fullName?.slice(0, 2).toUpperCase() || "ME"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? `Share how this word spoke to you today...`
                    : `Sign in to share how this devotion encouraged you...`
                }
                rows={2}
                disabled={!isAuthenticated || isSubmitting}
                className="w-full text-sm border-0 focus-visible:ring-0 focus-visible:outline-none p-0 resize-none shadow-none bg-transparent placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-primary" />
              Fellowship edification & grace
            </span>

            {isAuthenticated ? (
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isSubmitting}
                className="h-8 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-xs"
              >
                {isSubmitting ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Share Reflection
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                asChild
              >
                <a href="/signin">
                  <Lock className="w-3 h-3 mr-1.5 text-primary" />
                  Sign In to Share
                </a>
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="p-4 rounded-xl border border-border/50 bg-card animate-pulse space-y-2"
            >
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-border/80 bg-muted/20">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-foreground">
            No reflections shared yet
          </h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
            Be the first to share how today&apos;s devotion on &ldquo;{devotionTitle}&rdquo; touched your heart.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isLiked = Boolean(likedCommentIds[comment._id]);
            let timeAgo = "recently";
            try {
              timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              });
            } catch {}

            return (
              <article
                key={comment._id}
                className="p-4 rounded-xl border border-border/70 bg-card hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                        {comment.authorName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {comment.authorName}
                        </span>
                        {comment.authorRole && (
                          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary truncate">
                            {comment.authorRole}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Like comment button */}
                  <button
                    type="button"
                    onClick={() => toggleCommentLike(comment._id)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors py-1 px-1.5 rounded"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span>{comment.likesCount || 0}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-9">
                  {comment.content}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
