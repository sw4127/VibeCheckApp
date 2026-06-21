/**
 * §Tournament-skin (2026) — SEASONAL + STRICTLY DECOUPLED.
 *
 * Scoped to the football quiz (`/quiz`). Nothing in the core music app imports
 * this; it touches NO global tokens (globals.css `--accent` stays brand violet).
 * Deprecate after the tournament: flip TOURNAMENT_SKIN to `false`, or delete
 * this file + motifs.tsx + TournamentSkin.tsx and their imports in page.tsx.
 *
 * This is NOT the moody music quiz — it's a high-energy premium tournament drop.
 * The single-accent Design-Bar rule is INTENTIONALLY overridden here (PM call):
 * a real host-nation palette, green foundation + energetic host accents.
 *
 * IP-safe (§3 / §5 / §13.D): host nations evoked by colour + ABSTRACT geometric
 * motifs (a stylized maple leaf, stars, a sunburst) — no flags, no coats of arms
 * (notably NOT Mexico's legally-restricted eagle), no "World Cup"/"FIFA".
 */

/** One-line kill switch for the whole seasonal layer. */
export const TOURNAMENT_SKIN = true;

/**
 * Intentional 2026 host palette. Field green = the FOUNDATION (the pitch); USA
 * blue brings authority, energetic red + warm orange bring the drop energy.
 * Colour identity only — never a flag reproduction.
 */
export const HOST = {
  green: "#1FC56B",
  blue: "#2F6BFF",
  red: "#FF3B47",
  orange: "#FF9F1C",
} as const;

/** Pitch-at-night foundation + structural frame (scoped to /quiz only). */
export const PITCH_BG = "#07140D";
export const FRAME = "rgba(31,197,107,0.30)";

/**
 * Per-question energy: green is the constant identity; the ACTIVE accent rotates
 * through the host palette so each question lands like a fresh fixture. One
 * vivid accent per screen still — the rotation lives across the flow.
 */
export const QUESTION_ACCENTS = [HOST.green, HOST.blue, HOST.red, HOST.orange] as const;
export function questionAccent(step: number): string {
  return QUESTION_ACCENTS[step % QUESTION_ACCENTS.length];
}

/** 7-segment scoreboard progress — a host gradient across the whole run. */
export const SEGMENT_COLORS = [
  HOST.green, HOST.green, HOST.blue, HOST.blue, HOST.red, HOST.red, HOST.orange,
] as const;
