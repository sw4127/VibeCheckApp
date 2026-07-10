/**
 * Prestige-Bias instrument math (memo D2, Instrument 1) — content-free, like
 * the rest of src/engine. The user rates clips blind, re-rates them labeled;
 * this module turns the two rating passes into the measured verdict. Nothing
 * here narrates and nothing here guesses: every number is arithmetic over the
 * user's own taps (the §6 principle, re-scoped by the 2026-07-11 pivot).
 *
 * Honesty notes (memo N3), load-bearing for the copy that surfaces these:
 * - The headline is the mean signed shift toward the label, expressed as a %
 *   of the rating scale. It is NOT a percentile and MUST NOT be presented as
 *   one until cohort norms exist.
 * - Re-rating the same clips anchors people on their first answer, so the
 *   measured sway UNDERSTATES the true effect. Copy may say "at least".
 * - Clips rated at the scale edge blind (no headroom toward the label) are
 *   counted in `edgeCount` so the UI can disclose the ceiling effect.
 */

import { fnv1a } from "./hash";

/** Rating scale bounds (inclusive). Integers only for v1. */
export const BIAS_SCALE_MIN = 0;
export const BIAS_SCALE_MAX = 10;
const SPAN = BIAS_SCALE_MAX - BIAS_SCALE_MIN;

/**
 * Verdict bucket thresholds in headline-% units. PROVISIONAL (memo N3): chosen
 * by judgment, not data — revisit once the calibration cohort exists (memo §7).
 */
export const BIAS_SWAYED_AT = 15;
export const BIAS_CONTRARIAN_AT = -15;

/** What the engine needs to know about one item. Content supplies the rest. */
export interface BiasItemSpec {
  id: string;
  /**
   * Which way the shown label pushes a rating: "up" (acclaimed attribution)
   * or "down" (dismissive attribution). Needed so sway is measured toward the
   * label rather than as raw drift between passes.
   */
  labelDirection: "up" | "down";
  /** False = the label is deliberately swapped; the debrief MUST disclose it. */
  labelIsTrue: boolean;
}

/** clipId -> integer rating in [BIAS_SCALE_MIN, BIAS_SCALE_MAX]. */
export type BiasRatings = Record<string, number>;

/** Per-clip receipt — the "you gave it 4 blind, 8 with the name" line. */
export interface BiasReceipt {
  id: string;
  blind: number;
  labeled: number;
  /** labeled - blind (signed, in points). */
  shift: number;
  /** Shift measured in the label's push direction: + = swayed, - = resisted. */
  towardLabel: number;
  /** Points of movement available toward the label from the blind rating. */
  headroom: number;
  labelIsTrue: boolean;
}

export type BiasVerdict = "swayed" | "steady" | "contrarian";

/** The fully computed, deterministic result. UI/card render this verbatim. */
export interface BiasResult {
  /** Stable hash of (instrument id + both rating passes) — the cache key. */
  hash: string;
  /** Mean signed shift toward the label, in points (-SPAN..SPAN). */
  meanShiftPts: number;
  /** Headline: meanShiftPts as a signed % of the scale, rounded. */
  pct: number;
  verdict: BiasVerdict;
  receipts: BiasReceipt[];
  /** Items whose shown label was false — the mandatory-debrief list. */
  swappedIds: string[];
  /** Items with zero headroom toward their label at the blind pass. */
  edgeCount: number;
  /**
   * Same stats over SWAPPED items only — the causally clean subset (moving
   * toward a false label cannot be legitimate updating). Null when the item
   * set has no swaps (engine is generic; the v1 pool always has 2–3).
   */
  swappedMeanShiftPts: number | null;
  swappedPct: number | null;
  /**
   * Share of MOVABLE items (headroom > 0) whose rating moved toward the
   * label — the consistency receipt ("7 of 8 clips"), and the one stat the
   * edge artifact cannot touch. Null when every item was at the edge.
   */
  swayShare: number | null;
  /** Denominator behind swayShare, for "N of M" copy. */
  movableCount: number;
}

function assertRating(pass: string, id: string, value: number | undefined): asserts value is number {
  if (value === undefined) throw new Error(`bias: missing ${pass} rating for "${id}"`);
  if (!Number.isInteger(value) || value < BIAS_SCALE_MIN || value > BIAS_SCALE_MAX) {
    throw new Error(
      `bias: ${pass} rating for "${id}" must be an integer in [${BIAS_SCALE_MIN},${BIAS_SCALE_MAX}], got ${value}`,
    );
  }
}

/** Canonical string of both passes — item ids sorted, instrument id included. */
export function canonicalBiasInput(
  instrumentId: string,
  items: BiasItemSpec[],
  blind: BiasRatings,
  labeled: BiasRatings,
): string {
  const parts = items
    .map((item) => `${item.id}=${blind[item.id]}>${labeled[item.id]}`)
    .sort();
  return `${instrumentId}|${parts.join("&")}`;
}

/**
 * The instrument. Throws on malformed input (unrated/unknown ids, non-integer
 * or out-of-range ratings, empty item list) — the UI must never let those
 * reach here, and a throw is a bug upstream, not a user error.
 */
export function computeBiasResult(
  instrumentId: string,
  items: BiasItemSpec[],
  blind: BiasRatings,
  labeled: BiasRatings,
): BiasResult {
  if (items.length === 0) throw new Error("bias: item list is empty");
  const ids = new Set(items.map((i) => i.id));
  if (ids.size !== items.length) throw new Error("bias: duplicate item ids");
  for (const key of [...Object.keys(blind), ...Object.keys(labeled)]) {
    if (!ids.has(key)) throw new Error(`bias: rating for unknown item "${key}"`);
  }

  const receipts: BiasReceipt[] = items.map((item) => {
    const b = blind[item.id];
    const l = labeled[item.id];
    assertRating("blind", item.id, b);
    assertRating("labeled", item.id, l);
    const shift = l - b;
    const towardLabel = item.labelDirection === "up" ? shift : -shift;
    const headroom = item.labelDirection === "up" ? BIAS_SCALE_MAX - b : b - BIAS_SCALE_MIN;
    return { id: item.id, blind: b, labeled: l, shift, towardLabel, headroom, labelIsTrue: item.labelIsTrue };
  });

  const mean = (rs: BiasReceipt[]) => rs.reduce((sum, r) => sum + r.towardLabel, 0) / rs.length;
  const meanShiftPts = mean(receipts);
  const pct = Math.round((meanShiftPts / SPAN) * 100);
  const verdict: BiasVerdict =
    pct >= BIAS_SWAYED_AT ? "swayed" : pct <= BIAS_CONTRARIAN_AT ? "contrarian" : "steady";

  const swapped = receipts.filter((r) => !r.labelIsTrue);
  const swappedMeanShiftPts = swapped.length > 0 ? mean(swapped) : null;
  const movable = receipts.filter((r) => r.headroom > 0);

  return {
    hash: fnv1a(canonicalBiasInput(instrumentId, items, blind, labeled)),
    meanShiftPts,
    pct,
    verdict,
    receipts,
    swappedIds: items.filter((i) => !i.labelIsTrue).map((i) => i.id),
    edgeCount: receipts.length - movable.length,
    swappedMeanShiftPts,
    swappedPct: swappedMeanShiftPts === null ? null : Math.round((swappedMeanShiftPts / SPAN) * 100),
    swayShare: movable.length > 0 ? movable.filter((r) => r.towardLabel > 0).length / movable.length : null,
    movableCount: movable.length,
  };
}
