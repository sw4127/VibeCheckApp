/**
 * World Cup shortcut spines (Slice 1b) — the deterministic reusable LENS per
 * archetype (§6: selected by id, never LLM-classified). Authored to §21.
 *
 * BATCH 1: the 5 highest-traffic verdicts — maverick · firestarter · rock ·
 * iceman · equilibrist. BATCH 2: maestro · engine · predator · glue. Together
 * they cover all 9 reachable football archetypes (asserted in the test).
 * Music spines come next.
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

  // --- Batch 2 -------------------------------------------------------------

  // The Metronome — sets tempo, sees it early, the quiet controller.
  maestro: {
    law: "You set the tempo nobody notices you setting.",
    tells: [
      "You see where it's going three moves early and quietly steer it there.",
      "You'd rather be the reason it worked than the name on it.",
      "When a plan starts to wobble, people look at you before they say anything.",
    ],
    reframe:
      "The control was never about being in charge — it's that chaos costs you more than it costs everyone else.",
    split:
      "Reading the game early is the gift. Refusing to play until you've solved it is the tax. Sometimes you just pass it.",
    closer:
      "The whole thing moved at your speed and nobody clocked it. That was the point.",
    slots: {
      reframe: "their 'one good plan / sees it early' proof answer",
      tells: "their composure or flair pick",
    },
  },

  // The Engine — relentless, box-to-box, outlasts everyone.
  engine: {
    law: "You don't outrun them. You outlast them.",
    tells: [
      "You're still going long after the people who started louder have sat down.",
      "You'd rather do the boring rep a hundred times than find the clever shortcut once.",
      "You measure a day by how tired you earned the right to be.",
    ],
    reframe:
      "You call it discipline. It's quieter than that — motion is how you stay ahead of the thoughts that wait for you to stop.",
    split:
      "The motor is the gift. Mistaking motion for worth is the tax. You're allowed to be enough sitting still.",
    closer:
      "You'll outwork everyone in the room. Nobody will think to ask if you wanted to be in it.",
    slots: {
      reframe: "their 'grind it out / packed day' proof answer",
      tells: "their workrate pick",
    },
  },

  // The Predator — self-driven, ruthless about the outcome, low teamplay.
  predator: {
    law: "You decide what you want, then you take it.",
    tells: [
      "You're friendly right up until something you want is on the table.",
      "You keep score in games other people don't know they're playing.",
      "You've gone quiet and let someone talk themselves out of the thing you wanted.",
    ],
    reframe:
      "The hunger was never ego — you learned early that nobody hands you the thing, so you stopped waiting to be handed it.",
    split:
      "The focus is the weapon. The cost is the people who were teammates, not obstacles. Learn the difference before you need them.",
    closer:
      "You don't lose often. You just sometimes win things you never checked were worth taking.",
    slots: {
      reframe: "their 'takes over / carries it' proof answer",
      tells: "their intensity pick",
    },
  },

  // The Anchor — selfless, does the thankless work, holds the group.
  glue: {
    law: "You do the work that doesn't get a name.",
    tells: [
      "You notice who's gone quiet in the group chat before anyone else does.",
      "You do the unglamorous half of the plan so someone else can do the fun half.",
      "You've held a group together and let them think it held itself.",
    ],
    reframe:
      "Kindness is the cover story. Underneath it: being needed is the safest way you know to be kept.",
    split:
      "Holding it together is the gift. Disappearing inside the group is the tax. They'd keep you even if you stopped earning it.",
    closer:
      "Take yourself off the team sheet for one weekend. Watch how fast they notice.",
    slots: {
      reframe: "their 'keeps everyone together / does the dirty work' proof answer",
      tells: "their workrate or teamplay pick",
    },
  },
};
