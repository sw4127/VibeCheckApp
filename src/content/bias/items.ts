/**
 * Prestige-Bias Test item pool — v1 (memo D2 Instrument 1, D3 flagship).
 *
 * ⚠️ EVERY ITEM BELOW IS A PLACEHOLDER. The PM authors the real pool (clips,
 * true attributions, blurbs, swaps) per the approved plan; audio must be
 * public-domain / CC only (CLAUDE.md §Stack, amended per memo §8.2) and every
 * CC clip carries its attribution line (shown on the debrief screen + /legal).
 *
 * Design constraints — enforced by content/bias/bias.test.ts, do not relax
 * without a test change the PM has approved:
 * - ≥ 8 items;
 * - 2–3 swapped labels (labelIsTrue: false) → the mandatory debrief has teeth;
 * - label directions balanced (|up - down| ≤ 2) so measured sway is the label
 *   effect, not generic second-pass drift (re-exposure/regression to mean);
 * - at least one swapped item in EACH direction (a famous name on a lesser
 *   work AND a dismissive label on a strong one).
 */

import type { BiasItemSpec } from "@/engine/bias";

export const BIAS_INSTRUMENT_ID = "prestige-bias-v1";

/**
 * Pool version (RT-7b). BUMP THIS ON ANY POOL CHANGE — items added, removed,
 * reordered, relabeled, re-windowed, or re-rendered. It rides in every share
 * URL and every bias_result event, so stored responses and old links are
 * permanently interpretable against the exact pool that produced them (D6).
 * Old-version URLs die gracefully (redirect to /bias), never lie.
 */
export const BIAS_POOL_VERSION = 1;

/** One playable, labelable clip. Extends the engine spec with presentation. */
export interface BiasClip extends BiasItemSpec {
  /** Static file under /public — PD/CC audio only (memo §8.2). */
  audioSrc: string;
  /** Truthful attribution (revealed at debrief). */
  trueArtist: string;
  /** What the labeled pass shows. Equals the truth when labelIsTrue. */
  shownArtist: string;
  /** One-line acclaim (direction "up") or dismissal (direction "down"). */
  shownBlurb: string;
  /** License of the recording, e.g. "Public Domain" | "CC-BY 4.0". */
  license: string;
  /** Required credit line for CC works; empty allowed for PD only. */
  attribution: string;
}

const placeholder = (
  n: number,
  labelDirection: "up" | "down",
  labelIsTrue: boolean,
): BiasClip => ({
  id: `pb${n}`,
  audioSrc: `/audio/bias/PLACEHOLDER-${n}.mp3`,
  trueArtist: `PLACEHOLDER true artist ${n} (PM to author)`,
  shownArtist: labelIsTrue
    ? `PLACEHOLDER true artist ${n} (PM to author)`
    : `PLACEHOLDER swapped artist ${n} (PM to author)`,
  shownBlurb:
    labelDirection === "up"
      ? `PLACEHOLDER acclaim line ${n} (PM to author)`
      : `PLACEHOLDER dismissal line ${n} (PM to author)`,
  license: "PLACEHOLDER (PD or CC-BY only)",
  attribution: `PLACEHOLDER attribution ${n}`,
  labelDirection,
  labelIsTrue,
});

/** The v1 pool. Order = presentation order for both passes. */
export const BIAS_CLIPS: BiasClip[] = [
  placeholder(1, "up", true),
  placeholder(2, "down", true),
  placeholder(3, "up", false), // swap: famous name on a lesser work
  placeholder(4, "down", true),
  placeholder(5, "up", true),
  placeholder(6, "down", false), // swap: dismissive label on a strong work
  placeholder(7, "up", true),
  placeholder(8, "down", false), // swap
];
