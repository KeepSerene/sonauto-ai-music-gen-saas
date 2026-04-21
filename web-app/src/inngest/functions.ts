import { inngest } from "./client";
import {
  generateTags,
  generateLyrics,
  extractCategories,
  generateTitle,
} from "~/lib/groq";
import { env } from "~/env";
import { db } from "~/server/db";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type GenerationMode = "simple" | "custom-auto" | "custom-manual";

interface SongGenerateEventData {
  songId: string;
  userId: string;
  mode: GenerationMode;
  description: string;
  lyricsDescription?: string; // custom-auto only
  lyrics?: string; // custom-manual only
  isInstrumental: boolean;
  audioDuration: number;
  seed?: number;
}

interface ModalResponse {
  audio_url: string;
  thumbnail_url: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export const generateSong = inngest.createFunction(
  {
    id: "generate-song",
    concurrency: { limit: 1, key: "event.data.userId" },
    triggers: { event: "song/generate" },
    retries: 2,
    onFailure: async ({ event, step }) => {
      const { songId, userId } = event.data.event.data as SongGenerateEventData;
      const error = event.data.error;
      const errorMessage =
        typeof error === "string"
          ? error
          : ((error as { message?: string })?.message ??
            "Generation failed after multiple retries.");

      await step.run("mark-failed-and-refund", async () => {
        // The user may have already deleted this track while it was in-flight.
        // If so, skip — the deleteTrack action already handled the correct
        // refund (or intentional non-refund for "generating" cancellations).
        const song = await db.song.findUnique({
          where: { id: songId },
          select: { id: true },
        });

        if (!song) return;

        // Song still exists — mark it failed and refund the upfront charge.
        await db.$transaction([
          db.song.update({
            where: { id: songId },
            data: {
              status: "failed",
              errorMessage: errorMessage.slice(0, 500),
            },
          }),
          db.user.update({
            where: { id: userId },
            data: { credits: { increment: 2 } },
          }),
        ]);
      });
    },
  },
  async ({ event, step }) => {
    const {
      songId,
      mode,
      description,
      lyricsDescription,
      lyrics,
      isInstrumental,
      audioDuration,
      seed,
    } = event.data as SongGenerateEventData;

    // ── STEP 1: Mark the song as actively generating ────────────────────────
    await step.run("mark-generating", async () => {
      await db.song.update({
        where: { id: songId },
        data: { status: "generating" },
      });
    });

    // ── STEP 2: Groq text generation ────────────────────────────────────────
    // Which Groq calls we make depends on the mode:
    //
    //   simple        -> AI generates style tags AND lyrics from the description
    //   custom-auto   -> User described a theme/style; AI writes matching lyrics
    //   custom-manual -> User wrote the lyrics; AI only generates style tags
    //
    // In all modes, AI always generates 3 categories (for browsing/filtering).
    // When isInstrumental is true, lyrics generation is skipped entirely.
    // In the generate-text-content step — replace the existing block:
    const textContent = await step.run("generate-text-content", async () => {
      const rawTags = await generateTags(description);

      const stylePrompt = isInstrumental
        ? `instrumental, no vocals, no singing, ${rawTags}`
        : rawTags;

      let finalLyrics: string | null = null;

      if (!isInstrumental) {
        if (mode === "simple") {
          finalLyrics = await generateLyrics(description, audioDuration);
        } else if (mode === "custom-auto") {
          finalLyrics = await generateLyrics(
            description,
            audioDuration,
            lyricsDescription,
          );
        } else {
          // custom-manual
          finalLyrics = lyrics ?? null;
        }
      }

      const [title, categories] = await Promise.all([
        generateTitle(description),
        extractCategories(description),
      ]);

      return { stylePrompt, finalLyrics, title, categories };
    });

    // ── STEP 3: Persist text content + upsert categories ───────────────────
    await step.run("save-text-content", async () => {
      const { stylePrompt, finalLyrics, title, categories } = textContent;

      // Upsert each category so we never create duplicates
      const categoryRecords = await Promise.all(
        categories.map((name) =>
          db.category.upsert({
            where: { name },
            create: { name },
            update: {},
          }),
        ),
      );

      await db.song.update({
        where: { id: songId },
        data: {
          title,
          prompt: stylePrompt,
          lyrics: finalLyrics,
          categories: {
            // Replace any previously set categories on this song
            set: categoryRecords.map((c) => ({ id: c.id })),
          },
        },
      });
    });

    // ── STEP 4: Call Modal — music + thumbnail generation ──────────────────
    // The Modal endpoint (main.py → SongGenServer.generate_track) handles
    // both ACE-Step audio generation AND SDXL-Turbo thumbnail generation
    // in one call, and uploads both files to R2 internally.
    const modalPayload = {
      prompt: textContent.stylePrompt,
      lyrics: textContent.finalLyrics ?? "",
      is_instrumental: isInstrumental,
      audio_duration: audioDuration,
      guidance_scale: 20, // tighter prompt + lyric adherence (default: 15)
      infer_step: 70, // default: 60
      seed: seed ?? -1,
    };
    const modalResponse = await step.fetch(env.MODAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_API_KEY,
        "Modal-Secret": env.MODAL_API_SECRET,
      },
      body: JSON.stringify(modalPayload),
    });
    const modalResult = await step.run("parse-modal-response", async () => {
      if (!modalResponse.ok) {
        const errorText = await modalResponse.text();

        throw new Error(
          `Modal API error ${modalResponse.status}: ${errorText.slice(0, 300)}`,
        );
      }

      return (await modalResponse.json()) as ModalResponse;
    });

    // ── STEP 5: Finalise — save URLs, mark completed, deduct credit ────────
    await step.run("finalise-song", async () => {
      await db.song.update({
        where: { id: songId },
        data: {
          audioUrl: modalResult.audio_url,
          thumbnailUrl: modalResult.thumbnail_url,
          status: "completed",
        },
      });
    });

    return { songId, status: "completed" };
  },
);
