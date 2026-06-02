/** Small shared helpers for URLs (used by the result page + OG metadata). */

/** Absolute origin, for server-side fetch and OG image URLs. */
export function baseUrl(): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export interface CardParams {
  format: "story" | "square" | "og";
  archetype: string;
  /** Archetype id — selects the line-art glyph. */
  archetypeId?: string;
  player: string;
  verdict?: string;
  traits?: string[];
  /** IP-safe design attributes: position (caption) + nationality colour key. */
  position?: string;
  nation?: string;
}

/** Build a /api/card URL (relative — works in <img> and as an absolute OG src). */
export function cardPath(p: CardParams): string {
  const q = new URLSearchParams({
    format: p.format,
    archetype: p.archetype,
    player: p.player,
  });
  if (p.archetypeId) q.set("arch", p.archetypeId);
  if (p.verdict) q.set("v", p.verdict);
  if (p.traits?.length) q.set("t", p.traits.join(","));
  if (p.position) q.set("pos", p.position);
  if (p.nation) q.set("nat", p.nation);
  return `/api/card?${q.toString()}`;
}
