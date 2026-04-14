"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";
import { db } from "~/server/db";
import Tracks from "./Tracks";

async function TracksFetcher() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/auth/sign-in");

  const songs = await db.song.findMany({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const songsWithThumbnails = songs.map((song) => ({
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

  return <Tracks tracks={songsWithThumbnails} />;
}

export default TracksFetcher;
