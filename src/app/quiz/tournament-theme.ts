/**
 * §Tournament-skin (2026) — SEASONAL + STRICTLY DECOUPLED.
 *
 * Scoped to the football quiz (`/quiz`). Nothing in the core music app imports
 * this; it touches NO global tokens. Deprecate after the tournament: flip
 * TOURNAMENT_SKIN to `false`, or delete this file + motifs.tsx + TournamentSkin
 * and their imports in page.tsx.
 *
 * Palette is sampled from the official 2026 identity (concentric high-saturation
 * bands): volt green, emerald, vivid orange, crimson, sky blue, royal blue, gold.
 * IP-safe (§13.D): colour + abstract geometric motifs only — no flags, no coats
 * of arms (notably NOT Mexico's legally-restricted eagle), no "World Cup"/"FIFA".
 */

/** One-line kill switch for the whole seasonal layer. */
export const TOURNAMENT_SKIN = true;

/** Official-identity palette (sampled from the 2026 concentric-bands artwork). */
export const BRAND26 = {
  volt: "#B8FF3B",
  emerald: "#00A35E",
  orange: "#FF7A18",
  crimson: "#FF2E4C",
  sky: "#38C0FF",
  royal: "#2A3CD0",
  gold: "#FBBF3F",
} as const;

/** Deep-navy content sheet — rich, NOT pure black (the vivid bands carry colour). */
export const SHEET = "#0B1124";

export type MotifKey = "maple" | "star" | "solar";

/**
 * The quiz path is segmented across the three hosts as the user progresses.
 * Each phase owns a bright, legible accent (its nation's colour) and a premium
 * geometric motif. 7 questions → Canada (1–2) · USA (3–5) · Mexico (6–7).
 */
export interface Phase {
  name: string;
  accent: string;
  motif: MotifKey;
}
export const PHASES: Phase[] = [
  { name: "CANADA", accent: "#FF3B57", motif: "maple" }, // bright crimson
  { name: "USA", accent: "#4F74FF", motif: "star" }, //     bright royal
  { name: "MEXICO", accent: "#19D17A", motif: "solar" }, //  bright emerald
];
export function phaseFor(step: number): Phase {
  if (step <= 1) return PHASES[0];
  if (step <= 4) return PHASES[1];
  return PHASES[2];
}

/**
 * Forming-signature bars are MULTI-DIMENSIONAL (distinct simultaneous data
 * axes) → each bar gets its own official colour for a dense, algorithmic-looking
 * signature. (The linear progress bar stays single-toned — see page.tsx.)
 */
export const FORMING_COLORS = [
  BRAND26.volt, BRAND26.orange, BRAND26.crimson, BRAND26.sky, BRAND26.royal,
] as const;

/** Concentric band frame (outer→inner) — the official radiating-bands look. */
export const BAND_COLORS = [
  BRAND26.royal, BRAND26.sky, BRAND26.volt, BRAND26.emerald, BRAND26.orange, BRAND26.crimson,
] as const;
