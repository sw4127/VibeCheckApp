/** Small shared helpers for URLs (used by the result page + OG metadata). */

/**
 * Absolute origin, for server-side fetch and OG image URLs.
 *
 * Order matters for the share loop (§16): OG-image URLs MUST resolve to a
 * public, stable host or social-unfurl bots get a blank preview.
 *  1. NEXT_PUBLIC_BASE_URL — explicit override (a custom domain, or the
 *     project's .vercel.app alias). Always wins.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's STABLE production alias (e.g.
 *     vibe-check-app-sepia.vercel.app). Public and unchanging across deploys.
 *  3. VERCEL_URL — the per-deploy URL. Last resort: it changes every deploy
 *     AND is behind deployment protection (returns 401 to unfurl bots), so
 *     cards shared from here render no preview. Avoid relying on it.
 */
export function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  const trimmed = raw.replace(/\/+$/, "");
  // Tolerate a scheme-less value (common Vercel misconfig: setting
  // NEXT_PUBLIC_BASE_URL to "host.vercel.app" without https://). Scheme-less
  // origins produce RELATIVE OG-image URLs (social unfurl → doubled host →
  // broken preview) and invalid Stripe success/cancel URLs. Force a scheme.
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export interface CardParams {
  format: "story" | "square" | "og";
  archetype: string;
  /** "music" hides the player block and uses the theme accent (§16.E). */
  mode?: "music";
  /** Music theme (ember|midnight|neon|bloom|static) → accent colour. */
  theme?: string;
  /** "paid" = the §20.B5 collector card ("THE FULL READ" wordmark). */
  tier?: "paid";
  player?: string;
  verdict?: string;
  traits?: string[];
  /** IP-safe design attributes: position (caption) + nationality colour key. */
  position?: string;
  nation?: string;
  /** Five axis percentiles [0,1] (fixed dimension order) → vibe-signature bars. */
  signature?: number[];
  /** Top ranked labelled rows (label + 0–100) → the labelled card signature. */
  sigRows?: { label: string; value: number }[];
  /** Whole-percent rarity → "X% share your vibe" spark. */
  rarity?: number;
}

/** Build a /api/card URL (relative — works in <img> and as an absolute OG src). */
export function cardPath(p: CardParams): string {
  const q = new URLSearchParams({
    format: p.format,
    archetype: p.archetype,
  });
  if (p.player) q.set("player", p.player);
  if (p.mode) q.set("mode", p.mode);
  if (p.theme) q.set("theme", p.theme);
  if (p.tier) q.set("tier", p.tier);
  if (p.verdict) q.set("v", p.verdict);
  if (p.traits?.length) q.set("t", p.traits.join(","));
  if (p.position) q.set("pos", p.position);
  if (p.nation) q.set("nat", p.nation);
  if (p.signature?.length) q.set("sig", p.signature.map((v) => Math.round(v * 100)).join(","));
  if (p.sigRows?.length)
    q.set("sigr", p.sigRows.slice(0, 3).map((r) => `${r.label}:${r.value}`).join("|"));
  if (p.rarity !== undefined) q.set("rar", String(p.rarity));
  return `/api/card?${q.toString()}`;
}
