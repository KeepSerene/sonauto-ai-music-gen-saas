"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { deleteTrack } from "~/server/actions/songs";
import type { Track } from "./Tracks";

interface DeleteTrackDialogProps {
  track: Track;
  onClose: () => void;
}

function getDialogCopy(status: Track["status"]) {
  switch (status) {
    case "queued":
      return {
        title: "Cancel request?",
        description: "This is waiting in line. You will be refunded 2 credits.",
        warning: null,
        confirmLabel: "Confirm",
      };
    case "generating":
      return {
        title: "Halt processing?",
        description: "This job is already actively running on the GPU.",
        warning: "Your 2 credits will not be refunded.",
        confirmLabel: "Stop",
      };
    case "failed":
      return {
        title: "Clear failed track?",
        description:
          "Clean up this unsuccessful attempt. Credits were already refunded.",
        warning: null,
        confirmLabel: "Discard",
      };
    // Completed
    default:
      return {
        title: "Delete this track?",
        description: "",
        warning: null,
        confirmLabel: "Erase",
      };
  }
}

export default function DeleteTrackDialog({
  track,
  onClose,
}: DeleteTrackDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const copy = getDialogCopy(track.status);
  const description =
    track.status === "completed"
      ? `"${track.title || "This track"}" will be permanently removed. This action cannot be undone.`
      : copy.description;

  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDeleting(true);

    try {
      await deleteTrack(track.id);
      toast.success(
        track.status === "queued"
          ? "Generation canceled. 2 credits refunded."
          : "Track deleted successfully.",
      );
      onClose();
    } catch {
      toast.error("Failed to delete track. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={true}
      onOpenChange={(open) => !open && !isDeleting && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>

          {copy.warning && (
            <div className="bg-destructive/10 border-destructive/30 mt-2 flex items-start gap-2 rounded-md border p-3">
              <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
              <p className="text-destructive text-sm">{copy.warning}</p>
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Keep it</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" />
                {track.status === "queued" || track.status === "generating"
                  ? "Canceling..."
                  : "Deleting..."}
              </>
            ) : (
              copy.confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
