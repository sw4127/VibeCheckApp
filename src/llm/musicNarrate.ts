/**
 * FREE music reading — spec §7 `vibe_check` mode. The model writes 2 sentences
 * + tags for the pre-computed profile (never classifies, §6). Runs on the cheap
 * free-tier model (Haiku, §16.C); deterministic in-character fallback keeps the
 * reveal whole at $0 / on failure. `theme` is deterministic per archetype
 * (§16.E), NOT model-chosen.
 *
 * VOICE (§10.A experiment, transparent A/B — Slice 1): two registers.
 *  - "classic": the established cynical-mirror voice.
 *  - "online": extremely-online social-media commentary. The anti-cringe guard
 *    is VECTOR-GATING — the profile's axis levels unlock at most TWO slang tokens
 *    that actually fit; the model never sees the rest, never stacks, never forces.
 *    (`six-seven`/`rizzless` are held out — pure noise / needlessly cruel.)
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Profile } from "@/engine";
import type { Lanes } from "@/content/music";
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

// --- §10.A online voice: vector-gated slang -------------------------------
/** Every token maps to a ready, natural fragment — no bare token-dropping. */
const SLANG_PHRASE: Record<string, string> = {
  "crash-out": "one rough night from a full crash-out",
  cooked: "and kinda cooked about it",
  delulu: "running on delulu optimism",
  "low-key": "low-key the whole personality",
  aura: "and the aura does numbers",
  "npc-energy": "with faint npc-energy",
  "no-cap": "no-cap",
};

/** The full lexicon (tests assert nothing OUTSIDE the gated subset ever appears). */
export const ONLINE_SLANG = [
  "six-seven", "delulu", "aura", "npc-energy", "no-cap", "crash-out", "low-key", "cooked", "rizzless",
] as const;

/**
 * Vector-gated slang: ≤2 tokens that genuinely FIT this profile. This is the
 * anti-cringe mechanism — the model is only ever offered tokens earned by the
 * user's axis levels, so it can't reach for noise. `six-seven`/`rizzless` are
 * never offered.
 */
export function slangFor(lanes: Lanes): string[] {
  const s = lanes.state;
  const t = lanes.trait;
  const picks: string[] = [];
  const add = (tok: string) => {
    if (picks.length < 2 && !picks.includes(tok)) picks.push(tok);
  };
  if (s.rumination === "High" && s.regulation === "Low") add("crash-out");
  if (s.regulation === "High") add("delulu");
  if (s.rumination === "High") add("cooked");
  if (t.extraversion === "High") add("aura");
  if (t.extraversion === "Low") add("low-key");
  if (t.openness === "Low") add("npc-energy");
  if (picks.length === 0) add("no-cap"); // a confident read still gets one beat
  return picks;
}

export function buildMusicUserMessage(
  profile: Profile,
  lanes: Lanes,
  artistsRecent: string[],
  artistsDurable: string[],
  voice: Voice = "classic",
): string {
  const fmt = (o: Record<string, string>) =>
    Object.entries(o).map(([k, v]) => `${k}=${v}`).join(", ");
  const lines = [
    "MODE: vibe_check",
    `ARCHETYPE: ${profile.archetype.label}`,
    `TRAIT_SCORES (durable): ${fmt(lanes.trait)}`,
    `STATE_SCORES (recent mood): ${fmt(lanes.state)}`,
    `ARTISTS_RECENT: [${artistsRecent.join(", ")}]`,
    `ARTISTS_DURABLE: [${artistsDurable.join(", ")}]`,
  ];
  if (voice === "online") {
    const slang = slangFor(lanes);
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

/** Deterministic, on-brand 2-sentence read. References artists when given (§8 specificity). */
export function localMusicReading(
  profile: Profile,
  lanes: Lanes,
  artistsRecent: string[],
  artistsDurable: string[],
  voice: Voice = "classic",
): MusicReading {
  const a = profile.archetype;
  const recent = artistsRecent[0];
  const durable = artistsDurable[0];
  const t = (a.tags ?? ["specific", "predictable", "yours"]).slice(0, 3);

  if (voice === "online") {
    // Deterministic floor uses ONE best-fit token only (woven into line 1) — the
    // live model may use up to two; the fallback stays sparse on purpose.
    const slang = slangFor(lanes);
    const season0 = slang[0] ? `, ${SLANG_PHRASE[slang[0]]}` : "";
    const second =
      recent && durable
        ? `${recent} on loop while ${durable} never leaves isn't range — it's a tell.`
        : recent
          ? `${recent} on repeat is doing the confessing you won't.`
          : lanes.state.rumination === "High"
            ? `you call it "taste"; it's a personality printout with extra steps.`
            : `you call it background music; it's a whole character study.`;
    return {
      archetype: a.label,
      vibe_check: `${a.label}? yeah, that tracks. ${cap(t[0])} and ${t[1]}${season0}. ${second}`,
      tags: t,
      teaser: "that's the cover. the full read says the quiet part out loud.",
    };
  }

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
  voice: Voice = "classic",
): Promise<MusicNarrationResult> {
  const key = `${voice}|${profile.hash}|${artistsRecent.join(",")}|${artistsDurable.join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const local = (): MusicNarrationResult => ({
    reading: localMusicReading(profile, lanes, artistsRecent, artistsDurable, voice),
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
      messages: [
        { role: "user", content: buildMusicUserMessage(profile, lanes, artistsRecent, artistsDurable, voice) },
      ],
      output_config: { format: zodOutputFormat(musicReadingSchema) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { reading: localMusicReading(profile, lanes, artistsRecent, artistsDurable, voice), source: "fallback" };
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
    return { reading: localMusicReading(profile, lanes, artistsRecent, artistsDurable, voice), source: "fallback" };
  }
}
