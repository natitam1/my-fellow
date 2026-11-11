"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Headphones,
  Gauge,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DevotionAudioPlayerProps {
  audioUrl: string;
  title: string;
  author: string;
  duration?: string;
  className?: string;
  variant?: "inline" | "docked";
}

export function DevotionAudioPlayer({
  audioUrl,
  title,
  author,
  duration: initialDurationStr,
  className,
  variant = "inline",
}: DevotionAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Parse initial duration string if given as fallback (e.g. "03:38")
  useEffect(() => {
    if (initialDurationStr && duration === 0) {
      const parts = initialDurationStr.split(":").map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setDuration(parts[0] * 60 + parts[1]);
      }
    }
  }, [initialDurationStr, duration]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(null);
        })
        .catch((err) => {
          console.warn("Audio play prevented or failed:", err);
          setAudioError("Unable to play audio. Tap play again to start.");
        });
    }
  }, [isPlaying]);

  // Skip forward / backward
  const skip = useCallback(
    (seconds: number) => {
      if (!audioRef.current) return;
      const newTime = Math.max(
        0,
        Math.min(duration || 1000, audioRef.current.currentTime + seconds),
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration],
  );

  // Speed cycle
  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Volume toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
      audioRef.current.volume = volume || 0.85;
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Time scrubbing calculation
  const seekToPosition = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || (!duration && !audioRef.current?.duration))
        return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = ratio * (duration || audioRef.current?.duration || 0);

      setCurrentTime(targetTime);
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
      }
    },
    [duration],
  );

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekToPosition(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        seekToPosition(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, seekToPosition]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // Waveform Bar Heights (32 bars pseudo-random symmetrical waveform)
  const waveBars = [
    25, 40, 55, 30, 75, 90, 60, 45, 80, 100, 70, 50, 85, 95, 65, 40, 70, 90,
    85, 60, 95, 75, 45, 80, 60, 90, 70, 50, 75, 40, 30, 20,
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-4 sm:p-5 shadow-sm transition-all",
        variant === "docked" &&
          "fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 shadow-xl border-primary/20",
        className,
      )}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsLoaded(true);
            setAudioError(null);
          }
        }}
        onTimeUpdate={() => {
          if (!isDragging && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}
        onError={() => {
          setAudioError("Audio playback error. Please verify your connection.");
          setIsPlaying(false);
        }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold tracking-tight text-foreground truncate">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              Narrated by {author}
            </p>
          </div>
        </div>

        {/* Speed & Direct Download */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={cyclePlaybackRate}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-mono transition-colors"
            title="Playback Speed"
          >
            <Gauge className="w-3 h-3 text-primary" />
            <span>{playbackRate}x</span>
          </button>

          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Download Audio"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Waveform Visualizer Simulation */}
      <div className="py-2">
        <div
          ref={progressBarRef}
          onClick={(e) => seekToPosition(e.clientX)}
          onMouseDown={handleSeekMouseDown}
          className="relative h-12 flex items-center justify-between gap-[3px] cursor-pointer group select-none px-1 rounded-lg hover:bg-primary/[0.03] transition-colors"
          title="Click or drag to scrub audio"
        >
          {waveBars.map((heightPercent, idx) => {
            const barRatio = idx / waveBars.length;
            const isPlayed = progressPercent / 100 >= barRatio;
            // Dynamic subtle animation when playing
            const dynamicScale =
              isPlaying && isPlayed ? 0.8 + ((idx % 4) * 0.1) : 1;

            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center h-full"
              >
                <div
                  style={{
                    height: `${heightPercent * dynamicScale}%`,
                  }}
                  className={cn(
                    "w-full max-w-[5px] rounded-full transition-all duration-150",
                    isPlayed
                      ? "bg-primary"
                      : "bg-muted-foreground/25 group-hover:bg-muted-foreground/40",
                  )}
                />
              </div>
            );
          })}

          {/* Scrub Hover Indicator / Progress bar line */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-full w-full overflow-hidden"
          >
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-1 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-border/50">
        {/* Rewind 10s */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => skip(-10)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Primary Play/Pause Button */}
          <Button
            type="button"
            onClick={togglePlay}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-transform active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>

          {/* Forward 10s */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => skip(10)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Skip forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Scrub */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Audio Volume"
            className="w-16 sm:w-24 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {audioError && (
        <p className="text-xs text-destructive mt-2 text-center">
          {audioError}
        </p>
      )}
    </div>
  );
}
