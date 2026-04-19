"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface LyricsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string | null;
  lyrics?: string | null;
}

export default function LyricsModal({
  isOpen,
  onOpenChange,
  title,
  lyrics,
}: LyricsModalProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyLyrics = async () => {
    if (!lyrics) return;

    try {
      await navigator.clipboard.writeText(lyrics);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy lyrics:", err);
      toast.error("Failed to copy lyrics.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-lg flex-col sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {title ?? "Track Lyrics"}
          </DialogTitle>

          <DialogDescription className="sr-only">
            Lyrics for {title ?? "this track"}
          </DialogDescription>
        </DialogHeader>

        {/* Lyrics container */}
        <div className="bg-muted/30 border-border flex-1 overflow-y-auto rounded-md border p-4">
          <p className="text-sm leading-relaxed font-medium tracking-wide whitespace-pre-wrap">
            {lyrics}
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-muted-foreground text-xs italic">
            &copy; Sonauto Generated
          </p>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLyrics}
          >
            {hasCopied ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
