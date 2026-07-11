/**
 * Prestige-Bias verdict copy — shared by the flow, the share page, and the
 * card so the voice can never drift between surfaces. PM owns these words.
 *
 * VOICE-LOCKED FOR THE COHORT (2026-07-12): audited against
 * docs/voice-spec.md (the Examiner — tease the judgment, never the person;
 * every barb datum-anchored; intensity share > verdict/debrief > onboarding).
 * Contrarian line: PM ruled KEEP over the offered sharpen. Do not edit
 * cohort-visible strings here without a PM ruling; share-block copy may
 * iterate post-cohort (RT-4 scope).
 */
import type { BiasVerdict } from "@/engine/bias";

export const VERDICT_COPY: Record<BiasVerdict, { title: string; sub: string }> = {
  swayed: { title: "Label-driven.", sub: "When the names walked in, your standards left with them." },
  steady: { title: "Steady ears.", sub: "The reputations showed up. Your ratings barely looked up." },
  contrarian: { title: "Contrarian.", sub: "You heard the acclaim and docked points for it. Different bias — still a bias." },
};

/** The one-line share text next to the permalink. */
export function shareText(pct: number): string {
  return `My ratings moved ${pct > 0 ? "+" : ""}${pct}% when the famous names showed up. Get your number:`;
}
