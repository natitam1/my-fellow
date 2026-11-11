"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  submitWriterRequest,
  fetchMyWriterRequest,
} from "@/lib/devotions-api";
import { useAuth } from "@/context/AuthContext";
import { PenLine, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

interface DevotionWriterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevotionWriterModal({
  open,
  onOpenChange,
}: DevotionWriterModalProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [reason, setReason] = useState("");
  const [sampleTitle, setSampleTitle] = useState("");
  const [sampleContent, setSampleContent] = useState("");
  const [language, setLanguage] = useState("Amharic & English");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open && isAuthenticated) {
      fetchMyWriterRequest().then((res) => {
        if (res.hasApplied) {
          setHasApplied(true);
          setApplicationStatus(res.status || "pending");
        }
      });
    }
  }, [open, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to submit a devotion writer application.");
      return;
    }

    if (!reason.trim() || !sampleTitle.trim() || !sampleContent.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitWriterRequest({
        reason: reason.trim(),
        sampleDevotionTitle: sampleTitle.trim(),
        sampleDevotionContent: sampleContent.trim(),
        preferredLanguage: language,
      });

      if (res.success) {
        toast.success(res.message);
        setHasApplied(true);
        setApplicationStatus("pending");
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      }
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already an admin or leader who can publish directly
  if (isAdmin || user?.role === "leader") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle>Author Devotions</DialogTitle>
            <DialogDescription>
              As a fellowship leader or admin, you have direct publishing access
              to create daily devotionals and voice meditations.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can compose new text devotions or upload recorded audio
              meditations with Scripture anchors in the Fellowship Admin Console.
            </p>
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/admin/devotions/new">
                <PenLine className="w-4 h-4 mr-2" />
                Write Devotion in Admin
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <PenLine className="w-5 h-5" />
          </div>
          <DialogTitle>Become a Devotion Writer</DialogTitle>
          <DialogDescription>
            Share God&apos;s Word, spiritual reflections, and encouragement with
            the 4 Kilo Fellowship community.
          </DialogDescription>
        </DialogHeader>

        {hasApplied ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground">
              Application Under Review
            </h4>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your writer request is currently{" "}
              <span className="font-medium text-foreground uppercase text-xs px-2 py-0.5 rounded bg-secondary">
                {applicationStatus || "pending"}
              </span>
              . Fellowship media coordinators review submissions weekly.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-2"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {!isAuthenticated && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  You need to be signed in to submit an application. Please sign
                  in to your fellowship account first.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-medium">
                Why do you want to write devotions for the fellowship? *
              </Label>
              <Textarea
                id="reason"
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Share your spiritual passion, calling, or ministry background..."
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sampleTitle" className="text-xs font-medium">
                Sample Devotion Title *
              </Label>
              <Input
                id="sampleTitle"
                required
                value={sampleTitle}
                onChange={(e) => setSampleTitle(e.target.value)}
                placeholder="e.g. በእርሱ መደገፍ (Resting in Him)"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sampleContent" className="text-xs font-medium">
                Sample Reflection / Excerpt *
              </Label>
              <Textarea
                id="sampleContent"
                required
                rows={4}
                value={sampleContent}
                onChange={(e) => setSampleContent(e.target.value)}
                placeholder="Write a brief sample devotional excerpt (Scripture focus + reflection + practical application)..."
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="language" className="text-xs font-medium">
                Primary Writing Language
              </Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Amharic, English, or bilingual"
                className="text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
