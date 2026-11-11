"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { MediaAssetVariant } from "@/types/community";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  media: MediaAssetVariant[];
  className?: string;
}

export function ImageGallery({ media, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!media || media.length === 0) return null;

  const count = media.length;

  return (
    <>
      <div
        className={cn(
          "mt-3 rounded-xl overflow-hidden border border-border/60 bg-muted/20 select-none",
          count === 1 && "max-h-[480px]",
          count === 2 && "grid grid-cols-2 gap-1.5 h-64 sm:h-72",
          count === 3 && "grid grid-cols-2 gap-1.5 h-72 sm:h-80",
          count >= 4 && "grid grid-cols-2 gap-1.5 h-72 sm:h-80",
          className
        )}
      >
        {count === 1 && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(media[0].urls.original || media[0].urls.lg || media[0].urls.md);
            }}
            className="relative w-full h-[320px] sm:h-[400px] cursor-pointer group overflow-hidden bg-black/5 dark:bg-black/20"
          >
            <Image
              src={media[0].urls.lg || media[0].urls.md || media[0].urls.original}
              alt={media[0].altText || "Community attachment"}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm text-foreground">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
          </div>
        )}

        {count === 2 &&
          media.slice(0, 2).map((item, index) => (
            <div
              key={item.id || index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(item.urls.original || item.urls.lg || item.urls.md);
              }}
              className="relative w-full h-full cursor-pointer group overflow-hidden bg-black/5 dark:bg-black/20"
            >
              <Image
                src={item.urls.md || item.urls.lg || item.urls.original}
                alt={item.altText || `Attachment ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm text-foreground">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}

        {count === 3 && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(media[0].urls.original || media[0].urls.lg || media[0].urls.md);
              }}
              className="relative w-full h-full cursor-pointer group overflow-hidden row-span-2 bg-black/5 dark:bg-black/20"
            >
              <Image
                src={media[0].urls.md || media[0].urls.lg || media[0].urls.original}
                alt={media[0].altText || "Attachment 1"}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm text-foreground">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-1.5 h-full">
              {media.slice(1, 3).map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(item.urls.original || item.urls.lg || item.urls.md);
                  }}
                  className="relative w-full h-full cursor-pointer group overflow-hidden bg-black/5 dark:bg-black/20"
                >
                  <Image
                    src={item.urls.sm || item.urls.md || item.urls.original}
                    alt={item.altText || `Attachment ${index + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm text-foreground">
                      <ZoomIn className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {count >= 4 &&
          media.slice(0, 4).map((item, index) => (
            <div
              key={item.id || index}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(item.urls.original || item.urls.lg || item.urls.md);
              }}
              className="relative w-full h-full cursor-pointer group overflow-hidden bg-black/5 dark:bg-black/20"
            >
              <Image
                src={item.urls.sm || item.urls.md || item.urls.original}
                alt={item.altText || `Attachment ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {index === 3 && count > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl backdrop-blur-xs">
                  +{count - 3}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm text-foreground">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-md border border-border/80">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative w-full h-[80vh] flex items-center justify-center p-2">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Enlarged media"
                fill
                className="object-contain"
                priority
              />
            )}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background border border-border text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
