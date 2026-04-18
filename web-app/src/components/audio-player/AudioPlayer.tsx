"use client";

import useAudioPlayerStore from "~/stores/useAudioPlayerStore";
import TrackThumbnail from "../track-generation/TrackThumbnail";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  DownloadCloud,
  FileText,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Volume1,
  Volume2,
  VolumeOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Slider } from "../ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { formatTime } from "~/lib/utils";
import { toast } from "sonner";
import { useSidebar } from "../ui/sidebar";
import { getDownloadUrl } from "~/server/actions/songs";
import LyricsModal from "./LyricsModal";

function AudioPlayer() {
  const track = useAudioPlayerStore((state) => state.track);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const isDismissed = useAudioPlayerStore((state) => state.isDismissed);
  const setIsDismissed = useAudioPlayerStore((state) => state.setIsDismissed);

  const [volume, setVolume] = useState([100]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLyricsModalOpen, setIsLyricsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // audioRef is always mounted (not conditional) so event listeners and effects
  // can reliably reference it from the very first render.
  const audioRef = useRef<HTMLAudioElement>(null);
  const { open, isMobile } = useSidebar();

  // ── Effect 1: new track selected -> load src + auto-play ─────────────────
  useEffect(() => {
    if (!track?.audioUrl) return;

    const audio = audioRef.current;

    if (!audio) return;

    setElapsedTime(0);
    setDuration(0);
    setIsDismissed(false);
    audio.src = track.audioUrl;
    audio.load();

    void audio.play().catch((err: unknown) => {
      console.error("Audio playback failed:", err);
      toast.error("Oops! Playback failed.");
      setIsPlaying(false);
    });

    setIsPlaying(true);
  }, [track, setIsPlaying]);

  // ── Effect 2: isPlaying toggled by user or external caller ───────────────
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio?.src) return;

    if (isPlaying) {
      void audio.play().catch((err: unknown) => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // ── Effect 3: bind persistent audio events (once on mount) ───────────────
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);

    const onTimeUpdate = () => setElapsedTime(audio.currentTime);

    const onEnded = () => {
      setIsPlaying(false);
      setElapsedTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [setIsPlaying]);

  // ── Effect 4: volume knob -> audio element ────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;

    if (audio && volume[0] !== undefined) {
      audio.volume = volume[0] / 100;
    }
  }, [volume]);

  const handleTogglePlay = () => {
    if (!track?.audioUrl) return;

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (values: number[]) => {
    const audio = audioRef.current;

    if (audio && values[0] !== undefined) {
      audio.currentTime = values[0];
      setElapsedTime(values[0]);
    }
  };

  const handleDismiss = () => {
    if (isPlaying) return;

    setIsDismissed(true);
    setIsPlaying(false);
  };

  const handleDownload = async () => {
    if (!track?.id) return;

    setIsDownloading(true);

    try {
      const url = await getDownloadUrl(track.id);
      const a = document.createElement("a");
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Fixed-position offset ─────────────────────────────────────────────────
  const leftOffset = !isMobile && open ? "var(--sidebar-width)" : "0px";

  return (
    <>
      {/*
       * The <audio> element is always in the DOM regardless of whether a
       * track is loaded or whether the player UI is visible. This ensures
       * audioRef.current is never null when effects or event listeners run.
       */}
      <audio ref={audioRef} preload="metadata" className="hidden" />

      {track && !isDismissed && (
        <div
          style={{ left: leftOffset }}
          className="fixed right-0 bottom-0 z-50 p-3 transition-[left] duration-300 ease-in-out"
        >
          <Card className="relative w-full overflow-hidden">
            {/* ── Dismiss button ─────────────────────────────────────────── */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  disabled={isPlaying}
                  aria-label="Close player"
                  className="absolute top-1.5 right-1.5 size-6 rounded-full"
                >
                  <X className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>

            {/* ── Player body ─────────────────────────────────────────────── */}
            <div className="p-3 pr-10 pb-2">
              {/* Top row: thumbnail + title + controls */}
              <div className="flex items-center gap-2">
                {/* Track info */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <TrackThumbnail
                    src={track.thumbnailUrl}
                    alt={`${track.title} album cover`}
                    className="size-10 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {track.title}
                    </p>

                    <p className="text-muted-foreground truncate text-xs">
                      {track.generatedBy}
                    </p>
                  </div>
                </div>

                {/* Play / Pause */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleTogglePlay}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="shrink-0 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    {isPlaying ? "Pause" : "Play"}
                  </TooltipContent>
                </Tooltip>

                {/* Volume slider — hidden on small screens to save space */}
                <div className="hidden items-center gap-1.5 sm:flex">
                  {volume[0] !== undefined &&
                    (volume[0] === 0 ? (
                      <VolumeOff className="text-muted-foreground size-4 shrink-0" />
                    ) : volume[0] > 55 ? (
                      <Volume2 className="text-muted-foreground size-4 shrink-0" />
                    ) : (
                      <Volume1 className="text-muted-foreground size-4 shrink-0" />
                    ))}

                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    min={0}
                    step={1}
                    max={100}
                    aria-label="Volume"
                    className="w-20"
                  />
                </div>

                {/* More actions */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>More actions</TooltipContent>
                  </Tooltip>

                  <DropdownMenuContent align="end" className="w-48">
                    {track.lyrics && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLyricsOpen(true);
                        }}
                      >
                        <FileText className="size-4" />
                        View Lyrics
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      disabled={isDownloading || !track.audioUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        void handleDownload();
                      }}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="size-4" />
                          Download
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress / seek row */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground w-9 shrink-0 text-right text-[10px] tabular-nums">
                  {formatTime(elapsedTime, "clock")}
                </span>

                <Slider
                  value={[elapsedTime]}
                  onValueChange={handleSeek}
                  min={0}
                  step={0.1}
                  max={duration > 0 ? duration : 1}
                  aria-label="Seek"
                  className="flex-1"
                />

                <span className="text-muted-foreground w-9 shrink-0 text-[10px] tabular-nums">
                  {formatTime(duration, "clock")}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <LyricsModal
        isOpen={isLyricsModalOpen}
        onOpenChange={setIsLyricsOpen}
        title={track?.title}
        lyrics={track?.lyrics}
      />
    </>
  );
}

export default AudioPlayer;
