/**
 * World Cup shortcut spines (Slice 1b) — the deterministic reusable LENS per
 * archetype (§6: selected by id, never LLM-classified). Authored to §21.
 *
 * BATCH 1 (this file, for review): the 5 highest-traffic verdicts —
 * maverick · firestarter · rock · iceman · equilibrist. The remaining 4
 * (maestro · engine · predator · glue) land in Batch 2; music spines after.
 *
 * Voice: roast the FAN, never the player (§3). Tells describe the USER's real
 * life behaviour (the quiz asks about weekends, groups, pressure) — light
 * football metaphor is fine, but the read is about them, not a footballer.
 */

import type { SpineSet } from "@/content/spine";

export const worldCupSpines: SpineSet = {
  // The Showman — flair-dominant, high-risk, lives for the highlight.
  maverick: {
    law: "If nobody saw it, it didn't count.",
    tells: [
      "You sandbag the easy version and swing for the impossible one when there's an audience.",
      "You'd rather be wrong in an interesting way than right in a boring one.",
      "You replay the one time the gamble landed and quietly file the five times it didn't.",
    ],
    reframe:
      "The risks people call reckless were never confidence — they're the toll you pay to be looked at.",
    split:
      "The audacity isn't the flaw — the audience is. Keep the nerve; stop auditioning for it.",
    closer:
      "You don't want to win. You want to be the reason it was worth watching.",
    slots: {
      reframe: "the answer where they chose the audacious / improvised option (flair proof)",
      tells: "their one-word vibe pick",
    },
  },

  // The Livewire — high intensity + flair, low composure, all emotion.
  firestarter: {
    law: "You feel it first and aim it later.",
    tells: [
      "You're either all the way in or already gone — there's no idle setting.",
      "You say the true thing in the heated moment and defend it once you've cooled down.",
      "When the energy in a room drops, you take it personally.",
    ],
    reframe:
      "The intensity people call 'too much' was never a temper — it's the only volume your caring comes in.",
    split:
      "Don't turn the fire down. Just stop letting whoever's nearest decide where it points.",
    closer: "You're not dramatic. You just refuse to feel anything quietly.",
    slots: {
      reframe: "their 'feed off pressure / get louder' proof answer",
      tells: "their highest-intensity pick",
    },
  },

  // The Colossus — low flair, high composure + teamplay, immovable.
  rock: {
    law: "You hold; everything else moves around you.",
    tells: [
      "You're the one people text when it's actually bad, not when it's fun.",
      "You read the room three seconds before it turns and quietly brace for it.",
      "You'd rather be the one who didn't panic than the one who got the credit.",
    ],
    reframe:
      "The calm everyone leans on was never a personality — it's a job you gave yourself so no one else had to.",
    split:
      "Being unshakeable is the gift. Being un-ask-able for help is the tax. Stop paying it.",
    closer: "Everyone's fine because you decided to be. Who decided you were?",
    slots: {
      reframe: "their 'stay calm / reliable' proof answer",
      tells: "their composure pick",
    },
  },

  // The Poacher — low workrate + intensity, high composure, clinical.
  iceman: {
    law: "You don't chase. You wait, then you take.",
    tells: [
      "You let other people exhaust themselves on the parts that don't matter.",
      "You go quiet in the chaos and move once, at the exact right second.",
      "People mistake your stillness for not caring. You let them.",
    ],
    reframe:
      "The patience isn't laziness — it's how you make sure the one effort you spend always lands.",
    split:
      "The efficiency is the edge. The cost is the people who needed you in the ninety minutes, not the ninetieth.",
    closer:
      "You ration yourself like the moment's always coming. Sometimes you ration through it.",
    slots: {
      reframe: "their 'pick the moment / go ice-cold' proof answer",
      tells: "their composure pick",
    },
  },

  // The Equilibrist — the named moderate type. Make balance a FLEX (the
  // indispensable connective tissue), with the real shadow named: loss of self.
  equilibrist: {
    law: "You become whatever the moment is missing.",
    tells: [
      "You read which role the room needs and quietly fill it before anyone asks.",
      "You don't have a hill to die on — you have whichever hill keeps everyone moving.",
      "People struggle to describe you in one word, and you've decided that's a win.",
    ],
    reframe:
      "Filling every role was never indecision — you'd rather the whole thing work than win your one part of it.",
    split:
      "You can play anywhere — that's the gift. The shadow: nobody knows what YOU'd pick if the room needed nothing. Pick something anyway.",
    closer:
      "You're not the player without a position. You're the one the others can't be missing.",
    slots: {
      reframe: "their 'keeps everyone together' / most-balanced proof answer",
      tells: "their teamplay or steady pick",
    },
  },
};
