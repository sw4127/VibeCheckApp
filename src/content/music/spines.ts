/**
 * Music shortcut spines (Slice 1b) — the deterministic reusable LENS per music
 * archetype (§6: selected by id, never LLM-classified). Authored to §21.
 *
 * BATCH 1 (this file, for review): the 6 highest-traffic verdicts + the new
 * moderate type — time_capsule · aux_tyrant · mood_engineer · catharsis_chaser ·
 * deep_diver · omnivore. BATCH 2: escape_artist · easy_listener · main_character ·
 * maximalist · velvet_cynic.
 *
 * Voice (§21): the read is about their TASTE and inner life, sharper and more
 * intimate than the football read. Tells describe real listening behaviour
 * (rotation, what music is FOR, how they handle a sad song). `{artist}` slots
 * are where slices 3/4 inject the user's typed artists (§18.B) — the §21.D
 * "artist receipt" move. The static prose ships complete on the free path ($0).
 */

import type { SpineSet } from "@/content/spine";

export const musicSpines: SpineSet = {
  // The Time Capsule — nostalgia loops, comfort replays, low openness.
  time_capsule: {
    law: "Old songs already earned what new ones haven't.",
    tells: [
      "Your most-played this year came out years ago, and you know exactly why.",
      "You go back to the same album the week things get hard.",
      "A new song has to survive a comparison it never agreed to.",
    ],
    reframe:
      "Replaying the old stuff was never nostalgia — it's proof you used to feel things at full volume, kept somewhere safe.",
    split:
      "The loyalty is the gift. Living in a year that already ended is the tax. The song's not the feeling — you are.",
    closer: "You didn't keep the playlist. You kept the version of you that made it.",
    slots: {
      reframe: "{artist} they keep returning to (durable artist)",
      tells: "their 'replaying old comforts' pick",
    },
  },

  // The Aux Tyrant — curates aggressively, taste evangelist, owns the queue.
  aux_tyrant: {
    law: "The queue is yours. Everyone else is visiting.",
    tells: [
      "You've physically taken someone's phone to fix what was playing.",
      "You feel a recommendation land like a small personal win.",
      "You can't relax in a room where someone else picks what plays next.",
    ],
    reframe:
      "Controlling the aux isn't about taste. The right song is the one thing in the room you can guarantee — so you guarantee it.",
    split:
      "The curation is the gift. Needing the room to like it back is the tax. Play the song; release the verdict.",
    closer: "You don't share music. You issue it, and wait to be thanked.",
    slots: {
      reframe: "{artist} they evangelize",
      tells: "their 'curating for others' pick",
    },
  },

  // The Mood Engineer — playlists as medication, manages the feeling.
  mood_engineer: {
    law: "You don't pick music. You prescribe it.",
    tells: [
      "You have a playlist for a feeling you haven't admitted to having.",
      "You change the song the second a mood threatens to take over.",
      "You build the playlist for the version of the day you've decided to have.",
    ],
    reframe:
      "Call it control-freakery if you want. Feeling something on purpose just beats feeling it by ambush, every time.",
    split:
      "The dosing is the gift. Never letting a song surprise you is the tax. Once, leave it on shuffle and see what finds you.",
    closer: "You've got a playlist for every mood but the one you're actually in.",
    slots: {
      reframe: "their 'change the mood / music as the fix' pick",
      tells: "{artist} on a specific mood playlist",
    },
  },

  // The Catharsis Chaser — sad bangers, emotional cardio, goes INTO it.
  catharsis_chaser: {
    law: "You use the saddest song to feel better.",
    tells: [
      "You put on the song that wrecks you when you need to actually cry.",
      "You treat a good cry like a workout — scheduled, then you feel lighter.",
      "You'd rather feel it all at once than let it leak out for weeks.",
    ],
    reframe:
      "Chasing the sad ones was never being dramatic — it's the only place you let the feeling all the way out before it goes stale.",
    split:
      "Metabolising it in three minutes is the gift. Needing a song's permission to feel is the tax. You can cry without a soundtrack.",
    closer: "Most people skip the song that hurts. You turn it up and call it healing.",
    slots: {
      reframe: "{artist} they go to for a good cry",
      tells: "their 'let it gut you' pick",
    },
  },

  // The Deep Diver — rabbit-hole, liner-notes literate, private discovery.
  deep_diver: {
    law: "If everyone's heard it, you've already moved on.",
    tells: [
      "You've followed a producer's credits down to three artists you now gatekeep.",
      "You feel a flicker of loss when something you found gets popular.",
      "You know the deep cut, the demo, and the reason the album flopped.",
    ],
    reframe:
      "It isn't snobbery. Finding it yourself is the part that makes it feel like it's actually yours.",
    split:
      "The depth is the gift. Mistaking obscurity for intimacy is the tax. A song doesn't love you back for getting there first.",
    closer:
      "You don't want the best song. You want the one nobody can take credit for showing you.",
    slots: {
      reframe: "{artist} they found early",
      tells: "their 'proudly nobody's-heard-of-it' pick",
    },
  },

  // The Omnivore — the named moderate type. Breadth as a FLEX; shadow = no
  // signature. Parallels football's equilibrist, worded distinctly for taste.
  omnivore: {
    law: "Whatever the day needs, that's what you play.",
    tells: [
      "Your rotation this week has nothing in common except you.",
      "You can sit through anyone's favourite genre and find one thing to keep.",
      "Asked your favourite artist, you give a different answer every time and mean all of them.",
    ],
    reframe:
      "Listening to everything isn't a missing opinion — every room has one song worth keeping, and you intend to find it.",
    split:
      "The range is the gift. Having no song that's unmistakably yours is the tax. Pick one nobody would guess. Let it be yours.",
    closer: "You're not the person without a taste. You're the one who never got boxed.",
    slots: {
      reframe: "two clashing {artist}s that surprise people",
      tells: "their most genre-crossing pick",
    },
  },
};
