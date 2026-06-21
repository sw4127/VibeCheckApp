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

/**
 * BRIGHT daytime stage (a clean light surface so the vivid bands read as one
 * intentional poster — no "late-night" blue mood clashing with the frame).
 */
export const SHEET = "#E6E6DD"; // light warm-grey stage (white tiles pop on it)
export const INK = "#15171C"; // primary text on the bright stage
export const INK_MUTED = "#5B6573"; // secondary text
export const CARD_BG = "#FFFFFF"; // raised option tiles
export const CARD_BORDER = "rgba(0,0,0,0.09)";
export const TRACK = "rgba(0,0,0,0.08)"; // progress / forming track on light

export type MotifKey = "maple" | "star" | "solar";

/**
 * The quiz path is segmented across the three hosts as the user progresses; the
 * phase owns an accent + premium motif (the country NAME is intentionally not
 * shown — it read as misplaced). Accents are deep enough to read on the bright
 * stage (used on graphics: motif, progress, borders). 7 Qs → 1–2 · 3–5 · 6–7.
 */
export interface Phase {
  name: string;
  accent: string;
  /** Accent hue (deg) — seeds the whole ambient field so it rotates per phase. */
  hue: number;
  motif: MotifKey;
}
export const PHASES: Phase[] = [
  { name: "CANADA", accent: "#E11D48", hue: 345, motif: "maple" }, // crimson
  { name: "USA", accent: "#2540D9", hue: 226, motif: "star" }, //     royal
  { name: "MEXICO", accent: "#0E9E63", hue: 154, motif: "solar" }, //  emerald
];
export function phaseFor(step: number): Phase {
  if (step <= 1) return PHASES[0];
  if (step <= 4) return PHASES[1];
  return PHASES[2];
}

/**
 * Forming-signature bars are MULTI-DIMENSIONAL (distinct simultaneous data
 * axes) → each bar gets its own colour for a dense, algorithmic-looking
 * signature. Deeper official-family tones (not raw volt/sky) so every bar reads
 * on the BRIGHT stage. (The linear progress bar stays single-toned — page.tsx.)
 */
export const FORMING_COLORS = ["#0E9E63", "#FF7A18", "#E11D48", "#2540D9", "#16A6C9"] as const;

