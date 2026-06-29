/**
 * Music shortcut spines (Slice 1b) — the deterministic reusable LENS per music
 * archetype (§6: selected by id, never LLM-classified). Authored to §21.
 *
 * BATCH 1: the 6 highest-traffic verdicts + the new moderate type —
 * time_capsule · aux_tyrant · mood_engineer · catharsis_chaser · deep_diver ·
 * omnivore. BATCH 2: escape_artist · easy_listener · main_character ·
 * maximalist · velvet_cynic. Together they cover all 11 reachable music
 * archetypes (asserted in the test).
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
      "A playlist isn't a mood — it's a thermostat. You'd rather schedule a feeling than be ambushed by one; the ones that arrive are the ones that have reached you.",
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
      "Most people skip the sad ones. You chase them — they're the one place you let the feeling all the way out before it goes stale.",
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
      "Liking a bit of everything isn't a missing opinion — a taste with hard edges can be predicted, and you'd rather not be.",
    split:
      "The range is the gift. Having no song that's unmistakably yours is the tax. Pick one nobody would guess. Let it be yours.",
    closer: "You're not the person without a taste. You're the one who never got boxed.",
    slots: {
      reframe: "two clashing {artist}s that surprise people",
      tells: "their most genre-crossing pick",
    },
  },

  // --- Batch 2 -------------------------------------------------------------

  // The Escape Artist — music as a wall/boundary, disappears, low extraversion.
  escape_artist: {
    law: "Headphones in means the door is closed.",
    tells: [
      "You put headphones on to make a room stop being a room.",
      "You've left a party early and felt relief the second the music was yours again.",
      "Your most honest hours happen with the volume up and nobody around.",
    ],
    reframe:
      "The headphones aren't antisocial. They're the one wall thin enough to feel safe behind, solid enough to keep the rest out.",
    split:
      "The escape is the gift. Mistaking the exit for a home is the tax. You can come back — the door wasn't locked from the outside.",
    closer: "The party's still happening. You're just attending it from behind the glass.",
    slots: {
      reframe: "{artist} they retreat into",
      tells: "their 'drowning the world out' pick",
    },
  },

  // The Easy Listener — low-stakes, background, peace over edge.
  easy_listener: {
    law: "You'd rather it be pleasant than important.",
    tells: [
      "You let an album end and don't reach for the next thing.",
      "You can't name the last song that ruined or rescued your day, and that's the point.",
      "You pick the playlist that asks the least of you.",
    ],
    reframe:
      "You're not indifferent. You decided early which things get to move you, and music didn't make the cut — by choice.",
    split:
      "The ease is the gift. Never letting anything in is the tax. One song, once, all the way up — see if you miss it after.",
    closer:
      "Everyone's hunting for the song that changes everything. You already decided nothing has to.",
    slots: {
      reframe: "their 'calm / background' pick",
      tells: "their 'no skips' pick",
    },
  },

  // The Main Character — soundtracks life, performative, skip-button optimist.
  main_character: {
    law: "Every walk is a scene. Every song scores it.",
    tells: [
      "You've queued a song to match a moment that hadn't happened yet.",
      "You skip the second a song stops earning its place in the montage.",
      "Your music sounds best when you can picture someone watching you to it.",
    ],
    reframe:
      "Scoring your life isn't vanity. An ordinary Tuesday needs a reason to count, and you give it one.",
    split:
      "The momentum is the gift. Needing an audience for the scene is the tax. The walk's still good when nobody's filming.",
    closer:
      "You're the main character. The quiet question is who you're performing the soundtrack for.",
    slots: {
      reframe: "their 'bright + loud / main-character energy' pick",
      tells: "{artist} that scores their entrance",
    },
  },

  // The Maximalist — volume as a lifestyle, more is more, drowns the quiet.
  maximalist: {
    law: "If it's worth playing, it's worth too loud.",
    tells: [
      "You turn it up past 'good' to 'felt in your chest'.",
      "A song with empty space makes you reach to fill it.",
      "You'd take the overwhelming version over the tasteful one every time.",
    ],
    reframe:
      "It's not that you can't do subtle. Quiet is where the thinking starts, and you'd rather feel than think for a while.",
    split:
      "The intensity is the gift. Drowning out the quiet is the tax. Some things only say it once, and softly — don't miss them.",
    closer:
      "At full volume there's no room for the day, the thought, or the doubt. That's the point.",
    slots: {
      reframe: "their 'heavy + intense / feel-everything volume' pick",
      tells: "{artist} they max the volume for",
    },
  },

  // The Velvet Cynic — overfeels elegantly, lyric-first, guards the feeling.
  velvet_cynic: {
    law: "You feel everything and admit to none of it.",
    tells: [
      "You've replayed one line until it stopped being a lyric and started being evidence.",
      "You feel things at a depth you'd never say out loud, then make a joke about it.",
      "You trust a sad song more than the person who'd ask if you're okay.",
    ],
    reframe:
      "The detachment isn't coldness. You feel too much to leave it unguarded, so you dress it in someone else's words.",
    split:
      "The depth is the gift. Outsourcing every feeling to a lyricist is the tax. At some point the words have to be yours.",
    closer: "You don't relate to the song. You let it say the thing so you never have to.",
    slots: {
      reframe: "{artist} whose lyrics they hide behind",
      tells: "their 'turn it up and sit in it' pick",
    },
  },
};
