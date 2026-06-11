/**
 * Premium report v2 schema (spec §20.B — supersedes the §7 v1 shape).
 * Depth = receipts, not paragraphs: the LATELY/ALWAYS Split is the centerpiece,
 * the Diagnosis is signal-only (Medium traits collapse into one honest line),
 * every Red Flag carries a receipt. Enum-locked + length-capped via §21.C
 * budgets (described to the model; enforced by anchoring + caps).
 * `protocol` (§20.B4) is Slice 3 — schema reserves the slot as optional.
 */
import { z } from "zod";

export const LEVELS = ["High", "Medium", "Low"] as const;
export type Level = (typeof LEVELS)[number];

const traitItem = z.object({
  trait: z.string(),
  level: z.enum(LEVELS),
  line: z.string(),
});

export const premiumReportSchema = z.object({
  archetype: z.string(),
  split: z.object({
    lately: z.object({ headline: z.string(), lines: z.array(z.string()).min(2) }),
    always: z.object({ headline: z.string(), lines: z.array(z.string()).min(2) }),
    verdict: z.string(),
  }),
  diagnosis: z.object({
    summary: z.string(),
    traits: z.array(traitItem),
    /** The honest collapse of unmeasured/Medium traits ("the rest reads steady"). */
    steady_line: z.string(),
    attachment_style: z.object({ style: z.string(), line: z.string() }),
  }),
  red_flags: z
    .array(z.object({ flag: z.string(), receipt: z.string() }))
    .min(2),
  prescription: z.object({
    intro: z.string(),
    picks: z.array(z.object({ pick: z.string(), why: z.string() })).min(2),
    pairing: z.string(),
    protocol: z
      .object({ title: z.string(), days: z.array(z.string()) })
      .optional(),
  }),
  closer: z.string(),
});

export type PremiumReport = z.infer<typeof premiumReportSchema>;
