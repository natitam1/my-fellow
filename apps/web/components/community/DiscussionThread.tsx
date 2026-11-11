"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { ThreadResponse, Post } from "@/types/community";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiscussionThreadProps {
  initialThread: ThreadResponse;
  className?: string;
}

export function DiscussionThread({ initialThread, className }: DiscussionThreadProps) {
  const [thread, setThread] = useState<ThreadResponse>(initialThread);

  const handleReplyCreated = (newReply: Post) => {
    setThread((prev) => ({
      ...prev,
      post: {
        ...prev.post,
        counts: {
          ...prev.post.counts,
          replies: (prev.post.counts?.replies || 0) + 1,
        },
      },
      replies: [...prev.replies, newReply],
    }));
  };

  const handleReplyDeleted = (replyId: string) => {
    setThread((prev) => ({
      ...prev,
      post: {
        ...prev.post,
        counts: {
          ...prev.post.counts,
          replies: Math.max(0, (prev.post.counts?.replies || 0) - 1),
        },
      },
      replies: prev.replies.filter((r) => r.id !== replyId),
    }));
  };

  const { ancestors, post, replies } = thread;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/60">
        <Link href="/community">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            aria-label="Back to community feed"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-foreground text-base tracking-tight">
            Discussion
          </h1>
          <p className="text-xs text-muted-foreground">
            Fellowship reflection thread
          </p>
        </div>
      </div>

      {/* Ancestor Thread if replying to parent */}
      {ancestors && ancestors.length > 0 && (
        <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
          {ancestors.map((ancestor) => (
            <div key={ancestor.id} className="relative pl-2">
              <PostCard post={ancestor} />
            </div>
          ))}
        </div>
      )}

      {/* Main Post Card */}
      <div className="relative">
        <PostCard post={post} isDetail={true} />
      </div>

      {/* Reply Composer */}
      <div id="reply-composer" className="pt-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Join the conversation
        </h2>
        <PostComposer
          parentId={post.id}
          placeholder="Share an encouraging thought, amen, or reflection..."
          onPostCreated={handleReplyCreated}
        />
      </div>

      {/* Replies Thread Section */}
      <div id="replies" className="pt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Replies ({replies.length})
            </h2>
          </div>
        </div>

        {replies.length === 0 ? (
          <div className="border border-dashed border-border/70 rounded-xl p-8 text-center bg-card/40">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-foreground">No replies yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first brother or sister to reply to this reflection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <PostCard
                key={reply.id}
                post={reply}
                onPostDeleted={handleReplyDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
