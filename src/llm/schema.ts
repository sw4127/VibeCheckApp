/**
 * Enum-locked output schema for the World Cup reading (spec §6 "enum-lock").
 * Validated client-side after generation; anything off-schema falls back to a
 * deterministic in-character reading rather than rendering a broken card.
 */
import { z } from "zod";

export const THEMES = ["ember", "midnight", "neon", "bloom", "static"] as const;
export type Theme = (typeof THEMES)[number];

export const worldCupReadingSchema = z.object({
  archetype: z.string(),
  player: z.string(),
  verdict: z.string(),
  // Server-side JSON-schema can't enforce array length; we keep it lenient here
  // and trim to three in post-processing so a 2- or 4-tag reply still renders.
  shared_traits: z.array(z.string()).min(2),
  theme: z.enum(THEMES),
  teaser: z.string(),
});

export type WorldCupReading = z.infer<typeof worldCupReadingSchema>;
