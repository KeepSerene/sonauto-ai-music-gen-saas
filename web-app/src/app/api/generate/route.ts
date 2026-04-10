import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { inngest } from "~/inngest/client";
import { auth } from "~/server/better-auth";
import { db } from "~/server/db";

// ─────────────────────────────────────────────────────────────────────────────
// INPUT VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const durationSchema = z.number().min(15).max(180).default(60);
const seedSchema = z.number().int().default(-1);

const generateSchema = z.discriminatedUnion("mode", [
  // Mode 1 — Simple: user describes a vibe, AI handles everything
  z.object({
    mode: z.literal("simple"),
    description: z.string().min(10).max(500),
    isInstrumental: z.boolean().default(false),
    audioDuration: durationSchema,
    seed: seedSchema,
  }),
  // Mode 2 — Custom Auto: user describes theme/style, AI writes matching lyrics
  z.object({
    mode: z.literal("custom-auto"),
    description: z.string().min(10).max(500),
    isInstrumental: z.boolean().default(false),
    audioDuration: durationSchema,
    seed: seedSchema,
  }),
  // Mode 3 — Custom Manual: user writes their own lyrics, AI only tags
  z.object({
    mode: z.literal("custom-manual"),
    description: z.string().min(10).max(500),
    lyrics: z.string().min(20).max(3000),
    isInstrumental: z.boolean().default(false),
    audioDuration: durationSchema,
    seed: seedSchema,
  }),
]);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Credits check — fetch the user's current balance
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  if (!user || user.credits <= 0) {
    return NextResponse.json(
      {
        error:
          "You have no credits remaining. Upgrade your plan to generate more songs.",
      },
      { status: 403 },
    );
  }

  // 3. Validate request body
  const parsed = generateSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;

  // 4. Create the Song record immediately so the frontend gets a songId
  //    to poll. Status starts as "queued" — Inngest will update it.
  const song = await db.song.create({
    data: {
      // Temporary title — Inngest will overwrite with an AI-generated one
      title: body.description.slice(0, 60),
      userId: session.user.id,
      mode: body.mode,
      isInstrumental: body.isInstrumental,
      audioDuration: body.audioDuration,
      // For custom-manual, store the user's lyrics immediately so they
      // are visible in the UI even before generation completes.
      lyrics: body.mode === "custom-manual" ? body.lyrics : null,
      status: "queued",
    },
  });

  // 5. Fire the Inngest event — do NOT await the generation itself
  await inngest.send({
    name: "song/generate",
    data: {
      songId: song.id,
      userId: session.user.id,
      mode: body.mode,
      description: body.description,
      lyrics: body.mode === "custom-manual" ? body.lyrics : undefined,
      isInstrumental: body.isInstrumental,
      audioDuration: body.audioDuration,
      seed: body.seed,
    },
  });

  // 6. Return songId immediately; frontend polls /api/songs/[songId]/status
  return NextResponse.json({ songId: song.id }, { status: 202 });
}
