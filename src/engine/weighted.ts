/**
 * Weighted answers (Track B · Slice 2) — the opt-in "can't decide? split it"
 * blend. A question can carry a SECONDARY option at a fixed 30% alongside the
 * 70% primary, raising input resolution for the in-between answerer.
 *
 * Still fully deterministic (§6): the split is a fixed constant and the maths is
 * pure, so the same weighted answers always produce the same verdict. The blend
 * is additive — it touches NOTHING in the single-pick path. An all-single-pick
 * `WeightedAnswers` is byte-identical to the regular `buildProfile` (same raw,
 * same hash, same verdict), so existing cached verdicts stay valid.
 *
 * The percentile baseline (axisSamples) stays the single-pick enumeration: a
 * blended raw is ranked against the realistic single-pick distribution, exactly
 * like a pure pick. Rarity likewise stays over the canonical single-pick space.
 */

import { fnv1a } from "./hash";
import { assembleProfile } from "./profile";
import type { Answers, CentroidSet, Profile, QuizConfig, ScoreVector } from "./types";

/** The fixed blend. Quantized on purpose: keeps the answer space finite, so
 *  determinism-by-enumeration, caching, and the rarity stat all still hold. */
export const SPLIT_PRIMARY = 0.7;
export const SPLIT_SECONDARY = 0.3;

/** A 70/30 blend of two options on one question. */
export interface WeightedAnswer {
  primary: string;
  secondary: string;
}

/** A question's answer: a single option id (100%) OR a 70/30 blend. */
export type AnswerChoice = string | WeightedAnswer;
export type WeightedAnswers = Record<string, AnswerChoice>;

const isBlend = (v: AnswerChoice): v is WeightedAnswer =>
  typeof v === "object" && v !== null;

/** The primary option id (the user's main lean). */
export const primaryOf = (v: AnswerChoice): string => (isBlend(v) ? v.primary : v);

/** Project a weighted set down to single-pick (primary only) — lets the
 *  single-pick helpers (proofs, signature, etc.) operate on the main lean. */
export function primaryAnswers(answers: WeightedAnswers): Answers {
  const out: Answers = {};
  for (const [k, v] of Object.entries(answers)) out[k] = primaryOf(v);
  return out;
}

/** Question ids that are missing/invalid: no primary, an unknown primary, or
 *  (for a blend) an unknown secondary. Mirrors `missingAnswers`. */
export function missingWeighted(config: QuizConfig, answers: WeightedAnswers): string[] {
  return config.questions
    .filter((q) => {
      const v = answers[q.id];
      if (v === undefined) return true;
      const ok = (id: string) => q.options.some((o) => o.id === id);
      return isBlend(v) ? !(ok(v.primary) && ok(v.secondary)) : !ok(v);
    })
    .map((q) => q.id);
}

/**
 * Sum weights with the blend: a single pick contributes its option at 1.0; a
 * blend contributes 0.7·primary + 0.3·secondary. A blended question's vector is
 * therefore a convex combination of the two options (it lands BETWEEN them).
 */
export function scoreWeightedAnswers(config: QuizConfig, answers: WeightedAnswers): ScoreVector {
  const raw: ScoreVector = {};
  for (const dim of config.dimensions) raw[dim] = 0; // complete shape, like scoreAnswers

  for (const q of config.questions) {
    const v = answers[q.id];
    if (v === undefined) continue;
    const add = (optionId: string, weight: number) => {
      const option = q.options.find((o) => o.id === optionId);
      if (!option) return;
      for (const [dim, w] of Object.entries(option.weights)) {
        raw[dim] = (raw[dim] ?? 0) + (w ?? 0) * weight;
      }
    };
    if (isBlend(v)) {
      add(v.primary, SPLIT_PRIMARY);
      add(v.secondary, SPLIT_SECONDARY);
    } else {
      add(v, 1);
    }
  }
  return raw;
}

/**
 * Canonical string INCLUDING the split, so a blend caches separately from a
 * pure pick. Crucially, an all-single-pick set serialises identically to
 * `canonicalAnswers` → same hash → existing single-pick cache entries are reused.
 */
export function canonicalWeighted(config: QuizConfig, answers: WeightedAnswers): string {
  const parts = config.questions
    .map((q) => {
      const v = answers[q.id];
      const s = v === undefined ? "" : isBlend(v) ? `${v.primary}+${v.secondary}` : v;
      return `${q.id}=${s}`;
    })
    .sort();
  return `${config.id}|${parts.join("&")}`;
}

/** Convenience: canonical + hash for a weighted set. */
export const hashWeighted = (config: QuizConfig, answers: WeightedAnswers): string =>
  fnv1a(canonicalWeighted(config, answers));

/** URL syntax for a blend: `primary~secondary` ("~" is URL-unreserved, so it
 *  survives URLSearchParams round-trips unencoded). */
export const BLEND_DELIM = "~";

/** Parse one query value into a choice: "a~b" → blend, "a" → single pick. */
export function parseAnswerChoice(value: string): AnswerChoice {
  const i = value.indexOf(BLEND_DELIM);
  if (i < 0) return value;
  const primary = value.slice(0, i);
  const secondary = value.slice(i + BLEND_DELIM.length);
  return secondary ? { primary, secondary } : primary;
}

/** Encode a choice back to its query value (round-trips `parseAnswerChoice`). */
export function encodeAnswerChoice(v: AnswerChoice): string {
  return typeof v === "string" ? v : `${v.primary}${BLEND_DELIM}${v.secondary}`;
}

/**
 * The weighted twin of `buildProfile`. Same deterministic verdict pipeline,
 * fed by the blended scorer + the split-aware hash. An all-single-pick input
 * yields a Profile identical to `buildProfile`'s.
 */
export function buildWeightedProfile(
  config: QuizConfig,
  archetypes: CentroidSet,
  roster: CentroidSet,
  answers: WeightedAnswers,
): Profile {
  const missing = missingWeighted(config, answers);
  if (missing.length > 0) {
    throw new Error(
      `buildWeightedProfile: incomplete/invalid: ${missing.join(", ")}`,
    );
  }
  return assembleProfile(
    config,
    archetypes,
    roster,
    scoreWeightedAnswers(config, answers),
    hashWeighted(config, answers),
  );
}
