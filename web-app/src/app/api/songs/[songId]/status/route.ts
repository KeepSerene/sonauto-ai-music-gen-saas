import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/server/better-auth";
import { db } from "~/server/db";

interface RouteParams {
  params: Promise<{ songId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { songId } = await params;

  // 2. Fetch only the fields the frontend needs for the polling loop.
  //    Scoping to userId prevents users from polling other users' songs.
  const song = await db.song.findFirst({
    where: {
      id: songId,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
      title: true,
      audioUrl: true,
      thumbnailUrl: true,
      lyrics: true,
      prompt: true,
      isInstrumental: true,
      errorMessage: true,
      createdAt: true,
      categories: {
        select: { id: true, name: true },
      },
    },
  });

  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  // 3. Add cache control — tell browsers not to cache this (it changes!)
  return NextResponse.json(song, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
