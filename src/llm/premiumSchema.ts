/**
 * Enum-locked schema for the PAID premium report (spec §7 `premium_report`).
 * Validated after generation; anything off-schema falls back to a deterministic
 * in-character report so the paywalled view never renders broken.
 */
import { z } from "zod";

export const LEVELS = ["High", "Medium", "Low"] as const;
export type Level = (typeof LEVELS)[number];

const bigFiveItem = z.object({
  trait: z.string(),
  level: z.enum(LEVELS),
  line: z.string(),
});

export const premiumReportSchema = z.object({
  archetype: z.string(),
  diagnosis: z.object({
    summary: z.string(),
    big_five: z.array(bigFiveItem).length(5),
    attachment_style: z.object({ style: z.string(), line: z.string() }),
  }),
  red_flags: z.array(z.string()).min(2),
  prescription: z.object({
    intro: z.string(),
    picks: z.array(z.object({ pick: z.string(), why: z.string() })).min(2),
    world_cup_pairing: z.string(),
  }),
  closer: z.string(),
});

export type PremiumReport = z.infer<typeof premiumReportSchema>;
