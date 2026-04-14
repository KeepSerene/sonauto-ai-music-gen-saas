import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TimeFormat = "compact" | "clock";

/**
 * Formats a time value in seconds using the requested style.
 *
 * - "compact" -> "1m", "1m 30s"
 * - "clock"   -> "01:30", "00:45"
 */
export function formatTime(
  seconds: number,
  format: TimeFormat = "compact",
): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (format === "clock") {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
}
