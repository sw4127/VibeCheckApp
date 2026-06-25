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

  // --- Batch 2 (marquee) ---------------------------------------------------
  vinicius: {
    verdict:
      "You've called three different referees corrupt this season and you'd do it again.",
    law: "Everything is a conspiracy against your guy.",
  },
  debruyne: {
    verdict:
      "You think the assist is morally superior to the goal and bring it up unprompted.",
    law: "Underrated is your favourite word for everything.",
  },
  modric: {
    verdict:
      "You preface every point with 'at his age' like it's a personality trait.",
    law: "You mistake nostalgia for analysis, repeatedly.",
  },
  kane: {
    verdict:
      "You've built a whole identity around defending someone else's trophy cabinet.",
    law: "Stats are your coping mechanism, not an argument.",
  },
  saka: {
    verdict:
      "You treat criticism of him like a personal attack on your little brother.",
    law: "You adopted a stranger and got defensive.",
  },
  vandijk: {
    verdict:
      "You think appreciating a defender makes you smarter than everyone watching the striker.",
    law: "You confuse liking defence with having taste.",
  },
  griezmann: {
    verdict:
      "You measure devotion in kilometres covered and have decided that's depth.",
    law: "You call invisible work the real work.",
  },
  valverde: {
    verdict:
      "You respect anyone who never stops running, to a slightly worrying degree.",
    law: "You think tiredness is the same as value.",
  },
  rice: {
    verdict:
      "You defend a transfer fee like it came out of your own account.",
    law: "You'd die on a hill nobody's attacking.",
  },
  lautaro: {
    verdict:
      "You call him a warrior and mean it more than you've meant most things.",
    law: "You outsource your aggression to a striker.",
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
