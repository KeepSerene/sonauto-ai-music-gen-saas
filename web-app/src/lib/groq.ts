import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import {
  CATEGORY_GENERATOR_PROMPT,
  TAG_GENERATOR_PROMPT,
  LYRICS_GENERATOR_PROMPT,
  TITLE_GENERATOR_PROMPT,
} from "~/lib/prompts";

const MODEL_PREFERENCE = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.1-8b-instant",
] as const;

let activeModel: string = MODEL_PREFERENCE[0];

function isDecommissionedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return /decommission|model_not_found|does not exist|no longer (be )?(served|supported)/i.test(
    message,
  );
}

async function generateWithFallback(opts: { system: string; prompt: string }) {
  const startIndex = Math.max(0, MODEL_PREFERENCE.indexOf(activeModel as any));
  const candidates = MODEL_PREFERENCE.slice(startIndex);

  for (const [offset, modelId] of candidates.entries()) {
    const isLast = offset === candidates.length - 1;

    try {
      const result = await generateText({ model: groq(modelId), ...opts });
      activeModel = modelId;

      return result;
    } catch (error) {
      if (isDecommissionedError(error) && !isLast) {
        console.error(
          `[groq] "${modelId}" is unavailable (likely decommissioned) — falling back to "${candidates[offset + 1]}". Update MODEL_PREFERENCE when convenient.`,
        );
        continue;
      }

      throw error;
    }
  }

  throw new Error("All fallback Groq models are unavailable.");
}

/**
 * Converts a user description into a comma-separated style/tag prompt
 * suitable for ACE-Step (e.g. "pop, upbeat, female vocal, acoustic guitar").
 */
export async function generateTags(userDescription: string): Promise<string> {
  const { text } = await generateWithFallback({
    system: TAG_GENERATOR_PROMPT,
    prompt: userDescription,
  });

  return text.trim();
}

/**
 * Writes full structured lyrics (verse/chorus/bridge) from a description and an audio duration.
 * For custom-auto mode, an optional lyricsContext guides the thematic/narrative direction.
 */
export async function generateLyrics(
  userDescription: string,
  audioDuration: number,
  lyricsContext?: string,
): Promise<string> {
  const prompt = lyricsContext
    ? `Target duration: ${audioDuration} seconds.\n\nStyle/Vibe: ${userDescription}\n\nLyrics direction (use this to shape the narrative and imagery): ${lyricsContext}`
    : `Target duration: ${audioDuration} seconds.\n\n${userDescription}`;

  const { text } = await generateWithFallback({
    system: LYRICS_GENERATOR_PROMPT,
    prompt,
  });

  return text.trim();
}

/**
 * Returns exactly 3 short category strings for the song
 * (e.g. ["Pop", "Upbeat", "Electronic"]).
 */
export async function extractCategories(
  userDescription: string,
): Promise<string[]> {
  try {
    const { text } = await generateWithFallback({
      system: CATEGORY_GENERATOR_PROMPT,
      prompt: userDescription,
    });
    const parsed = JSON.parse(text) as { categories: string[] };

    return parsed.categories.slice(0, 3);
  } catch (error) {
    console.error("Failed to parse categories from Groq:", error);
    // Graceful fallback so a minor tagging error doesn't crash the whole song generation
    return ["Original", "Music", "Track"];
  }
}

/**
 * Generates a short, punchy song title from the description.
 * Falls back to a truncated description if Groq fails.
 */
export async function generateTitle(userDescription: string): Promise<string> {
  try {
    const { text } = await generateWithFallback({
      system: TITLE_GENERATOR_PROMPT,
      prompt: userDescription,
    });

    return text.trim().slice(0, 80);
  } catch {
    // Graceful fallback — title is cosmetic, don't let it break the pipeline
    return userDescription.slice(0, 60).trim();
  }
}
