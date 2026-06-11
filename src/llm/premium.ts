/**
 * PAID premium-report narration, v2 (spec §20.B + §21 Voice Bible).
 * The model is the WRITER only (§6): it receives the pre-computed, pre-split
 * profile and writes for it. Engine-decided fields (archetype, levels,
 * attachment) are anchored back onto the output; receipts cite only
 * engine-true facts. Deterministic fallback keeps the paid view whole at $0.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { PremiumProfile, StateLevels } from "@/content/sample-profile";
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

const lvl = (p: PremiumProfile, t: string): Level =>
  p.bigFive.find((b) => b.trait === t)?.level ?? "Medium";

/** Deterministic cache key for a profile's report (cache by input, §6/§19.A). */
export function premiumHash(p: PremiumProfile): string {
  const bf = p.bigFive.map((b) => `${b.trait}:${b.level}`).join(",");
  const st = p.stateLevels
    ? `${p.stateLevels.energy},${p.stateLevels.regulation},${p.stateLevels.rumination}`
    : "none";
  return fnv1a(
    `premium2|${p.archetype}|${bf}|${st}|${p.stateLine}|${p.artistsRecent.join(",")}|${p.artistsDurable.join(",")}`,
  );
}

// --- Receipt facts (§20.B3 / §21.A5): the ONLY citable facts -----------------
// Each maps a non-Medium engine level to the quiz answer that produced it
// (Q numbers match the music quiz order). Engine-true by construction.
export function receiptFacts(p: PremiumProfile): string[] {
  const facts: string[] = [];
  const s = p.stateLevels;
  if (s) {
    if (s.rumination === "High") facts.push("Q6 — they turn sad songs up and sit in them");
    if (s.rumination === "Low") facts.push("Q6 — they swap sad songs out fast");
    if (s.regulation === "High") facts.push("Q2 — they use music to fix their mood");
    if (s.regulation === "Low") facts.push("Q2 — they match the mood they're in");
    if (s.energy === "High") facts.push("Q1 — their rotation runs loud");
    if (s.energy === "Low") facts.push("Q1 — their rotation runs quiet");
  }
  const o = lvl(p, "Openness");
  if (o === "High") facts.push("Q4/Q5 — they chase new finds off the path");
  if (o === "Low") facts.push("Q4/Q5 — they replay old comforts");
  const e = lvl(p, "Extraversion");
  if (e === "Low") facts.push("Q7 — they listen alone, in their own world");
  if (e === "High") facts.push("Q7 — listening happens with people");
  return facts;
}

export function buildPremiumUserMessage(p: PremiumProfile): string {
  const traits = p.bigFive.map((b) => `${b.trait}=${b.level}`).join(", ");
  const state = p.stateLevels
    ? `Energy=${p.stateLevels.energy}, Regulation=${p.stateLevels.regulation}, Rumination=${p.stateLevels.rumination}`
    : `(state lane unmeasured — lean on: ${p.stateLine})`;
  return [
    "MODE: premium_report",
    `ARCHETYPE: ${p.archetype}`,
    `TRAIT_SCORES: ${traits}`,
    `STATE_SCORES: ${state}`,
    `ATTACHMENT_STYLE: ${p.attachmentStyle}`,
    `RECEIPT_FACTS: ${receiptFacts(p).join("; ") || "(none — do not cite any answers)"}`,
    `ARTISTS_RECENT: [${p.artistsRecent.join(", ")}]`,
    `ARTISTS_DURABLE: [${p.artistsDurable.join(", ")}]`,
  ].join("\n");
}

// --- Deterministic fallback (v2, §21 voice) ----------------------------------

const TRAIT_LINES: Record<string, Record<Level, string>> = {
  Openness: {
    High: "you'll audition anything once — which is a personality and an alibi.",
    Medium: "adventurous until the algorithm gets comfortable.",
    Low: "you found your lane years ago and parked, engine running.",
  },
  Conscientiousness: {
    High: "the library is in order so the feelings don't have to be.",
    Medium: "organized enough to judge people who aren't.",
    Low: "shuffle isn't a setting for you, it's a worldview.",
  },
  Extraversion: {
    High: "music is a group sport and you always make the roster.",
    Medium: "social on your terms, headphones as a fence.",
    Low: "you listen alone, in your own world, on purpose.",
  },
  Agreeableness: {
    High: "you'd hand over the aux and mean it.",
    Medium: "diplomatic until someone queues a bad song.",
    Low: "your opinions arrive unrequested and stay.",
  },
  Neuroticism: {
    High: "you don't pick songs, you dose them.",
    Medium: "mostly steady, with a 2am sad-playlist relapse.",
    Low: "your sad songs are someone else's. Deliberately.",
  },
};

const ALWAYS_LINES: Record<string, Record<"High" | "Low", string>> = {
  Openness: {
    High: "New things enter your life on probation. You've always auditioned everything.",
    Low: "You found your rooms years ago and kept them. Doors stay where they are.",
  },
  Conscientiousness: {
    High: "You've always needed the library in order before the feelings.",
    Low: "Structure was always optional. The shuffle was never an accident.",
  },
  Extraversion: {
    High: "Music has always been a group sport. You pass the ball loudly.",
    Low: "You've always listened alone first. Trust, for you, has a tracklist.",
  },
  Agreeableness: {
    High: "You've always handed over the aux and meant it.",
    Low: "You've always known exactly what's wrong with everyone's queue.",
  },
  Neuroticism: {
    High: "The volume has always tracked the weather inside.",
    Low: "You've always kept the sad songs at arm's length. Deliberately.",
  },
};

const ALWAYS_HEADLINES: Record<string, Record<"High" | "Low", string>> = {
  Openness: { High: "The baseline: a collector of new doors.", Low: "The baseline: a keeper of known rooms." },
  Extraversion: { High: "The baseline: the room's pulse.", Low: "The baseline: an audience of one." },
  Neuroticism: { High: "The baseline: weather-sensitive, finely tuned.", Low: "The baseline: dry land." },
  Conscientiousness: { High: "The baseline: a curator with receipts.", Low: "The baseline: beautiful chaos, filed nowhere." },
  Agreeableness: { High: "The baseline: a generous ear.", Low: "The baseline: a sharp one." },
};

const LATELY_HEADLINES: Record<keyof StateLevels, Record<"High" | "Low", string>> = {
  rumination: { High: "You've been sitting in it.", Low: "You've been skipping the hard tracks." },
  regulation: { High: "You've been managing the weather.", Low: "You've been letting the weather in." },
  energy: { High: "The volume's been doing the talking.", Low: "It's been quiet in there." },
};

const LATELY_LINES: Record<keyof StateLevels, Record<"High" | "Low", string>> = {
  energy: {
    High: "Everything's been running loud. Insulation works — it also drowns the narrator.",
    Low: "You've kept it quiet lately. Not calm — quiet. There's a difference.",
  },
  regulation: {
    High: "You've been prescribing yourself playlists. Doctor and patient, same headphones.",
    Low: "You've been letting the mood drive. Honest. Risky.",
  },
  rumination: {
    High: "You've been replaying the ones that hurt. Marinating, not healing.",
    Low: "Quick on the eject button these weeks. Efficient. Avoidant-efficient.",
  },
};

const STATE_PRIORITY: (keyof StateLevels)[] = ["rumination", "regulation", "energy"];
const TRAIT_PRIORITY = ["Openness", "Extraversion", "Neuroticism", "Conscientiousness", "Agreeableness"];

function latelyBlock(p: PremiumProfile): { headline: string; lines: string[] } {
  const s = p.stateLevels;
  if (!s) {
    return {
      headline: "The last few weeks, by the rotation:",
      lines: [`You've been ${p.stateLine}.`, "Check that against your week. We'll wait."],
    };
  }
  const extremes = STATE_PRIORITY.filter((k) => s[k] !== "Medium");
  if (extremes.length === 0) {
    return {
      headline: "A steady stretch — nothing's been shouting.",
      lines: [
        "Nothing's been shouting lately. That's either peace or a pause.",
        "Your rotation says maintenance mode. Believable — for now.",
      ],
    };
  }
  const dom = extremes[0];
  const lines = extremes.slice(0, 3).map((k) => LATELY_LINES[k][s[k] as "High" | "Low"]);
  if (lines.length < 2) lines.push("The rest of the dial has been steady. One needle moving is enough.");
  const recent = p.artistsRecent[0];
  if (recent) lines[0] = `${recent} on repeat tracks it: ${lines[0].charAt(0).toLowerCase()}${lines[0].slice(1)}`;
  return { headline: LATELY_HEADLINES[dom][s[dom] as "High" | "Low"], lines };
}

function alwaysBlock(p: PremiumProfile): { headline: string; lines: string[] } {
  const extremes = TRAIT_PRIORITY.filter((t) => lvl(p, t) !== "Medium");
  if (extremes.length === 0) {
    return {
      headline: "The baseline: steady hands on the aux.",
      lines: [
        "No trait shouts. You are, durably, hard to startle.",
        "That's not blandness — it's ballast. Someone has to be the keel.",
      ],
    };
  }
  const lines = extremes.slice(0, 3).map((t) => ALWAYS_LINES[t][lvl(p, t) as "High" | "Low"]);
  if (lines.length < 2) lines.push("The rest of you reads steady. One fixed star is plenty to steer by.");
  const durable = p.artistsDurable[0];
  if (durable) lines[lines.length - 1] += ` ${durable} has survived every version of you — that's the tell.`;
  const dom = extremes[0];
  return { headline: ALWAYS_HEADLINES[dom][lvl(p, dom) as "High" | "Low"], lines };
}

function verdictLine(p: PremiumProfile): string {
  const s = p.stateLevels;
  const eLow = lvl(p, "Extraversion") === "Low";
  const nHigh = lvl(p, "Neuroticism") === "High";
  if (s?.rumination === "High" && eLow)
    return "The watcher's been walled in. When the wall drops, keep the watcher fed.";
  if (s?.regulation === "High" && nHigh)
    return "You medicate a storm you could just watch. The storm knows.";
  if (s?.energy === "High" && lvl(p, "Openness") === "Low")
    return "Loud lately, loyal always — noise as a guard dog for old rooms.";
  return "LATELY is weather; ALWAYS is climate. Don't let one season redecorate the house.";
}

interface FlagItem {
  flag: string;
  receipt: string;
}

function redFlags(p: PremiumProfile): FlagItem[] {
  const s = p.stateLevels;
  const out: FlagItem[] = [];
  const push = (cond: boolean, flag: string, receipt: string) => {
    if (cond && out.length < 3) out.push({ flag, receipt });
  };
  // State lane first — recent feeds Red Flags (§9 timescale, §17.B).
  push(s?.rumination === "High", "You replay what hurts and call it taste.", "Q6: turn it up, sit in it — your words");
  push(s?.regulation === "High", "You fix moods instead of feeling them, and never learn what they wanted.", "Q2: music as the fix");
  push(s?.energy === "High", "The loudness is a bodyguard. Nobody gets close enough to ask questions.", "Q1: feel-everything volume");
  push(s?.rumination === "Low", "You skip anything that might land. Including, occasionally, people.", "Q6: eject button, fast");
  push(s?.regulation === "Low", "You let moods run the queue, then wonder who's driving.", "Q2: matching, never steering");
  push(s?.energy === "Low", "You call the quiet 'peace.' Audit that.", "Q1: slow-Sunday rotation");
  // Trait lane next.
  push(lvl(p, "Openness") === "High", "You chase new sounds to outrun being known.", "Q4: chasing new finds");
  push(lvl(p, "Openness") === "Low", "Years in the same era. Loyalty — or fear of auditions.", "Q5: your own answer");
  push(lvl(p, "Extraversion") === "Low", "You'd rather discover alone than be discovered.", "Q7: alone, your words");
  push(lvl(p, "Extraversion") === "High", "If nobody's watching, did you even listen? Asking for you.", "Q7: with people, out loud");
  push(lvl(p, "Neuroticism") === "High", "You don't pick songs; you self-medicate with them.", "the rotation says so");
  push(lvl(p, "Conscientiousness") === "Low", "Finishing a playlist start-to-end would be a personality transplant.", "the shuffle habit says so");
  // Pad (rare): attachment-anchored generics.
  push(out.length < 3, `${p.attachmentStyle} with a queue — you bond through tracks so you don't have to talk.`, "the attachment read");
  push(out.length < 3, "You mistake a good playlist for having it together.", "universal — but you especially");
  return out.slice(0, 3);
}

export function localPremiumReport(p: PremiumProfile): PremiumReport {
  const durable = p.artistsDurable[0] ?? "your forever favorite";
  const measured = p.bigFive.filter((b) => b.level !== "Medium");

  const picks: { pick: string; why: string }[] = [];
  picks.push(
    lvl(p, "Neuroticism") === "High" || p.stateLevels?.rumination === "High"
      ? { pick: "a song that refuses to make you cry", why: "you need the reps." }
      : { pick: "one genuinely happy song, daily", why: "joy isn't a sellout." },
  );
  picks.push(
    lvl(p, "Conscientiousness") === "Low"
      ? { pick: "one playlist, finished start to end", why: "commitment, rehearsed quietly." }
      : { pick: "a record your past self would hate", why: "growth, but make it audible." },
  );
  picks.push(
    lvl(p, "Extraversion") === "Low"
      ? { pick: "something you'd play for a full room", why: "let someone else hear you." }
      : { pick: "a quiet album, alone, unposted", why: "a taste that isn't a performance." },
  );

  return {
    archetype: p.archetype,
    split: {
      lately: latelyBlock(p),
      always: alwaysBlock(p),
      verdict: verdictLine(p),
    },
    diagnosis: {
      summary: `${p.archetype}: ${p.stateLine}. The part below is the part you already suspected.`,
      traits: measured.map((b) => ({
        trait: b.trait,
        level: b.level,
        line: TRAIT_LINES[b.trait]?.[b.level] ?? `${b.trait} reads ${b.level}.`,
      })),
      steady_line:
        measured.length < 5
          ? "The rest of you reads steady — nothing diagnostic, nothing hiding."
          : "",
      attachment_style: {
        style: p.attachmentStyle,
        line: `It shows: ${durable} survived every breakup and every comeback, and you call that loyalty.`,
      },
    },
    red_flags: redFlags(p),
    prescription: {
      intro: "Three corrections, administered without anesthetic:",
      picks,
      pairing: `${durable} for the tense knockout games — the one thing that's never let you down.`,
    },
    closer: `Still re-reading this, ${p.archetype}? Of course you are. Screenshot it and prove it wrong.`,
  };
}

/**
 * Anchor every engine-decided field onto the model's output (§6/§19.B1):
 * archetype + attachment style forced; the traits array is rebuilt from the
 * MEASURED (non-Medium) profile traits — model prose survives per trait, model
 * levels never do; Medium traits are excluded and the steady_line collapse is
 * guaranteed. Exported for tests.
 */
export function anchorReport(raw: PremiumReport, p: PremiumProfile): PremiumReport {
  const measured = p.bigFive.filter((b) => b.level !== "Medium");
  const traits = measured.map((b) => {
    const written = raw.diagnosis.traits.find((x) => x.trait === b.trait);
    return {
      trait: b.trait,
      level: b.level, // engine's level wins, always
      line: written?.line ?? TRAIT_LINES[b.trait]?.[b.level] ?? `${b.trait} reads ${b.level}.`,
    };
  });
  return {
    ...raw,
    archetype: p.archetype,
    diagnosis: {
      ...raw.diagnosis,
      traits,
      steady_line:
        measured.length < 5
          ? raw.diagnosis.steady_line ||
            "The rest of you reads steady — nothing diagnostic, nothing hiding."
          : "",
      attachment_style: {
        style: p.attachmentStyle, // engine's style wins
        line: raw.diagnosis.attachment_style.line,
      },
    },
  };
}

/**
 * Per-instance cache keyed by premiumHash: a purchased report re-serves the
 * SAME text on refresh instead of re-calling Sonnet per view (§19.A). Lost on
 * cold start — acceptable; verdict fields are anchored regardless. No DB.
 */
const reportCache = new Map<string, PremiumResult>();

export async function narratePremium(p: PremiumProfile): Promise<PremiumResult> {
  const key = premiumHash(p);
  const cached = reportCache.get(key);
  if (cached) return cached;

  if (!process.env.ANTHROPIC_API_KEY) {
    const result: PremiumResult = { report: localPremiumReport(p), source: "local" };
    reportCache.set(key, result); // deterministic — safe to cache
    return result;
  }
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: PREMIUM_MODEL,
      max_tokens: 1600,
      temperature: 0.3, // §6 stabilizer band
      thinking: { type: "disabled" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildPremiumUserMessage(p) }],
      output_config: { format: zodOutputFormat(premiumReportSchema) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      // Transient failure — do NOT cache, so the next view can retry the model.
      return { report: localPremiumReport(p), source: "fallback" };
    }
    const result: PremiumResult = {
      report: anchorReport(response.parsed_output, p),
      source: "model",
    };
    reportCache.set(key, result);
    return result;
  } catch {
    return { report: localPremiumReport(p), source: "fallback" };
  }
}
