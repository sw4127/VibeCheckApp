/**
 * PAID premium-report narration. The model is the WRITER only (spec §6/§7): it
 * receives the pre-computed profile and writes the report. Stronger model than
 * the free tier (recalibration: free=Haiku, paid=Sonnet/Opus). On any failure
 * or missing key, a deterministic in-character report keeps the paid view whole.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { PremiumProfile } from "@/content/sample-profile";
import { fnv1a } from "@/engine";
import { premiumReportSchema, type Level, type PremiumReport } from "./premiumSchema";
import { SYSTEM_PROMPT } from "./systemPrompt";

/** Pinned snapshot for the paid report (covered by the sale). */
const PREMIUM_MODEL = process.env.ANTHROPIC_MODEL_PREMIUM ?? "claude-sonnet-4-6";

export type PremiumSource = "model" | "fallback" | "local";
export interface PremiumResult {
  report: PremiumReport;
  source: PremiumSource;
}

/** Deterministic cache key for a profile's report (cache by input, spec §6). */
export function premiumHash(p: PremiumProfile): string {
  const bf = p.bigFive.map((b) => `${b.trait}:${b.level}`).join(",");
  return fnv1a(`premium|${p.archetype}|${bf}|${p.stateLine}|${p.artistsDurable.join(",")}`);
}

export function buildPremiumUserMessage(p: PremiumProfile): string {
  const scores = p.bigFive.map((b) => `${b.trait}=${b.level}`).join(", ");
  return [
    "MODE: premium_report",
    `ARCHETYPE: ${p.archetype}`,
    `SCORES: ${scores}`,
    `ATTACHMENT_STYLE: ${p.attachmentStyle}`,
    `CURRENT_STATE: ${p.stateLine}`,
    `ARTISTS_RECENT: [${p.artistsRecent.join(", ")}]`,
    `ARTISTS_DURABLE: [${p.artistsDurable.join(", ")}]`,
  ].join("\n");
}

// --- Deterministic fallback ------------------------------------------------
const TRAIT_LINES: Record<string, Record<Level, string>> = {
  Openness: {
    High: "you'll try anything once, which is a personality and an alibi.",
    Medium: "adventurous until the algorithm gets comfortable.",
    Low: "you found your lane in 2017 and parked.",
  },
  Conscientiousness: {
    High: "your library is alphabetized; your inbox is not your only spreadsheet.",
    Medium: "organized enough to judge people who aren't.",
    Low: "shuffle is a lifestyle and a cry for help.",
  },
  Extraversion: {
    High: "music is a group sport and you're always captain.",
    Medium: "social on your terms, headphones as a fence.",
    Low: "you listen alone, in your own world, on purpose.",
  },
  Agreeableness: {
    High: "you'd hand over the aux and mean it.",
    Medium: "diplomatic until someone queues a bad song.",
    Low: "you have opinions and you have been asked to keep them down.",
  },
  Neuroticism: {
    High: "you don't pick songs, you self-medicate with them.",
    Medium: "mostly steady, with a 2am sad-playlist relapse.",
    Low: "unbothered; your sad songs are someone else's.",
  },
};

export function localPremiumReport(p: PremiumProfile): PremiumReport {
  const recent = p.artistsRecent[0] ?? "your heavy rotation";
  const recent2 = p.artistsRecent[1] ?? recent;
  const durable = p.artistsDurable[0] ?? "your forever favorite";
  const lvl = (t: string): Level => p.bigFive.find((b) => b.trait === t)?.level ?? "Medium";

  // Level-conditioned so two different profiles never share Red Flags (no §8 filler).
  const FLAGS: Record<string, Record<Level, string>> = {
    Neuroticism: {
      High: `You play ${recent} to feel something, then feel too much, then replay it.`,
      Medium: `You're steady — until a sad song ambushes you at 2am and wins.`,
      Low: `You weaponize other people's sad songs; yours stay locked in a vault.`,
    },
    Conscientiousness: {
      High: `Your playlists are immaculate; your actual life is the unaudited part.`,
      Medium: `Organized enough to judge, messy enough to relate. Convenient.`,
      Low: `"Shuffle" is how you dodge making one (1) decision about anything.`,
    },
    Openness: {
      High: `You chase new sounds to outrun being known — then ${durable} gives you away.`,
      Medium: `You discover exactly enough to seem interesting at the function.`,
      Low: `You've replayed the same era for years and called it loyalty, not fear.`,
    },
  };

  const picks: { pick: string; why: string }[] = [];
  picks.push(
    lvl("Neuroticism") === "High"
      ? { pick: "a song that refuses to make you cry", why: "you need the reps." }
      : { pick: "one genuinely happy song, daily", why: "joy isn't a sellout." },
  );
  picks.push(
    lvl("Conscientiousness") === "Low"
      ? { pick: "one playlist, finished start to end", why: "commitment, rehearsed quietly." }
      : { pick: "a record your past self would hate", why: "growth, but make it audible." },
  );
  picks.push(
    lvl("Extraversion") === "Low"
      ? { pick: `something you'd actually play for a room, not just ${recent2}`, why: "let someone else hear you." }
      : { pick: "a quiet album, alone, no posting about it", why: "a taste that isn't a performance." },
  );

  return {
    archetype: p.archetype,
    diagnosis: {
      summary: `${p.archetype}: ${p.stateLine}. You think your taste is a vibe — it's a confession, and you've been over-sharing.`,
      big_five: p.bigFive.map((b) => ({
        trait: b.trait,
        level: b.level,
        line: TRAIT_LINES[b.trait]?.[b.level] ?? `${b.trait} reads ${b.level}.`,
      })),
      attachment_style: {
        style: p.attachmentStyle,
        line: `It shows: ${durable} survived every breakup and every comeback, and you call that loyalty.`,
      },
    },
    red_flags: [
      FLAGS.Neuroticism[lvl("Neuroticism")],
      FLAGS.Conscientiousness[lvl("Conscientiousness")],
      FLAGS.Openness[lvl("Openness")],
    ],
    prescription: {
      intro: "Three corrections, administered without anesthetic:",
      picks,
      world_cup_pairing: `${durable} for the tense knockout games — the one thing that's never let you down.`,
    },
    closer: `${p.archetype} would never admit this is accurate. You will — the second you stop re-reading it. Screenshot it.`,
  };
}

function force(raw: PremiumReport, p: PremiumProfile): PremiumReport {
  return { ...raw, archetype: p.archetype }; // engine decides the type; model writes
}

export async function narratePremium(p: PremiumProfile): Promise<PremiumResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { report: localPremiumReport(p), source: "local" };
  }
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: PREMIUM_MODEL,
      max_tokens: 1600,
      temperature: 0.4,
      thinking: { type: "disabled" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildPremiumUserMessage(p) }],
      output_config: { format: zodOutputFormat(premiumReportSchema) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { report: localPremiumReport(p), source: "fallback" };
    }
    return { report: force(response.parsed_output, p), source: "model" };
  } catch {
    return { report: localPremiumReport(p), source: "fallback" };
  }
}
