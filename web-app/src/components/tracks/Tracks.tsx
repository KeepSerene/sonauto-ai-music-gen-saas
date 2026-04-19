"use client";

import {
  DownloadCloud,
  Edit3,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Rows4,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import RenameDialog from "./RenameDialog";
import TrackThumbnail from "./TrackThumbnail";
import TracksEmptyState from "./TracksEmptyState";
import {
  incrementListens,
  togglePublish,
  renameTrack,
  getDownloadUrl,
} from "~/server/actions/songs";
import useAudioPlayerStore from "~/stores/useAudioPlayerStore";
import DeleteTrackDialog from "./DeleteTrackDialog";

export interface Track {
  id: string;
  title: string;
  createdAt: Date;
  isInstrumental: boolean;
  prompt: string | null;
  lyrics: string | null;
  thumbnailUrl: string | null;
  audioUrl: string | null;
  status: string;
  generatedBy: string;
  isPublished: boolean;
  errorMessage: string | null;
}

interface TracksProps {
  tracks: Track[];
  hasJustRefunded?: boolean;
}

const SLOW_THRESHOLD_MS = 5 * 60 * 1000; // 5 min — warn user, server cleans up at 15

function Tracks({ tracks, hasJustRefunded = false }: TracksProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackToRename, setTrackToRename] = useState<Track | null>(null);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);

  const activeTrack = useAudioPlayerStore((state) => state.track);
  const setTrack = useAudioPlayerStore((state) => state.setTrack);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const setIsPlaying = useAudioPlayerStore((state) => state.setIsPlaying);
  const setIsDismissed = useAudioPlayerStore((state) => state.setIsDismissed);

  // ── Sync layout (AppSidebar) if server mutated credits ────────────────────────────────
  useEffect(() => {
    if (hasJustRefunded) router.refresh();
  }, [hasJustRefunded, router]);

  // ── Auto-poll while any track is pending ─────────────────────────────────
  // Calls router.refresh() every 5s, which re-runs TracksFetcher on the
  // server and streams fresh props back
  useEffect(() => {
    const hasPending = tracks.some(
      (t) => t.status === "queued" || t.status === "generating",
    );

    if (!hasPending) return;

    const id = setInterval(() => router.refresh(), 5000);

    return () => clearInterval(id);
  }, [tracks, router]);

  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      t.prompt?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      router.refresh();
    } catch {
      toast.error("Failed to refresh tracks. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTrackClick = async (track: Track) => {
    if (loadingTrackId || !track.audioUrl) return;

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
      generatedBy: track.generatedBy,
    });
    setIsDismissed(false);
  };

  const handleTogglePublish = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    try {
      await togglePublish(track.id);
      toast.success(
        track.isPublished ? "Track unpublished." : "Track published!",
      );
    } catch {
      toast.error("Could not update track. Please try again.");
    }
  };

  const handleRename = async (trackId: string, newTitle: string) => {
    try {
      await renameTrack(trackId, newTitle);
      toast.success("Track renamed!");
    } catch {
      toast.error("Could not rename track. Please try again.");
    }
  };

  const handleDownload = async (track: Track) => {
    if (!track.id) return;

    setLoadingTrackId(track.id);

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
      setLoadingTrackId(null);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col lg:h-full",
        "from-primary/3 bg-linear-to-b via-transparent to-transparent",
      )}
    >
      <div className="overflow-y-auto p-5 lg:flex-1">
        {/* ── Search + Refresh ──────────────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tracks"
              placeholder="Search tracks..."
              className="placeholder:text-muted-foreground/60 h-9 pl-9 text-sm"
            />
          </div>

          <Tooltip>
            <TooltipTrigger type="button" asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isRefreshing}
                onClick={handleRefresh}
                aria-label={isRefreshing ? "Refreshing..." : "Refresh"}
                className="size-9 rounded-full"
              >
                {isRefreshing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent side="bottom">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Track list ────────────────────────────────────────────────── */}
        <ul className="space-y-1">
          {filteredTracks.length === 0 ? (
            <TracksEmptyState isFiltered={!!searchQuery && tracks.length > 0} />
          ) : (
            filteredTracks.map((track) => {
              switch (track.status) {
                // ── Failed ────────────────────────────────────────────────
                case "failed":
                  return (
                    <li
                      key={track.id}
                      className="border-destructive/20 bg-destructive/5 flex cursor-not-allowed items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-md">
                        <XCircle className="text-destructive size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-destructive truncate text-sm font-medium">
                          {track.errorMessage ?? "Generation failed"}
                        </p>

                        <p className="text-muted-foreground truncate text-xs">
                          Please try generating the song again.
                        </p>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete track"
                            onClick={() => setTrackToDelete(track)}
                            className="text-muted-foreground hover:text-destructive focus-visible:text-destructive size-8 shrink-0 rounded-full"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>Delete track</TooltipContent>
                      </Tooltip>
                    </li>
                  );

                // ── Queued ────────────────────────────────────────────────
                case "queued": {
                  const isSlowQueued =
                    Date.now() - track.createdAt.getTime() > SLOW_THRESHOLD_MS;

                  return (
                    <li
                      key={track.id}
                      className="border-border/50 flex cursor-not-allowed items-center gap-3 rounded-lg border bg-transparent p-3"
                    >
                      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                        <Rows4 className="text-muted-foreground size-5 animate-pulse" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground truncate text-sm font-medium">
                          Waiting in line...
                        </p>

                        <p
                          className={cn("truncate text-xs", {
                            "text-yellow-500": isSlowQueued,
                            "text-muted-foreground/70": !isSlowQueued,
                          })}
                        >
                          {isSlowQueued
                            ? "Taking longer than expected — still waiting."
                            : "Updating automatically — hang tight."}
                        </p>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Cancel generation"
                            onClick={() => setTrackToDelete(track)}
                            className="text-muted-foreground hover:text-destructive focus-visible:text-destructive size-8 shrink-0 rounded-full"
                          >
                            <X className="size-4" />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>Cancel generation</TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                // ── Generating ────────────────────────────────────────────
                case "generating": {
                  const isSlowGenerating =
                    Date.now() - track.createdAt.getTime() > SLOW_THRESHOLD_MS;

                  return (
                    <li
                      key={track.id}
                      className="border-primary/20 bg-primary/5 flex cursor-not-allowed items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-md">
                        <Loader2 className="text-primary size-5 animate-spin" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          Generating your song...
                        </p>

                        <p
                          className={cn("truncate text-xs", {
                            "text-yellow-500": isSlowGenerating,
                            "text-muted-foreground/70": !isSlowGenerating,
                          })}
                        >
                          {isSlowGenerating
                            ? "Taking longer than expected — still working on it."
                            : "Updating automatically — this can take a minute."}
                        </p>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Cancel generation"
                            onClick={() => setTrackToDelete(track)}
                            className="text-muted-foreground hover:text-destructive focus-visible:text-destructive size-8 shrink-0 rounded-full"
                          >
                            <X className="size-4" />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>Cancel generation</TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                // ── Completed ─────────────────────────────────────────────
                default: {
                  const isActive = activeTrack?.id === track.id;
                  const isThisPlaying = isActive && isPlaying;

                  return (
                    <li
                      key={track.id}
                      onClick={() => handleTrackClick(track)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg p-2.5 transition-all duration-150",
                        track.audioUrl
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-60",
                        isActive
                          ? "bg-primary/8 border-primary/30 border"
                          : "hover:bg-muted/50 border border-transparent",
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="group/thumb relative size-11 shrink-0">
                        <TrackThumbnail
                          src={track.thumbnailUrl}
                          alt={`Album art for ${track.title}`}
                          className="size-11"
                        />

                        {track.audioUrl && (
                          <div
                            aria-label={
                              isThisPlaying ? "Pause track" : "Play track"
                            }
                            className={cn(
                              "absolute inset-0 flex items-center justify-center rounded-md transition-opacity duration-150",
                              "bg-black/30",
                              isThisPlaying
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100",
                            )}
                          >
                            {loadingTrackId === track.id ? (
                              <Loader2 className="size-4 animate-spin text-white" />
                            ) : isThisPlaying ? (
                              <Pause className="size-4 fill-white text-white" />
                            ) : (
                              <Play className="size-4 translate-x-px fill-white text-white" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              "truncate text-sm font-medium transition-colors duration-150",
                              isActive
                                ? "text-primary"
                                : "group-hover:text-foreground",
                            )}
                          >
                            {track.title}
                          </h3>

                          {track.isInstrumental && (
                            <Badge
                              variant="outline"
                              className="border-border/60 text-muted-foreground hidden shrink-0 px-1.5 py-0 text-[10px] sm:inline-flex"
                            >
                              Instrumental
                            </Badge>
                          )}
                        </div>

                        {track.prompt && (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {track.prompt}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleTogglePublish(e, track)}
                          className={cn(
                            "h-7 rounded-md px-2.5 text-xs font-medium",
                            track.isPublished
                              ? "border-red-400/40 text-red-400 hover:border-red-400/60 hover:bg-red-400/10"
                              : "border-border/60",
                          )}
                        >
                          {track.isPublished ? "Unpublish" : "Publish"}
                        </Button>

                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label="More actions"
                                  onClick={(e) => e.stopPropagation()}
                                  className="size-7 rounded-full"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>

                            <TooltipContent side="bottom">
                              More actions
                            </TooltipContent>
                          </Tooltip>

                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="sr-only">
                                More Actions
                              </DropdownMenuLabel>

                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  void handleDownload(track);
                                }}
                                disabled={
                                  !track.audioUrl || loadingTrackId === track.id
                                }
                              >
                                {loadingTrackId === track.id ? (
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

                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setTrackToRename(track);
                                }}
                              >
                                <Edit3 className="size-4" />
                                Rename
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setTrackToDelete(track);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  );
                }
              }
            })
          )}
        </ul>
      </div>

      {trackToRename && (
        <RenameDialog
          track={trackToRename}
          onRename={handleRename}
          onClose={() => setTrackToRename(null)}
        />
      )}

      {trackToDelete && (
        <DeleteTrackDialog
          track={trackToDelete}
          onClose={() => setTrackToDelete(null)}
        />
      )}
    </div>
  );
}

export default Tracks;
