"use client";

import { useState } from "react";
import Image from "next/image";
import { Music4 } from "lucide-react";
import { cn } from "~/lib/utils";

interface TrackThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
}

function TrackThumbnail({ src, alt, className }: TrackThumbnailProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      {!src ? (
        <div className="bg-muted flex size-full items-center justify-center">
          <Music4 className="text-muted-foreground size-6" />
        </div>
      ) : (
        <>
          <div
            className={cn(
              "skeleton absolute inset-0 transition-opacity duration-300",
              loaded ? "pointer-events-none opacity-0" : "opacity-100",
            )}
            aria-hidden="true"
          />

          <Image
            src={src}
            width={512}
            height={512}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn(
              "size-full object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      )}
    </div>
  );
}

export default TrackThumbnail;
