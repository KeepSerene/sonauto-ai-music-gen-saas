"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/better-auth";
import { db } from "~/server/db";
import { env } from "~/env";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) throw new Error("Unauthorized");

  return session.user.id;
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renames a song. Scoped to the authenticated user via the `userId` condition
 * in the `where` clause — so a user can never rename another user's song.
 */
export async function renameTrack(
  trackId: string,
  newTitle: string,
): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const trimmed = newTitle.trim().slice(0, 80);

  if (!trimmed) throw new Error("Title cannot be empty.");

  const updated = await db.song.updateMany({
    where: { id: trackId, userId },
    data: { title: trimmed },
  });

  if (updated.count === 0) throw new Error("Song not found.");

  revalidatePath("/generate");
}

/**
 * Toggles the `isPublished` flag for a song. Uses a transaction to read
 * and flip atomically — no race condition on concurrent clicks.
 */
export async function togglePublish(trackId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  await db.$transaction(async (tx) => {
    const song = await tx.song.findFirst({
      where: { id: trackId, userId },
      select: { isPublished: true },
    });

    if (!song) throw new Error("Song not found.");

    await tx.song.update({
      where: { id: trackId },
      data: { isPublished: !song.isPublished },
    });
  });

  revalidatePath("/generate");
}

/**
 * Increments the listen count for a track. This is a fire-and-forget action:
 * no ownership check (play counts are public), no revalidation (cosmetic counter).
 * Caller should `void` this — errors are swallowed intentionally.
 */
export async function incrementListens(trackId: string): Promise<void> {
  await db.song
    .update({
      where: { id: trackId },
      data: { listensCount: { increment: 1 } },
    })
    .catch(() => {
      // Swallow — a failed listen counter should never break playback
    });
}

/**
 * Generates a temporary, cryptographic pre-signed URL for downloading a track.
 * Enforces authorization: allows access ONLY if the user is the owner OR if the track is published.
 * Injects headers to force the browser to download the file rather than playing it inline.
 */
export async function getDownloadUrl(trackId: string): Promise<string> {
  const userId = await getAuthenticatedUserId();
  const song = await db.song.findUnique({
    where: { id: trackId },
    select: { audioUrl: true, userId: true, isPublished: true, title: true },
  });

  if (!song?.audioUrl) throw new Error("Audio not available.");

  const isOwner = userId === song.userId;

  if (!isOwner && !song.isPublished) {
    throw new Error("Unauthorized: cannot download this private track.");
  }

  // Extract the storage key from the full public URL
  // e.g. "https://pub-xxx.r2.dev/audio/abc.wav" → "audio/abc.wav"
  const key = new URL(song.audioUrl).pathname.replace(/^\//, "");
  const safeTitle = (song.title ?? "track").replace(
    /[^a-z0-9 _-]/gi,
    "_Sonauto",
  );
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safeTitle}.wav"`,
    ResponseContentType: "audio/wav",
  });

  return getSignedUrl(r2, command, { expiresIn: 60 });
}
