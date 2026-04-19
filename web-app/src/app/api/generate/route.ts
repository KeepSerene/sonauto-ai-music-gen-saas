import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "~/inngest/client";
import { db } from "~/server/db";
import { getSession } from "~/server/better-auth/server";

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
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate request body first
  const parsed = generateSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;

  // 3. Atomic credit deduction.
  const deducted = await db.user.updateMany({
    where: { id: session.user.id, credits: { gte: 2 } },
    data: { credits: { decrement: 2 } },
  });

  if (deducted.count === 0) {
    return NextResponse.json(
      {
        error:
          "You have no credits remaining. Upgrade your plan to generate more songs.",
      },
      { status: 402 },
    );
  }

  // 4. Create the Song record immediately.
  // Status starts as "queued" — Inngest will update it.
  const song = await db.song.create({
    data: {
      title: body.description.slice(0, 60),
      userId: session.user.id,
      mode: body.mode,
      isInstrumental: body.isInstrumental,
      audioDuration: body.audioDuration,
      lyrics: body.mode === "custom-manual" ? body.lyrics : null,
      status: "queued",
    },
  });

  // 5. Fire the Inngest event — do NOT await the generation itself
  try {
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
  } catch (err) {
    console.error("[generate] inngest.send failed — job will not run:", err);
  }

  // 6. Return the new song ID.
  return NextResponse.json({ songId: song.id }, { status: 202 });
}
