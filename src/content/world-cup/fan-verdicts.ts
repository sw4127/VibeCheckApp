/**
 * Fan verdicts (Track A · A2) — the free `/fan-verdict` front-door tool.
 *
 * Given a roster player, a one-line VERDICT + a quotable LAW about what being
 * THEIR fan reveals about the USER. DETERMINISTIC and hand-authored ($0, no
 * model call): the roster is finite, so each verdict is a static, cache-forever
 * asset — and curated content keeps us safely on-roster (no roasting arbitrary
 * real people). Voice = the §21 spine register.
 *
 * GUARDRAIL (§3 / §13.D): roast the FAN's behaviour, never the real player.
 * Playing-style / public persona only; no protected attributes; no hedges.
 *
 * BATCH 1 (this file): the 6 iconic players. The remaining 25 land in review
 * batches (the resolver + route already work for any id with a verdict).
 */

import { worldCupRoster } from "./roster";

export interface FanVerdict {
  /** One sentence roasting the FAN (not the player). */
  verdict: string;
  /** A portable, quotable rule — 6–10 words. */
  law: string;
}

export const fanVerdicts: Record<string, FanVerdict> = {
  messi: {
    verdict:
      "You picked football's 'correct' answer and you'd like a little credit for your impeccable taste.",
    law: "Good taste isn't the same as a personality.",
  },
  ronaldo: {
    verdict:
      "You don't support a player, you defend a thesis — and you've muted group chats to keep doing it.",
    law: "Loyalty you have to argue isn't loyalty.",
  },
  mbappe: {
    verdict:
      "You backed the highlight reel and quietly skipped the seasons that didn't trend.",
    law: "You mistake being early for being right.",
  },
  haaland: {
    verdict:
      "You like your heroes the way you like spreadsheets: efficient and emotionally unavailable.",
    law: "You call being unmoved 'being objective'.",
  },
  bellingham: {
    verdict:
      "You found him at the perfect moment and have decided that was insight.",
    law: "You mistake good timing for good taste.",
  },
  yamal: {
    verdict:
      "You're already rehearsing the 'I liked him before you' speech for 2030.",
    law: "Calling it early is your whole personality.",
  },
};

/** Players that currently have a verdict, in roster order (for the picker). */
export const fanVerdictRoster = worldCupRoster.centroids
  .filter((c) => c.id in fanVerdicts)
  .map((c) => ({ id: c.id, label: c.label }));

/** Deterministic lookup (§6). Unknown id → undefined. */
export function fanVerdict(playerId: string): FanVerdict | undefined {
  return fanVerdicts[playerId];
}
