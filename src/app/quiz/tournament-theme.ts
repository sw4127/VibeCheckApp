/**
 * §Tournament-skin (2026) — SEASONAL + STRICTLY DECOUPLED.
 *
 * Scoped to the football quiz (`/quiz`) only. Nothing in the core music app
 * imports this; it touches NO global tokens (globals.css `--accent` stays the
 * brand violet that landing/music/result rely on). To deprecate after the
 * tournament: flip TOURNAMENT_SKIN to `false` (kills the decorative layer and
 * reverts to the plain accent), or delete this file + TournamentSkin.tsx and
 * their two imports in page.tsx. Zero refactoring of shared architecture.
 *
 * IP-safe (§3 / §5 / §13.D): the three host nations are evoked by GENERIC SPORT
 * COLOURS and ABSTRACT motifs only — no flags, no coats of arms (notably NOT
 * Mexico's legally-restricted eagle/Escudo), no emblems, no "World Cup"/"FIFA".
 */

/** One-line kill switch for the seasonal layer. */
export const TOURNAMENT_SKIN = true;

/** Generic energetic sport colours — a tri-host nod via colour, never symbols. */
export const HOST = {
  green: "#2bd46a", // field
  blue: "#3d7bff", // host blue
  red: "#ff4d5e", // energy
  gold: "#ffc24d", // strike / highlight
} as const;

/**
 * Per-question focal accent. Multi-colour ACROSS the flow (tri-host energy) but
 * ONE accent per SCREEN — so the Design-Bar "single focal accent" rule still
 * holds on any given question. Each question lights up like a different fixture.
 */
export const QUESTION_ACCENTS = [HOST.green, HOST.blue, HOST.red, HOST.gold] as const;
export function questionAccent(step: number): string {
  return QUESTION_ACCENTS[step % QUESTION_ACCENTS.length];
}

/** The hero tri-host device: a left→right gradient that fills as you progress. */
export const TOURNAMENT_PROGRESS = `linear-gradient(90deg, ${HOST.green}, ${HOST.blue}, ${HOST.red})`;

/** Stable per-bar colours for the in-quiz "stat line forming" teaser. */
export const BAR_COLORS = [HOST.green, HOST.blue, HOST.red, HOST.gold, HOST.green] as const;
