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
  BookOpen,
  HeartHandshake,
  MessageSquare,
  Hash,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ActorSummary, MediaAssetVariant, Post } from "@/types/community";
import {
  getPostableActors,
  createPost,
  uploadCommunityMedia,
} from "@/lib/communityApi";
import { POPULAR_CAMPUS_VERSES } from "@/lib/scriptureUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

type ComposerMode = "reflection" | "scripture" | "prayer" | "testimony";

const COMMON_TAGS = [
  "#reflection",
  "#scripture",
  "#testimony",
  "#prayer",
  "#worship",
  "#fellowship",
  "#4kilo",
  "#campusministry",
];

export function PostComposer({
  onPostCreated,
  parentId,
  placeholder = "Share a fellowship reflection, scripture verse, or testimony...",
  defaultTag,
  className,
}: PostComposerProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [mode, setMode] = useState<ComposerMode>(
    defaultTag === "#prayer" ? "prayer" : defaultTag === "#testimony" ? "testimony" : "reflection"
  );
  const [body, setBody] = useState(defaultTag ? `${defaultTag} ` : "");
  const [scriptureRef, setScriptureRef] = useState("");
  const [scriptureQuote, setScriptureQuote] = useState("");
  const [showScriptureHelper, setShowScriptureHelper] = useState(false);

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

  // Mode change handler with smart auto-tagging
  const handleModeChange = (newMode: ComposerMode) => {
    setMode(newMode);
    if (newMode === "prayer") {
      if (!body.includes("#prayer")) {
        setBody((prev) => `#prayer ${prev.replace(/#(reflection|scripture|testimony)\s*/g, "").trim()}`);
      }
      setShowScriptureHelper(false);
    } else if (newMode === "testimony") {
      if (!body.includes("#testimony")) {
        setBody((prev) => `#testimony ${prev.replace(/#(reflection|scripture|prayer)\s*/g, "").trim()}`);
      }
      setShowScriptureHelper(false);
    } else if (newMode === "scripture") {
      setShowScriptureHelper(true);
      if (!body.includes("#scripture")) {
        setBody((prev) => (prev ? `${prev} #scripture` : "#scripture "));
      }
    } else {
      setShowScriptureHelper(false);
    }
  };

  // Insert formatted scripture quote into composition
  const handleInsertScripture = (refText?: string, quoteText?: string) => {
    const finalRef = (refText || scriptureRef).trim();
    const finalQuote = (quoteText || scriptureQuote).trim();

    if (!finalRef || !finalQuote) {
      toast.warning("Please provide both scripture reference and verse quote");
      return;
    }

    const formattedQuote = `“${finalQuote}” — ${finalRef}\n\n`;
    setBody((prev) => `${formattedQuote}${prev.replace(/^[“"«][\s\S]+?[”"»]\s*[—–-][^\n]+\n*/, "")}`);
    setScriptureRef("");
    setScriptureQuote("");
    setShowScriptureHelper(false);
    toast.success("Scripture quote added to reflection!");
  };

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
    } catch {
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
      setShowScriptureHelper(false);
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to create post";
      toast.error(message);
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
            Join the 4 Kilo Fellowship Community
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            Sign in with your student phone number to share reflections, scripture verses, prayer items, and testimonies.
          </p>
        </div>
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-5 rounded-full mt-1"
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
      {/* Top Header: Composer Mode Switcher & Actor Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50 gap-2 flex-wrap">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full text-xs">
          <button
            type="button"
            onClick={() => handleModeChange("reflection")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1",
              mode === "reflection"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3 w-3" />
            <span>Reflection</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("scripture")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1",
              mode === "scripture"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-3 w-3" />
            <span>Scripture</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("prayer")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1",
              mode === "prayer"
                ? "bg-card text-primary shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HeartHandshake className="h-3 w-3" />
            <span>Prayer</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("testimony")}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1",
              mode === "testimony"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Testimony</span>
          </button>
        </div>

        {/* Actor Selector (Myself / Ministry Team / Official) */}
        {actors.length > 1 && (
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
                <span className="truncate max-w-[120px] sm:max-w-[160px]">
                  {selectedActor?.displayName || "Myself"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Select identity to post as
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {actors.map((act) => {
                const isCurrent = selectedActor?.id === act.id;
                const isOff = act.type === "official" || act.handle === "fellow";
                const isTm = act.type === "team";

                return (
                  <DropdownMenuItem
                    key={act.id}
                    onClick={() => setSelectedActor(act)}
                    className="flex items-center justify-between py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-6 w-6 shrink-0">
                        {act.avatarUrl ? (
                          <AvatarImage src={act.avatarUrl} alt={act.displayName} />
                        ) : (
                          <AvatarImage src={user?.profileImage} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {act.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">
                            {act.displayName}
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
                              className="text-[9px] px-1 py-0 h-4"
                            >
                              Team
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          @{act.handle}
                        </span>
                      </div>
                    </div>
                    {isCurrent && <Badge className="h-1.5 w-1.5 rounded-full p-0 bg-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Scripture Quote Inserter Drawer/Box */}
      {showScriptureHelper && (
        <div className="my-3 p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <BookOpen className="h-4 w-4" />
              <span>Quote Scripture Verse (Amharic or English)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowScriptureHelper(false)}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              placeholder="e.g. Romans 8:28 or መዝሙር 23:1"
              className="text-xs sm:col-span-1 rounded-lg bg-background"
            />
            <Input
              value={scriptureQuote}
              onChange={(e) => setScriptureQuote(e.target.value)}
              placeholder="Verse text quotation..."
              className="text-xs sm:col-span-2 rounded-lg bg-background"
            />
          </div>

          {/* Quick campus verses shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
              Popular verses:
            </span>
            {POPULAR_CAMPUS_VERSES.slice(0, 4).map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleInsertScripture(v.ref, v.text)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-card border border-border/60 hover:border-primary/50 text-foreground/80 hover:text-foreground whitespace-nowrap shrink-0 transition-colors"
              >
                {v.ref}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              size="sm"
              onClick={() => handleInsertScripture()}
              disabled={!scriptureRef.trim() || !scriptureQuote.trim()}
              className="h-7 text-xs rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3"
            >
              <Plus className="h-3 w-3 mr-1" />
              Format Into Post
            </Button>
          </div>
        </div>
      )}

      {/* Main Composer Text Area */}
      <div className="mt-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            mode === "prayer"
              ? "Share what is on your heart for campus prayer and intercession..."
              : mode === "testimony"
              ? "Celebrate God's faithfulness in exams, project submissions, or campus life..."
              : placeholder
          }
          rows={3}
          className="w-full resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/70 leading-relaxed min-h-[72px]"
        />
      </div>

      {/* Media Attachment Previews */}
      {mediaAssets.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {mediaAssets.map((asset, index) => (
            <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
              <Image
                src={asset.urls.sm || asset.urls.original}
                alt="Upload preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Common Hashtag Chips */}
      <div className="mt-3 pt-2 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center text-muted-foreground text-xs font-medium mr-1 shrink-0">
          <Hash className="h-3 w-3 mr-0.5 text-primary" />
          <span>Tags:</span>
        </div>
        {COMMON_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className={cn(
              "text-[11px] px-2.5 py-0.5 rounded-full border transition-colors shrink-0 font-medium",
              body.includes(tag)
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Footer Controls: Media Button + Character Count + Submit */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || mediaAssets.length >= 4}
            className="h-8 px-2.5 rounded-full text-muted-foreground hover:text-foreground text-xs"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-1" />
            ) : (
              <ImageIcon className="h-4 w-4 text-primary mr-1.5" />
            )}
            <span>Add Photo</span>
          </Button>

          {/* Scripture Inserter Toggle Button */}
          {!showScriptureHelper && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowScriptureHelper(true)}
              className="h-8 px-2.5 rounded-full text-muted-foreground hover:text-primary text-xs"
            >
              <BookOpen className="h-4 w-4 text-primary mr-1.5" />
              <span>Quote Scripture</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-[11px] font-mono",
              isOverLimit
                ? "text-destructive font-bold"
                : charCount > 450
                ? "text-amber-500 font-semibold"
                : "text-muted-foreground"
            )}
          >
            {charCount}/500
          </span>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || isOverLimit || (!body.trim() && mediaAssets.length === 0)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full h-8 px-4 text-xs shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
