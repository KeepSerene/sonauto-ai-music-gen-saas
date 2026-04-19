"use client";

import type { Category, Song } from "generated/prisma";
import React, { useState } from "react";
import useAudioPlayerStore from "~/stores/useAudioPlayerStore";
import TrackThumbnail from "./tracks/TrackThumbnail";
import { Heart, Loader2, Pause, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { incrementListens, toggleLike } from "~/server/actions/songs";

type TrackCardProps = Song & {
  user: { name: string | null };
  _count: { likes: number };
  categories: Category[];
  thumbnailUrl?: string | null;
  hasLiked: boolean;
};

function TrackCard({ track }: { track: TrackCardProps }) {
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [hasLiked, setHasLiked] = useState(track.hasLiked);
  const [likesCount, setLikesCount] = useState(track._count.likes);

  const activeTrack = useAudioPlayerStore((state) => state.track);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const setIsDismissed = useAudioPlayerStore((state) => state.setIsDismissed);

  const isActiveTrack = activeTrack?.id === track.id;
  const isThisPlaying = isActiveTrack && isPlaying;

  const handlePlayAudio = async () => {
    if (!track.audioUrl) return;

    if (isActiveTrack) {
      setIsDismissed(false);
      setIsPlaying(!isPlaying);
      return;
    }

    void incrementListens(track.id);
    setTrack({
      id: track.id,
      title: track.title,
      lyrics: track.lyrics,
      audioUrl: track.audioUrl,
      thumbnailUrl: track.thumbnailUrl,
      generatedBy: track.user.name,
    });
    setIsDismissed(false);
  };

  const handleToggleLike = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsLoadingLike(true);

    try {
      await toggleLike(track.id);
      setHasLiked((prev) => !prev);
      setLikesCount(hasLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to toggle like!");
    } finally {
      setIsLoadingLike(false);
    }
  };

  return (
    <Card
      onClick={handlePlayAudio}
      className={cn(
        "group cursor-pointer overflow-hidden border py-0 transition-all duration-200",
        "hover:border-primary/40 hover:shadow-primary/10 hover:shadow-md",
        "hover:-translate-y-0.5",
        isActiveTrack && "border-primary/50 shadow-primary/15 shadow-sm",
      )}
    >
      {/* ── Thumbnail ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <TrackThumbnail
          src={track.thumbnailUrl}
          alt={`${track.title} album cover`}
          className="aspect-square w-full rounded-none"
        />

        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200",
            "bg-linear-to-t from-black/50 via-black/10 to-transparent",
            isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <div
            aria-label={isThisPlaying ? "Pause track" : "Play track"}
            className={cn(
              "flex size-11 items-center justify-center rounded-full",
              "bg-black/55 ring-1 ring-white/20 backdrop-blur-sm",
              "transition-transform duration-200",
              "group-hover:scale-105 group-hover:ring-white/40",
            )}
          >
            {isThisPlaying ? (
              <Pause className="size-5 fill-white text-white" />
            ) : (
              <Play className="size-5 translate-x-0.5 fill-white text-white" />
            )}
          </div>
        </div>

        {/* Instrumental badge */}
        {track.isInstrumental && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="border-white/20 bg-black/60 px-1.5 py-0 text-[10px] font-medium text-white backdrop-blur-sm"
            >
              Instrumental
            </Badge>
          </div>
        )}

        {/* Active track playing indicator */}
        {isThisPlaying && (
          <div className="absolute right-2.5 bottom-2.5 flex items-end gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  animation: `audio-play ${0.5 + i * 0.15}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
                className="h-3.5 w-0.75 origin-bottom rounded-full bg-white shadow-sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Info ────────────────────────────────────────────────── */}
      <CardContent className="p-2.5 pt-2">
        <h3
          className={cn(
            "truncate text-sm leading-snug font-semibold tracking-tight transition-colors duration-150",
            isActiveTrack ? "text-primary" : "text-foreground",
          )}
        >
          {track.title}
        </h3>

        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {track.user.name}
        </p>

        {/* Stats row */}
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className="text-muted-foreground text-[11px] tabular-nums">
            {track.listensCount.toLocaleString()}{" "}
            <span className="opacity-70">plays</span>
          </span>

          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleLike}
                  disabled={isLoadingLike}
                  aria-label={
                    isLoadingLike
                      ? "Loading likes for track"
                      : hasLiked
                        ? "Unlike track"
                        : "Like track"
                  }
                  className="size-6 rounded-full"
                >
                  {isLoadingLike ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Heart
                      className={cn("size-3.5 transition-colors duration-150", {
                        "fill-pink-500 text-pink-500": hasLiked,
                        "text-muted-foreground": !hasLiked,
                      })}
                    />
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent>{hasLiked ? "Unlike" : "Like"}</TooltipContent>
            </Tooltip>

            <span className="text-muted-foreground text-[11px] tabular-nums">
              {likesCount.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrackCard;
