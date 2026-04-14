import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import {
  CATEGORY_GENERATOR_PROMPT,
  TAG_GENERATOR_PROMPT,
  LYRICS_GENERATOR_PROMPT,
  TITLE_GENERATOR_PROMPT,
} from "~/lib/prompts";

const MODEL = groq("llama-3.3-70b-versatile");

/**
 * Converts a user description into a comma-separated style/tag prompt
 * suitable for ACE-Step (e.g. "pop, upbeat, female vocal, acoustic guitar").
 */
export async function generateTags(userDescription: string): Promise<string> {
  const { text } = await generateText({
    model: MODEL,
    system: TAG_GENERATOR_PROMPT,
    prompt: userDescription,
  });

  return text.trim();
}

/**
 * Writes full structured lyrics (verse/chorus/bridge) from a description and an audio duration.
 */
export async function generateLyrics(
  userDescription: string,
  audioDuration: number,
): Promise<string> {
  const { text } = await generateText({
    model: MODEL,
    system: LYRICS_GENERATOR_PROMPT,
    prompt: `Target duration: ${audioDuration} seconds.\n\n${userDescription}`,
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
    const { text } = await generateText({
      model: MODEL,
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
    const { text } = await generateText({
      model: MODEL,
      system: TITLE_GENERATOR_PROMPT,
      prompt: userDescription,
    });

    return text.trim().slice(0, 80);
  } catch {
    // Graceful fallback — title is cosmetic, don't let it break the pipeline
    return userDescription.slice(0, 60).trim();
  }
}
