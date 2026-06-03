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
  player: string;
  verdict?: string;
  traits?: string[];
  /** IP-safe design attributes: position (caption) + nationality colour key. */
  position?: string;
  nation?: string;
  /** Five axis percentiles [0,1] (fixed dimension order) → vibe-signature bars. */
  signature?: number[];
  /** Whole-percent rarity → "X% share your vibe" spark. */
  rarity?: number;
}

/** Build a /api/card URL (relative — works in <img> and as an absolute OG src). */
export function cardPath(p: CardParams): string {
  const q = new URLSearchParams({
    format: p.format,
    archetype: p.archetype,
    player: p.player,
  });
  if (p.verdict) q.set("v", p.verdict);
  if (p.traits?.length) q.set("t", p.traits.join(","));
  if (p.position) q.set("pos", p.position);
  if (p.nation) q.set("nat", p.nation);
  if (p.signature?.length) q.set("sig", p.signature.map((v) => Math.round(v * 100)).join(","));
  if (p.rarity !== undefined) q.set("rar", String(p.rarity));
  return `/api/card?${q.toString()}`;
}
