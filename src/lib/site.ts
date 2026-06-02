/** Small shared helpers for URLs (used by the result page + OG metadata). */
import type { Theme } from "@/llm";

/** Absolute origin, for server-side fetch and OG image URLs. */
export function baseUrl(): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export interface CardParams {
  format: "story" | "square" | "og";
  theme: Theme;
  archetype: string;
  player: string;
  verdict?: string;
  traits?: string[];
}

/** Build a /api/card URL (relative — works in <img> and as an absolute OG src). */
export function cardPath(p: CardParams): string {
  const q = new URLSearchParams({
    format: p.format,
    theme: p.theme,
    archetype: p.archetype,
    player: p.player,
  });
  if (p.verdict) q.set("v", p.verdict);
  if (p.traits?.length) q.set("t", p.traits.join(","));
  return `/api/card?${q.toString()}`;
}
