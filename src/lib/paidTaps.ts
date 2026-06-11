/**
 * §17.C / §18.E — the durable-trait taps, collected in the PAID flow only (the
 * free quiz stays minimal). Deterministic option→level mapping in code (engine
 * routing, §6); answers ride the report URL statelessly. Upgrading C/A/N
 * changes premiumHash → the report regenerates with full five-trait signal and
 * the steady_line collapse disappears (§20.B2).
 */
import type { PremiumProfile } from "@/content/sample-profile";
import type { Level } from "@/llm/premiumSchema";

export interface PaidTap {
  /** URL param key. */
  id: "c" | "a" | "n";
  trait: "Conscientiousness" | "Agreeableness" | "Neuroticism";
  prompt: string;
  options: { id: string; label: string; level: Level }[];
}

export const PAID_TAPS: PaidTap[] = [
  {
    id: "c",
    trait: "Conscientiousness",
    prompt: "Your music lives as…",
    options: [
      { id: "meticulous", label: "Meticulous playlists", level: "High" },
      { id: "gotos", label: "A few trusted go-tos", level: "Medium" },
      { id: "chaos", label: "Total shuffle chaos", level: "Low" },
      { id: "algo", label: "Whatever the algorithm serves", level: "Low" },
    ],
  },
  {
    id: "a",
    trait: "Agreeableness",
    prompt: "Someone hands you the aux — then talks over your song. You…",
    options: [
      { id: "laugh", label: "Laugh it off", level: "High" },
      { id: "note", label: "Quietly note it", level: "Medium" },
      { id: "never", label: "Never give up the aux again", level: "Low" },
    ],
  },
  {
    id: "n",
    trait: "Neuroticism",
    prompt: "A song you love blows up everywhere. You…",
    options: [
      { id: "love", label: "Still love it", level: "Low" },
      { id: "betrayed", label: "Feel a little betrayed", level: "High" },
    ],
  },
];

/** Override trait levels from valid answered taps. Invalid/missing ids = no-op. */
export function applyPaidTaps(
  profile: PremiumProfile,
  answers: { c?: string; a?: string; n?: string },
): PremiumProfile {
  const overrides = new Map<string, Level>();
  for (const tap of PAID_TAPS) {
    const chosen = answers[tap.id];
    if (!chosen) continue;
    const opt = tap.options.find((o) => o.id === chosen);
    if (opt) overrides.set(tap.trait, opt.level);
  }
  if (overrides.size === 0) return profile;
  return {
    ...profile,
    bigFive: profile.bigFive.map((b) =>
      overrides.has(b.trait) ? { ...b, level: overrides.get(b.trait)! } : b,
    ),
  };
}

/** The taps still worth asking: traits whose current level is a Medium placeholder. */
export function neededTaps(profile: PremiumProfile): PaidTap[] {
  return PAID_TAPS.filter(
    (t) => profile.bigFive.find((b) => b.trait === t.trait)?.level === "Medium",
  );
}
