"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  X,
  Loader2,
  Send,
  LogIn,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ActorSummary, MediaAssetVariant, Post } from "@/types/community";
import {
  getPostableActors,
  createPost,
  uploadCommunityMedia,
} from "@/lib/communityApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/layout/AuthModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PostComposerProps {
  onPostCreated?: (newPost: Post) => void;
  parentId?: string;
  placeholder?: string;
  defaultTag?: string;
  className?: string;
}

const COMMON_TAGS = [
  "#prayer",
  "#announcement",
  "#reflection",
  "#worship",
  "#fellowship",
  "#testimony",
];

export function PostComposer({
  onPostCreated,
  parentId,
  placeholder = "Share a fellowship reflection, encouragement, or prayer request...",
  defaultTag,
  className,
}: PostComposerProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [body, setBody] = useState(defaultTag ? `${defaultTag} ` : "");
  const [actors, setActors] = useState<ActorSummary[]>([]);
  const [selectedActor, setSelectedActor] = useState<ActorSummary | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetVariant[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch postable actors on mount or auth change
  useEffect(() => {
    let isMounted = true;
    async function loadActors() {
      if (!isAuthenticated) return;
      try {
        const list = await getPostableActors();
        if (isMounted && list.length > 0) {
          setActors(list);
          const defaultActor = list.find((a) => a.isDefault) || list[0];
          setSelectedActor(defaultActor);
        }
      } catch (err) {
        console.error("Failed to load postable actors:", err);
      }
    }
    loadActors();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin]);

  // Handle media file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaAssets.length >= 4) {
      toast.warning("Maximum 4 images allowed per post");
      return;
    }

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10MB)");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadCommunityMedia(file);
      if (result.asset) {
        setMediaAssets((prev) => [...prev, result.asset]);
        toast.success("Image attached");
      }
    } catch (err) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMediaAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    if (!body.includes(tag)) {
      setBody((prev) => (prev.trim().length > 0 ? `${prev.trim()} ${tag} ` : `${tag} `));
    }
  };

  // Submit Post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const trimmed = body.trim();
    if (!trimmed && mediaAssets.length === 0) {
      toast.error("Please add text or an image to your post");
      return;
    }

    if (trimmed.length > 500) {
      toast.error("Post cannot exceed 500 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const authorActorId =
        selectedActor && selectedActor.id !== "me" ? selectedActor.id : undefined;

      const newPost = await createPost({
        body: trimmed,
        mediaAssetIds: mediaAssets.map((m) => m.id),
        authorActorId,
        parentId,
      });

      toast.success(parentId ? "Reply posted" : "Post shared with fellowship!");
      setBody("");
      setMediaAssets([]);
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "Failed to create post";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          "border border-border/60 bg-card rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 shadow-xs",
          className
        )}
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Join the Fellowship Community
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            Sign in to share reflections, post prayer requests, and interact with
            fellowship teams.
          </p>
        </div>
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium h-9 px-4 rounded-lg mt-1"
        >
          <LogIn className="h-3.5 w-3.5 mr-1.5" />
          Sign In to Fellowship
        </Button>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    );
  }

  const charCount = body.length;
  const isOverLimit = charCount > 500;
  const isOfficialActor =
    selectedActor?.type === "official" || selectedActor?.handle === "fellow";
  const isTeamActor = selectedActor?.type === "team";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border border-border/60 bg-card rounded-xl p-4 sm:p-5 shadow-xs transition-shadow duration-200 focus-within:border-border",
        className
      )}
    >
      {/* Top Header: Actor Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50 gap-2">
        <div className="flex items-center gap-2">
          {actors.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 gap-2 px-2.5 rounded-full text-xs font-medium border-border/70 hover:bg-muted/80",
                    isOfficialActor && "border-primary/40 bg-primary/5 text-primary"
                  )}
                >
                  <Avatar className="h-5 w-5">
                    {selectedActor?.avatarUrl ? (
                      <AvatarImage src={selectedActor.avatarUrl} alt={selectedActor.displayName} />
                    ) : (
                      <AvatarImage src={user?.profileImage} alt={user?.fullName || "User"} />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {(selectedActor?.displayName || user?.fullName || "M").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {selectedActor?.displayName || "Post as Myself"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Select identity to post as
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actors.map((actor) => {
                  const isCurrent = selectedActor?.id === actor.id;
                  const isOff = actor.type === "official" || actor.handle === "fellow";
                  const isTm = actor.type === "team";

                  return (
                    <DropdownMenuItem
                      key={actor.id}
                      onClick={() => setSelectedActor(actor)}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-6 w-6 shrink-0">
                          {actor.avatarUrl ? (
                            <AvatarImage src={actor.avatarUrl} alt={actor.displayName} />
                          ) : (
                            <AvatarImage src={user?.profileImage} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {actor.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium truncate">
                              {actor.displayName}
                            </span>
                            {isOff && (
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1 py-0 h-4"
                              >
                                Official
                              </Badge>
                            )}
                            {isTm && !isOff && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 text-muted-foreground"
                              >
                                Team
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            @{actor.handle}
                          </span>
                        </div>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.profileImage} alt={user?.fullName || "User"} />
                <AvatarFallback className="text-[10px]">
                  {(user?.fullName || "M").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user?.fullName || "Posting as Yourself"}</span>
            </div>
          )}
        </div>

        {/* Character Count Indicator */}
        <span
          className={cn(
            "text-[11px] tabular-nums font-mono",
            isOverLimit
              ? "text-destructive font-bold"
              : charCount > 450
              ? "text-amber-500 font-semibold"
              : "text-muted-foreground"
          )}
        >
          {charCount}/500
        </span>
      </div>

      {/* Text Area */}
      <div className="mt-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          className="min-h-[90px] border-none bg-transparent resize-none p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/70"
          maxLength={600}
        />
      </div>

      {/* Image Preview Grid */}
      {mediaAssets.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {mediaAssets.map((asset, index) => (
            <div
              key={asset.id || index}
              className="relative h-20 rounded-lg overflow-hidden border border-border group"
            >
              <Image
                src={asset.urls.sm || asset.urls.original}
                alt="Upload preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Hashtag Chips */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-muted-foreground mr-1">Tags:</span>
        {COMMON_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="text-[11px] px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors select-none font-medium"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
        {/* Attachment Buttons */}
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || mediaAssets.length >= 4}
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <ImageIcon className="h-4 w-4 text-primary" />
            )}
            <span>{isUploading ? "Uploading..." : "Add Photo"}</span>
          </Button>
        </div>

        {/* Submit Post Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isUploading || isOverLimit || (body.trim().length === 0 && mediaAssets.length === 0)}
          className="h-8 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>{parentId ? "Reply" : "Post"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
