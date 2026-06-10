/**
 * FREE music reading — spec §7 `vibe_check` mode. The model writes 2 sentences
 * + tags for the pre-computed profile (never classifies, §6). Runs on the cheap
 * free-tier model (Haiku, §16.C); deterministic in-character fallback keeps the
 * reveal whole at $0 / on failure. `theme` is deterministic per archetype
 * (§16.E), NOT model-chosen.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Profile } from "@/engine";
import type { Lanes } from "@/content/music";
import { SYSTEM_PROMPT } from "./systemPrompt";

const NARRATION_MODEL = process.env.ANTHROPIC_MODEL_NARRATION ?? "claude-haiku-4-5";

export const musicReadingSchema = z.object({
  archetype: z.string(),
  vibe_check: z.string(),
  tags: z.array(z.string()).min(2),
  teaser: z.string(),
});
export type MusicReading = z.infer<typeof musicReadingSchema>;

export interface MusicNarrationResult {
  reading: MusicReading;
  source: "model" | "fallback" | "local";
}

export function buildMusicUserMessage(
  profile: Profile,
  lanes: Lanes,
  artistsRecent: string[],
  artistsDurable: string[],
): string {
  const fmt = (o: Record<string, string>) =>
    Object.entries(o).map(([k, v]) => `${k}=${v}`).join(", ");
  return [
    "MODE: vibe_check",
    `ARCHETYPE: ${profile.archetype.label}`,
    `TRAIT_SCORES (durable): ${fmt(lanes.trait)}`,
    `STATE_SCORES (recent mood): ${fmt(lanes.state)}`,
    `ARTISTS_RECENT: [${artistsRecent.join(", ")}]`,
    `ARTISTS_DURABLE: [${artistsDurable.join(", ")}]`,
  ].join("\n");
}

/** Deterministic, on-brand 2-sentence read. References artists when given (§8 specificity). */
export function localMusicReading(
  profile: Profile,
  lanes: Lanes,
  artistsRecent: string[],
  artistsDurable: string[],
): MusicReading {
  const a = profile.archetype;
  const recent = artistsRecent[0];
  const durable = artistsDurable[0];
  const t = (a.tags ?? ["specific", "predictable", "yours"]).slice(0, 3);

  const second =
    recent && durable
      ? `${recent} on rotation while ${durable} never leaves — your mood changes, your tells don't.`
      : recent
        ? `${recent} on heavy rotation is doing more confessing than you think.`
        : lanes.state.rumination === "High"
          ? "You call it taste; it's a coping strategy with good production."
          : "You call it background music; it's a personality printout.";

  return {
    archetype: a.label,
    vibe_check: `${a.label}: ${t[0]} and ${t[1]}, whether or not you'd admit it. ${second}`,
    tags: t,
    teaser: "That's the cover. The full read is what your taste says when you're not listening.",
  };
}

const cache = new Map<string, MusicNarrationResult>();

export async function narrateMusic(
  profile: Profile,
  lanes: Lanes,
  artistsRecent: string[],
  artistsDurable: string[],
): Promise<MusicNarrationResult> {
  const key = `${profile.hash}|${artistsRecent.join(",")}|${artistsDurable.join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const local = (): MusicNarrationResult => ({
    reading: localMusicReading(profile, lanes, artistsRecent, artistsDurable),
    source: "local",
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    const r = local();
    cache.set(key, r);
    return r;
  }
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: NARRATION_MODEL,
      max_tokens: 400,
      temperature: 0.3,
      thinking: { type: "disabled" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [
        { role: "user", content: buildMusicUserMessage(profile, lanes, artistsRecent, artistsDurable) },
      ],
      output_config: { format: zodOutputFormat(musicReadingSchema) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { reading: localMusicReading(profile, lanes, artistsRecent, artistsDurable), source: "fallback" };
    }
    const result: MusicNarrationResult = {
      reading: {
        ...response.parsed_output,
        archetype: profile.archetype.label, // engine decides; model writes
        tags: response.parsed_output.tags.slice(0, 3),
      },
      source: "model",
    };
    cache.set(key, result);
    return result;
  } catch {
    return { reading: localMusicReading(profile, lanes, artistsRecent, artistsDurable), source: "fallback" };
  }
}
