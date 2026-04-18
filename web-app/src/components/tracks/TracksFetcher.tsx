"use server";

import { redirect } from "next/navigation";
import { db } from "~/server/db";
import Tracks from "./Tracks";
import { getSession } from "~/server/better-auth/server";

// A song stuck in "queued" for this long means Inngest never picked it up.
// A song stuck in "generating" means Modal timed out but Inngest didn't
// surface the failure (e.g. Inngest itself was down). Modal's own timeout
// is 600s, so 15 min is a safe ceiling for the full queued → generating arc.
const STALE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

async function TracksFetcher() {
  const session = await getSession();

  if (!session?.user) return redirect("/auth/sign-in");

  const songs = await db.song.findMany({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // ── Stale song remediation ──────────────────────────────────────────────
  // Runs on every poll tick (every 5s while pending songs exist). The
  // updateMany WHERE clause makes this a no-op once songs are already fixed,
  // so there's no performance concern on subsequent refreshes.
  const now = Date.now();
  const staleSongs = songs.filter(
    (s) =>
      (s.status === "queued" || s.status === "generating") &&
      now - s.createdAt.getTime() > STALE_TIMEOUT_MS,
  );

  let hasJustRefunded = false;

  if (staleSongs.length > 0) {
    const staleIds = staleSongs.map((s) => s.id);

    await db.$transaction([
      db.song.updateMany({
        where: { id: { in: staleIds } },
        data: {
          status: "failed",
          errorMessage:
            "Generation timed out. Your credits have been refunded.",
        },
      }),
      // Bulk refund: increment once by 2x the number of stale songs
      // rather than N separate updates.
      db.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: 2 * staleSongs.length } },
      }),
    ]);

    // Reflect the remediated state in what we pass to the client
    // without a second DB round-trip.
    staleSongs.forEach((s) => {
      s.status = "failed";
      s.errorMessage = "Generation timed out. Your credits have been refunded.";
    });

    hasJustRefunded = true;
  }
  // ───────────────────────────────────────────────────────────────────────

  const songsWithUrls = songs.map((song) => ({
    id: song.id,
    title: song.title,
    createdAt: song.createdAt,
    isInstrumental: song.isInstrumental,
    prompt: song.prompt,
    lyrics: song.lyrics,
    thumbnailUrl: song.thumbnailUrl,
    audioUrl: song.audioUrl,
    status: song.status,
    generatedBy: song.user.name,
    isPublished: song.isPublished,
    errorMessage: song.errorMessage,
  }));

  return <Tracks tracks={songsWithUrls} hasJustRefunded={hasJustRefunded} />;
}

export default TracksFetcher;
