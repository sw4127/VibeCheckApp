/**
 * The "shortcut spine" (Slice 1b) — the reusable LENS the engine installs for a
 * verdict. Not a result we write once; a portable rule the user can quote.
 *
 * Selection is DETERMINISTIC: the engine picks the spine by archetype id (§6 —
 * the LLM never classifies). The prose below is self-contained and ships as-is
 * on the FREE path ($0, no model call). Slices 3/4 (paid / free-text) later
 * OVERRIDE the `slots` injection points with the user's quoted specifics — the
 * fixed LAW/CLOSER stay constant so the card stamp and the A1 hook never drift.
 *
 * Voice is governed by §21 (the Voice Bible): specificity = anti-Barnum,
 * observation→motive, declarative present tense, verbs over adjectives,
 * SEE→NORMALIZE→EXPOSE→DIGNIFY, word budgets, banned list.
 */

export interface Spine {
  /**
   * The fixed, quotable operating rule — 6–10 words. The crystallizing token:
   * it goes on the share card and A1 dangles it below the paywall blur.
   */
  law: string;
  /** 2–3 "you do X when Y" self-detection triggers (anti-Barnum, §21.A1). */
  tells: string[];
  /** Installs the lens on the user's PAST (observation→motive, §21.A2/A7). */
  reframe: string;
  /**
   * The archetype's shadow kept as an INSTRUMENT — dignify, never flatter
   * (§21.A3 DIGNIFY). Distinct from §20.B's LATELY/ALWAYS "Split" block.
   */
  split: string;
  /** The crystallizing final line — screenshottable, ≤25 words (§21.B closer). */
  closer: string;
  /**
   * Where slices 3/4 inject the user's quoted specifics (spine field → what
   * fills it). Documents the personalization contract WITHOUT embedding fragile
   * template strings: the prose ships complete; the paid/free-text flow swaps
   * these points for the user's real answers. Empty ⇒ ships fully static.
   */
  slots?: Partial<Record<keyof Omit<Spine, "slots">, string>>;
}

/** A set of spines keyed by archetype id — one per variant (football, music…). */
export type SpineSet = Record<string, Spine>;
