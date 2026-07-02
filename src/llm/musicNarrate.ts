/**
 * FREE music reading — spec §7 `vibe_check` mode, matrix edition. The model
 * writes 2 sentences + tags for the pre-computed COMPOSITE (core × modifier ×
 * tilt) — never classifies (§6). Runs on Haiku (§16.C); deterministic
 * in-character fallback keeps the reveal whole at $0 / on failure.
 *
 * §19.A KEY PURITY: the prompt is a pure function of (composite, voice) — no
 * raw levels, no artists. That makes `voice|composite.cacheKey` a correct cache
 * key by construction: the CDN can key narration on the composite, collapsing
 * 3,456 answer-combos into ~250 distinct reads. Artists are rendered as a
 * DETERMINISTIC receipt in the page (decision (i)) — they no longer fragment
 * the cache or touch the prompt.
 *
 * VOICE (§10.A A/B): "classic" vs "online". Slang is COMPOSITE-gated now (was
 * lane-gated): the modifier/tilt unlock at most two tokens that actually fit.
 * `six-seven`/`rizzless` stay held out; `crash-out` (which needed a two-lane
 * combo the composite can't express) is now effectively held out too.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Composite } from "@/engine";
import { SYSTEM_PROMPT } from "./systemPrompt";

const NARRATION_MODEL = process.env.ANTHROPIC_MODEL_NARRATION ?? "claude-haiku-4-5";

export type Voice = "classic" | "online";

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

// --- §10.A online voice: composite-gated slang ------------------------------
/** Every token maps to a ready, natural fragment — no bare token-dropping. */
const SLANG_PHRASE: Record<string, string> = {
  cooked: "and kinda cooked about it",
  delulu: "running on delulu optimism",
  "low-key": "low-key the whole personality",
  aura: "and the aura does numbers",
  "npc-energy": "with faint npc-energy",
  "no-cap": "no-cap",
};

/** The full lexicon (tests assert nothing OUTSIDE the gated subset appears). */
export const ONLINE_SLANG = [
  "six-seven", "delulu", "aura", "npc-energy", "no-cap", "crash-out", "low-key", "cooked", "rizzless",
] as const;

/**
 * Composite-gated slang: ≤2 tokens the modifier/tilt genuinely earn (≤1 from
 * each). The model is never offered tokens the composite didn't unlock.
 */
export function slangFor(c: Composite): string[] {
  const picks: string[] = [];
  if (c.tilt?.id === "regulation_hi") picks.push("delulu");
  else if (c.tilt?.id === "rumination_hi") picks.push("cooked");
  if (c.modifier?.id === "extraversion_hi") picks.push("aura");
  else if (c.modifier?.id === "extraversion_lo") picks.push("low-key");
  else if (c.modifier?.id === "openness_lo") picks.push("npc-energy");
  if (picks.length === 0) picks.push("no-cap"); // a confident read still gets one beat
  return picks.slice(0, 2);
}

/** The exact user-message payload — a pure function of (composite, tags, voice). */
export function buildMusicUserMessage(
  c: Composite,
  coreTags: string[],
  voice: Voice = "classic",
): string {
  const lines = [
    "MODE: vibe_check",
    `ARCHETYPE: ${c.handle}`,
    `CORE_TAGS: ${coreTags.join(", ")}`,
    `TEXTURE (durable modifier): ${
      c.modifier
        ? `${c.modifier.label} — ${c.modifier.line}`
        : "none — a textbook example of the type; read the core straight"
    }`,
    `WEATHER (recent state): ${
      c.tilt
        ? `${c.tilt.label} — ${c.tilt.line}`
        : "steady — no notable recent tilt; do not invent one"
    }`,
    "TEXTURE/WEATHER lines are context for YOUR OWN angle — never quote them verbatim.",
  ];
  if (voice === "online") {
    const slang = slangFor(c);
    lines.push(
      "VOICE: extremely-online social-media commentary — sharp, witty, like a viral quote-tweet roasting them with love. Punchy, present tense, lowercase energy. NOT clinical, NOT a horoscope, NOT a therapist.",
      "The anti-Barnum rule still binds: every line specific enough to be WRONG about a stranger. Slang decorates a specific read; it never replaces one.",
      `SLANG (seasoning only — use AT MOST TWO, only where they land naturally, never forced, never defined; if none fit, use none): [${slang.join(", ")}]`,
      "NO hashtags, NO emoji, NO stacking slang for its own sake.",
    );
  }
  return lines.join("\n");
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Deterministic, on-brand 2-sentence read from the composite alone ($0 floor). */
export function localMusicReading(
  c: Composite,
  coreTags: string[],
  voice: Voice = "classic",
): MusicReading {
  const t = (coreTags.length >= 2 ? coreTags : [...coreTags, "specific", "predictable"]).slice(0, 3);
  // The authored texture/weather line IS the second sentence — the matrix's
  // resolution shows up even on the $0 path.
  const second =
    c.modifier?.line ??
    c.tilt?.line ??
    "You call it background music; it's a personality printout.";

  if (voice === "online") {
    const slang = slangFor(c);
    const season = slang[0] ? `, ${SLANG_PHRASE[slang[0]]}` : "";
    return {
      archetype: c.handle,
      vibe_check: `${c.handle.toLowerCase()}? yeah, that tracks. ${cap(t[0])} and ${t[1]}${season}. ${second}`,
      tags: t,
      teaser: "that's the cover. the full read says the quiet part out loud.",
    };
  }
  return {
    archetype: c.handle,
    vibe_check: `${c.handle}: ${t[0]} and ${t[1]}, whether or not you'd admit it. ${second}`,
    tags: t,
    teaser: "That's the cover. The full read is what your taste says when you're not listening.",
  };
}

const cache = new Map<string, MusicNarrationResult>();

export async function narrateMusic(
  c: Composite,
  coreTags: string[],
  voice: Voice = "classic",
): Promise<MusicNarrationResult> {
  const key = `${voice}|${c.cacheKey}`; // pure: the prompt is a function of exactly this
  const hit = cache.get(key);
  if (hit) return hit;

  const local = (): MusicNarrationResult => ({
    reading: localMusicReading(c, coreTags, voice),
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
      temperature: voice === "online" ? 0.5 : 0.3, // online wants a touch more swing
      thinking: { type: "disabled" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildMusicUserMessage(c, coreTags, voice) }],
      output_config: { format: zodOutputFormat(musicReadingSchema) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { reading: localMusicReading(c, coreTags, voice), source: "fallback" };
    }
    const result: MusicNarrationResult = {
      reading: {
        ...response.parsed_output,
        archetype: c.handle, // engine decides; model writes
        tags: response.parsed_output.tags.slice(0, 3),
      },
      source: "model",
    };
    cache.set(key, result);
    return result;
  } catch {
    return { reading: localMusicReading(c, coreTags, voice), source: "fallback" };
  }
}
