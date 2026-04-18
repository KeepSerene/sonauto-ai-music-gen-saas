"use server";

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { env } from "~/env";
import { getSession } from "../better-auth/server";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getSession();

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
 * Increments the listen count for a track.
 * Ensures unique listens per user by checking the Listen join table.
 * This is a fire-and-forget action; errors are swallowed intentionally.
 */
export async function incrementListens(trackId: string): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();

    await db.$transaction(async (tx) => {
      const existingListen = await tx.listen.findUnique({
        where: {
          userId_songId: {
            userId,
            songId: trackId,
          },
        },
      });

      if (!existingListen) {
        await tx.listen.create({
          data: {
            userId,
            songId: trackId,
          },
        });

        await tx.song.update({
          where: { id: trackId },
          data: { listensCount: { increment: 1 } },
        });
      }
    });
  } catch (error) {
    // Swallow — a failed listen counter update should never break audio playback
    console.error("Failed to increment unique listen:", error);
  }
}

/**
 * Toggles a like for a specific track.
 * Enforces that the song exists and is either published or owned by the user.
 * Uses a transaction to ensure atomic checking and toggling of the Like record.
 */
export async function toggleLike(trackId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  await db.$transaction(async (tx) => {
    // Verify the song exists and is eligible to be liked
    const song = await tx.song.findUnique({
      where: { id: trackId },
      select: { isPublished: true, userId: true },
    });

    if (!song) throw new Error("Song not found.");

    // Users can only like published songs, unless it's their own private draft
    if (!song.isPublished && song.userId !== userId) {
      throw new Error("Unauthorized: cannot like a private track.");
    }

    const existingLike = await tx.like.findUnique({
      where: {
        userId_songId: {
          userId,
          songId: trackId,
        },
      },
    });

    // Toggle the like state
    if (existingLike) {
      await tx.like.delete({
        where: {
          userId_songId: {
            userId,
            songId: trackId,
          },
        },
      });
    } else {
      await tx.like.create({
        data: {
          userId,
          songId: trackId,
        },
      });
    }
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

/**
 * Deletes a song owned by the authenticated user, cleaning up R2 files and
 * applying the correct credit refund policy based on the song's current status.
 */
export async function deleteTrack(trackId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  // ── Atomic: resolve refund logic and delete the DB record together.
  let audioUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  await db.$transaction(async (tx) => {
    const song = await tx.song.findUnique({
      where: { id: trackId },
      select: {
        userId: true,
        audioUrl: true,
        thumbnailUrl: true,
        status: true,
      },
    });

    if (!song) throw new Error("Song not found.");
    if (song.userId !== userId) throw new Error("Unauthorized.");

    audioUrl = song.audioUrl;
    thumbnailUrl = song.thumbnailUrl;

    // Smart refund rules:
    // "queued"     → refunds 2 credits (canceled before GPU touched it)
    // "generating" → no refund (GPU is actively running; user forfeits credits)
    // "failed"     → no refund (already refunded — either by the Inngest
    //                onFailure hook or by TracksFetcher stale remediation)
    // "completed"  → no refund (user received their track)
    if (song.status === "queued") {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: 2 } },
      });
    }

    await tx.song.delete({ where: { id: trackId } });
  });

  // ── R2 cleanup: best-effort, never blocks the DB deletion ────────────
  const deletePromises: Promise<unknown>[] = [];

  if (audioUrl) {
    const key = new URL(audioUrl).pathname.replace(/^\//, "");
    deletePromises.push(
      r2.send(
        new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
      ),
    );
  }

  if (thumbnailUrl) {
    const key = new URL(thumbnailUrl).pathname.replace(/^\//, "");
    deletePromises.push(
      r2.send(
        new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
      ),
    );
  }

  if (deletePromises.length > 0) {
    const results = await Promise.allSettled(deletePromises);
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("R2 cleanup failed (non-fatal):", result.reason);
      }
    });
  }

  revalidatePath("/generate");
}
