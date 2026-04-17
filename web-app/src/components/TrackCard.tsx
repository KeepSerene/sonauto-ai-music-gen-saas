"use client";

import type { Category, Song } from "generated/prisma";
import React, { useState } from "react";
import useAudioPlayerStore from "~/stores/useAudioPlayerStore";
import TrackThumbnail from "./generation/TrackThumbnail";
import { Heart, Loader2, Pause, Play } from "lucide-react";
import { Button } from "./ui/button";
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

  const handlePlayAudio = async () => {
    if (!track.audioUrl) return;

    // If this track is already loaded in the player, show it and toggle play/pause
    if (activeTrack?.id === track.id) {
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
    <article
      onClick={handlePlayAudio}
      className="bg-muted cursor-pointer overflow-hidden rounded-md"
    >
      <div className="group relative">
        <TrackThumbnail
          src={track.thumbnailUrl}
          alt={`${track.title} album cover`}
          className="aspect-square rounded-br-none rounded-bl-none"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity group-hover:opacity-100">
          <div
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className="flex size-12 items-center justify-center rounded-full bg-black/60 transition-transform group-hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="size-6 text-white" />
            ) : (
              <Play className="size-6 text-white" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 p-2 pt-0">
        <h3 className="text-accent-foreground truncate text-sm font-medium">
          {track.title}
        </h3>

        <p className="text-muted-foreground mt-0.5 text-xs">
          {track.user.name}
        </p>

        <div className="text-muted-foreground mt-1 flex items-center justify-between gap-2 text-xs">
          <span>{track.listensCount} listens</span>

          <span className="inline-flex items-center gap-0.5">
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
                  className="rounded-full"
                >
                  {isLoadingLike ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Heart
                      className={cn("size-4", {
                        "fill-pink-500 text-pink-500": hasLiked,
                      })}
                    />
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent>{hasLiked ? "Unlike" : "Like"}</TooltipContent>
            </Tooltip>

            {likesCount}
          </span>
        </div>
      </div>
    </article>
  );
}

export default TrackCard;
