"use server";

import { redirect } from "next/navigation";
import { db } from "~/server/db";
import Tracks from "./Tracks";
import { getSession } from "~/server/better-auth/server";

async function TracksFetcher() {
  const session = await getSession();

  if (!session?.user) return redirect("/auth/sign-in");

  const songs = await db.song.findMany({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

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

  return <Tracks tracks={songsWithUrls} />;
}

export default TracksFetcher;
