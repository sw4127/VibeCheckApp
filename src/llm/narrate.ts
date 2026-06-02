/**
 * Narration: turn a deterministic Profile into a written reading.
 *
 * The model is the WRITER only — we force `archetype` and `player` back to the
 * engine's computed values no matter what it returns (spec §6). On any failure,
 * or when no API key is configured, we return a deterministic in-character
 * reading so the card always renders (and the local demo runs at $0).
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Profile, ScoreVector } from "@/engine";
import { THEMES, worldCupReadingSchema, type WorldCupReading } from "./schema";
import { SYSTEM_PROMPT } from "./systemPrompt";

/** Pinned snapshot for the free reading tier (spec §4 — Sonnet for quality). */
const NARRATION_MODEL =
  process.env.ANTHROPIC_MODEL_NARRATION ?? "claude-sonnet-4-6";

export type ReadingSource = "model" | "fallback" | "local";

export interface NarrationResult {
  reading: WorldCupReading;
  /** "model" = real call, "fallback" = call failed, "local" = no API key. */
  source: ReadingSource;
}

/** Bucket a [0,1] percentile into the enum-locked levels (spec §6). */
export function levelOf(value: number): "High" | "Medium" | "Low" {
  if (value >= 0.66) return "High";
  if (value >= 0.34) return "Medium";
  return "Low";
}

function titleCase(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function scoresLine(vector: ScoreVector, order: string[]): string {
  const dims = order.length ? order : Object.keys(vector).sort();
  return dims
    .map((d) => `${titleCase(d)}=${levelOf(vector[d] ?? 0.5)}`)
    .join(", ");
}

/** The exact user-message payload sent to the model. Deterministic. */
export function buildUserMessage(
  profile: Profile,
  dimensionOrder: string[] = [],
): string {
  const tags = profile.match.tags?.join(", ") ?? "";
  return [
    "MODE: world_cup_match",
    `ARCHETYPE: ${profile.archetype.label}`,
    `PLAYER: ${profile.match.label}`,
    `PLAYER_STYLE_TAGS: ${tags}`,
    `SCORES: ${scoresLine(profile.normalized, dimensionOrder)}`,
  ].join("\n");
}

/** Pick a theme deterministically from the profile hash (stable per result). */
function themeFromHash(hash: string): (typeof THEMES)[number] {
  let n = 0;
  for (const ch of hash) n = (n + ch.charCodeAt(0)) % THEMES.length;
  return THEMES[n];
}

/**
 * Deterministic, on-brand reading used when there's no API key (local demo) or
 * when a real call fails/returns garbage. Never throws; always schema-valid.
 */
export function localReading(profile: Profile): WorldCupReading {
  const tags = (profile.match.tags ?? ["instinctive", "relentless", "composed"]).slice(0, 3);
  const padded = tags.length >= 3 ? tags : [...tags, "instinctive", "driven"].slice(0, 3);
  return {
    archetype: profile.archetype.label,
    player: profile.match.label,
    verdict: `You move like ${profile.match.label}: ${padded[0]} when it counts, never wasting a touch. ${profile.archetype.label} doesn't chase the game — the game bends to them.`,
    shared_traits: padded,
    theme: themeFromHash(profile.hash),
    teaser:
      "Your football vibe is just the warm-up — your music taste says even more.",
  };
}

/** Force engine-authoritative fields and trim traits to three. */
function normalizeReading(
  raw: WorldCupReading,
  profile: Profile,
): WorldCupReading {
  return {
    ...raw,
    archetype: profile.archetype.label, // model writes; engine decides
    player: profile.match.label,
    shared_traits: raw.shared_traits.slice(0, 3),
  };
}

/**
 * Generate the reading. Pure-deterministic local path when no key is set; real
 * model call otherwise, with a fallback that guarantees a renderable result.
 */
export async function narrateWorldCup(
  profile: Profile,
  dimensionOrder: string[] = [],
): Promise<NarrationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { reading: localReading(profile), source: "local" };
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: NARRATION_MODEL,
      max_tokens: 600,
      temperature: 0.3, // low temp keeps prose close (spec §6); Sonnet/Haiku tier
      thinking: { type: "disabled" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        { role: "user", content: buildUserMessage(profile, dimensionOrder) },
      ],
      output_config: { format: zodOutputFormat(worldCupReadingSchema) },
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { reading: localReading(profile), source: "fallback" };
    }
    return {
      reading: normalizeReading(response.parsed_output, profile),
      source: "model",
    };
  } catch {
    // Network error, rate limit, schema mismatch — never break the card.
    return { reading: localReading(profile), source: "fallback" };
  }
}
