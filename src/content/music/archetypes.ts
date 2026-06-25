/**
 * Music archetypes — named vibe types assigned by nearest centroid (§16.F).
 * Vectors are [0,1] percentile targets on [energy, regulation, rumination,
 * openness, reflective, extraversion]. Each archetype owns a THEME (§16.E: the
 * §5/§7 theme enum is reserved for the music card) — deterministic, designed
 * pairing, NOT model-chosen, so cards stay identical per verdict (§6).
 */

import type { CentroidSet } from "@/engine";
import type { Theme } from "@/llm/schema";

export const ARCHETYPE_THEMES: Record<string, Theme> = {
  velvet_cynic: "midnight",
  main_character: "neon",
  deep_diver: "static",
  time_capsule: "ember",
  maximalist: "neon",
  mood_engineer: "static",
  aux_tyrant: "bloom",
  catharsis_chaser: "bloom",
  easy_listener: "ember",
  escape_artist: "midnight",
  omnivore: "static", // the balanced/centre type → silver lane (build log §27)
};

export const musicArchetypes: CentroidSet = {
  id: "music-archetypes-v1",
  centroids: [
    {
      id: "velvet_cynic",
      label: "The Velvet Cynic",
      vector: { energy: 0.36, regulation: 0.4, rumination: 0.78, openness: 0.68, reflective: 0.78, extraversion: 0.26 },
      tags: ["overfeels elegantly", "lyric-first", "allergic to crowds"],
    },
    {
      id: "main_character",
      label: "The Main Character",
      vector: { energy: 0.78, regulation: 0.52, rumination: 0.26, openness: 0.4, reflective: 0.3, extraversion: 0.78 },
      tags: ["life is a montage", "loud in public", "skip-button optimist"],
    },
    {
      id: "deep_diver",
      label: "The Deep Diver",
      vector: { energy: 0.46, regulation: 0.38, rumination: 0.55, openness: 0.82, reflective: 0.66, extraversion: 0.3 },
      tags: ["rabbit-hole resident", "liner-notes literate", "quietly snobby"],
    },
    {
      id: "time_capsule",
      label: "The Time Capsule",
      vector: { energy: 0.42, regulation: 0.32, rumination: 0.66, openness: 0.2, reflective: 0.54, extraversion: 0.38 },
      tags: ["nostalgia loops", "2014 never ended", "comfort replays"],
    },
    {
      id: "maximalist",
      label: "The Maximalist",
      vector: { energy: 0.8, regulation: 0.64, rumination: 0.34, openness: 0.66, reflective: 0.32, extraversion: 0.6 },
      tags: ["volume as a lifestyle", "more is more", "festival circadian rhythm"],
    },
    {
      id: "mood_engineer",
      label: "The Mood Engineer",
      vector: { energy: 0.54, regulation: 0.82, rumination: 0.3, openness: 0.5, reflective: 0.42, extraversion: 0.46 },
      tags: ["playlists as medication", "DJ of their own brain", "a mood per playlist"],
    },
    {
      id: "aux_tyrant",
      label: "The Aux Tyrant",
      vector: { energy: 0.58, regulation: 0.5, rumination: 0.36, openness: 0.72, reflective: 0.5, extraversion: 0.76 },
      tags: ["curates aggressively", "taste evangelist", "benevolent dictator of the queue"],
    },
    {
      id: "catharsis_chaser",
      label: "The Catharsis Chaser",
      vector: { energy: 0.68, regulation: 0.56, rumination: 0.64, openness: 0.56, reflective: 0.8, extraversion: 0.36 },
      tags: ["screams lyrics, feels better", "sad bangers only", "emotional cardio"],
    },
    {
      id: "easy_listener",
      label: "The Easy Listener",
      vector: { energy: 0.36, regulation: 0.22, rumination: 0.18, openness: 0.22, reflective: 0.26, extraversion: 0.5 },
      tags: ["no skips, no stakes", "background-music citizen", "peace over edge"],
    },
    {
      id: "escape_artist",
      label: "The Escape Artist",
      vector: { energy: 0.58, regulation: 0.74, rumination: 0.5, openness: 0.54, reflective: 0.46, extraversion: 0.22 },
      tags: ["drowns the world politely", "headphones = boundary", "disappears mid-party"],
    },
    {
      // The named moderate type (§16.F / Slice 1) for music: no dominant mode,
      // no genre loyalty — genuinely takes the temperature of the room and
      // becomes it. Sits at the centre so the most BALANCED taste gets a real,
      // share-worthy verdict (a kept instrument, not "average"). Label is
      // provisional — finalised for §21 voice in 1b.
      id: "omnivore",
      label: "The Omnivore",
      vector: { energy: 0.5, regulation: 0.5, rumination: 0.5, openness: 0.55, reflective: 0.5, extraversion: 0.5 },
      tags: ["no genre loyalty", "everything in rotation", "a different mode every day"],
    },
  ],
};
