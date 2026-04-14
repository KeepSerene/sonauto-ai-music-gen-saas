"use client";

import { useState } from "react";
import type { Track } from "./Tracks";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface RenameDialogProps {
  track: Track;
  onRename: (trackId: string, newTitle: string) => void;
  onClose: () => void;
}

function RenameDialog({ track, onRename, onClose }: RenameDialogProps) {
  const [title, setTitle] = useState(track.title ?? "");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim()) {
      onRename(track.id, title.trim());
    }

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Track</DialogTitle>

            <DialogDescription>Click save when you're done.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <label htmlFor="name" className="sr-only">
              Update track title
            </label>

            <Input
              id="name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a new title"
              className="col-span-3"
              autoFocus
            />

            <DialogFooter className="col-span-3 py-2">
              <DialogClose type="button" onClick={onClose}>
                Cancel
              </DialogClose>

              <Button type="submit" size="sm" disabled={!title.trim()}>
                Save
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RenameDialog;
