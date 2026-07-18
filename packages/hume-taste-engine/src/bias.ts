// EXTRACTED COPY — source of truth is src/engine/bias.ts in the host app until first publish.
// Keep in sync; divergence is a bug.
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
 * - v1.1 control items (instrument-defenses §hardening, PM ruling RT-1a/RT-2a
 *   2026-07-19): items with `isControl` are rated in BOTH passes but never
 *   labeled. They measure per-user second-pass drift (memory, familiarity,
 *   regression), and the headline subtracts the RESIDUAL that drift leaves in
 *   the sway stat. Uniform drift mostly cancels because label directions are
 *   balance-enforced; what survives is d̄·(nUp−nDown)/n, and that is exactly
 *   what gets subtracted — never the full d̄ (full subtraction would be wrong
 *   in both directions: it under-reports sway for upward drifters and
 *   inflates it for downward drifters).
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
  /**
   * Control item: rated in both passes, labeled in NEITHER. Excluded from
   * every sway stat; its second-pass drift is the per-user baseline the
   * headline is corrected by. For controls `labelDirection` is ignored and
   * `labelIsTrue` must be true (nothing shown, so nothing can be false).
   */
  isControl?: boolean;
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

/** Per-control receipt: raw second-pass drift, no label anywhere in sight. */
export interface BiasControlReceipt {
  id: string;
  first: number;
  second: number;
  /** second - first (signed, in points) — pure re-exposure drift. */
  drift: number;
}

/** The fully computed, deterministic result. UI/card render this verbatim. */
export interface BiasResult {
  /** Stable hash of (instrument id + both rating passes) — the cache key. */
  hash: string;
  /** RAW mean signed shift toward the label over scored items, in points. */
  meanShiftPts: number;
  /** meanShiftPts as a signed % of the scale, rounded — the UNCORRECTED stat. */
  rawPct: number;
  /**
   * THE HEADLINE: drift-corrected mean shift as a signed % of the scale.
   * Equals rawPct when the item set has no controls. Correction (RT-2a):
   *   adjusted = raw − controlDriftPts · (nUp − nDown) / nScored
   * i.e. only the residual that uniform drift leaves after the direction
   * balance has cancelled most of it. Verdict is computed from THIS.
   */
  pct: number;
  /** meanShiftPts after the drift correction, in points. */
  adjustedMeanShiftPts: number;
  /** Mean signed second-pass drift on control items; null without controls. */
  controlDriftPts: number | null;
  controlCount: number;
  /** Control receipts for the debrief's full-disclosure list (N3). */
  controlReceipts: BiasControlReceipt[];
  verdict: BiasVerdict;
  /** Scored (non-control) items only — controls carry no label to shift toward. */
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

/**
 * Compact CSV of ratings in item order — the stateless share-URL payload
 * (?b=&l=). The share page and card RECOMPUTE the verdict from these raw
 * ratings, so a forged URL can only ever show what the engine would actually
 * conclude from those ratings (N3: no unmeasured claim can carry our brand).
 */
export function encodeBiasRatings(items: BiasItemSpec[], ratings: BiasRatings): string {
  return items.map((i) => ratings[i.id]).join(",");
}

/** Strict inverse of encodeBiasRatings. Returns null on ANY malformation. */
export function decodeBiasRatings(items: BiasItemSpec[], csv: string | undefined): BiasRatings | null {
  if (typeof csv !== "string") return null;
  const parts = csv.split(",");
  if (parts.length !== items.length) return null;
  const out: BiasRatings = {};
  for (let i = 0; i < items.length; i++) {
    if (!/^(?:10|[0-9])$/.test(parts[i])) return null;
    out[items[i].id] = Number(parts[i]);
  }
  return out;
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
  const scored = items.filter((i) => !i.isControl);
  const controls = items.filter((i) => i.isControl);
  if (scored.length === 0) throw new Error("bias: no scored (non-control) items");

  // Every item — control or not — must carry a valid rating in both passes.
  for (const item of items) {
    assertRating("blind", item.id, blind[item.id]);
    assertRating("labeled", item.id, labeled[item.id]);
  }

  const receipts: BiasReceipt[] = scored.map((item) => {
    const b = blind[item.id];
    const l = labeled[item.id];
    const shift = l - b;
    const towardLabel = item.labelDirection === "up" ? shift : -shift;
    const headroom = item.labelDirection === "up" ? BIAS_SCALE_MAX - b : b - BIAS_SCALE_MIN;
    return { id: item.id, blind: b, labeled: l, shift, towardLabel, headroom, labelIsTrue: item.labelIsTrue };
  });

  const controlReceipts: BiasControlReceipt[] = controls.map((item) => ({
    id: item.id,
    first: blind[item.id],
    second: labeled[item.id],
    drift: labeled[item.id] - blind[item.id],
  }));

  const mean = (rs: BiasReceipt[]) => rs.reduce((sum, r) => sum + r.towardLabel, 0) / rs.length;
  const meanShiftPts = mean(receipts);

  // RT-2a residual correction: uniform drift d̄ contributes +d̄ toward-label on
  // "up" items and −d̄ on "down" items, so its footprint in the mean is
  // d̄·(nUp−nDown)/n — that residual, and only that, is subtracted.
  const controlDriftPts =
    controlReceipts.length > 0
      ? controlReceipts.reduce((s, r) => s + r.drift, 0) / controlReceipts.length
      : null;
  const nUp = scored.filter((i) => i.labelDirection === "up").length;
  const adjustment =
    controlDriftPts === null ? 0 : (controlDriftPts * (nUp - (scored.length - nUp))) / scored.length;
  const adjustedMeanShiftPts = meanShiftPts - adjustment;

  const rawPct = Math.round((meanShiftPts / SPAN) * 100);
  const pct = Math.round((adjustedMeanShiftPts / SPAN) * 100);
  const verdict: BiasVerdict =
    pct >= BIAS_SWAYED_AT ? "swayed" : pct <= BIAS_CONTRARIAN_AT ? "contrarian" : "steady";

  const swapped = receipts.filter((r) => !r.labelIsTrue);
  const swappedMeanShiftPts = swapped.length > 0 ? mean(swapped) : null;
  const movable = receipts.filter((r) => r.headroom > 0);

  return {
    hash: fnv1a(canonicalBiasInput(instrumentId, items, blind, labeled)),
    meanShiftPts,
    rawPct,
    pct,
    adjustedMeanShiftPts,
    controlDriftPts,
    controlCount: controls.length,
    controlReceipts,
    verdict,
    receipts,
    swappedIds: scored.filter((i) => !i.labelIsTrue).map((i) => i.id),
    edgeCount: receipts.length - movable.length,
    swappedMeanShiftPts,
    swappedPct: swappedMeanShiftPts === null ? null : Math.round((swappedMeanShiftPts / SPAN) * 100),
    swayShare: movable.length > 0 ? movable.filter((r) => r.towardLabel > 0).length / movable.length : null,
    movableCount: movable.length,
  };
}
