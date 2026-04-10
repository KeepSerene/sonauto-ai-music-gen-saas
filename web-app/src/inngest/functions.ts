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
  lyrics?: string; // only present for custom-manual mode
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
      // In an onFailure hook, the original event is nested under `event.data.event`
      const { songId } = event.data.event.data as SongGenerateEventData;

      // The error object that exhausted the retries is under `event.data.error`
      const error = event.data.error;
      const errorMessage =
        typeof error === "string"
          ? error
          : ((error as { message?: string })?.message ??
            "Generation failed after multiple retries.");

      await step.run("mark-failed", async () => {
        await db.song.update({
          where: { id: songId },
          data: {
            status: "failed",
            errorMessage: errorMessage.slice(0, 500),
          },
        });
      });
    },
  },
  async ({ event, step }) => {
    const {
      songId,
      userId,
      mode,
      description,
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
    const textContent = await step.run("generate-text-content", async () => {
      // Generate style tags (the ACE-Step prompt) from the description
      const stylePrompt = await generateTags(description);

      // Resolve final lyrics
      let finalLyrics: string | null = null;

      if (!isInstrumental) {
        if (mode === "simple" || mode === "custom-auto") {
          // AI writes the lyrics
          finalLyrics = await generateLyrics(description);
        } else {
          // custom-manual: user provided lyrics verbatim
          finalLyrics = lyrics ?? null;
        }
      }

      // Always generate a display title and 3 categories
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

      // Deduct 2 credit from the user's balance
      await db.user.update({
        where: { id: userId },
        data: { credits: { decrement: 2 } },
      });
    });

    return { songId, status: "completed" };
  },
);
