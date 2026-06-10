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
};

export const musicArchetypes: CentroidSet = {
  id: "music-archetypes-v1",
  centroids: [
    {
      id: "velvet_cynic",
      label: "The Velvet Cynic",
      vector: { energy: 0.3, regulation: 0.35, rumination: 0.9, openness: 0.75, reflective: 0.9, extraversion: 0.15 },
      tags: ["overfeels elegantly", "lyric-first", "allergic to crowds"],
    },
    {
      id: "main_character",
      label: "The Main Character",
      vector: { energy: 0.9, regulation: 0.55, rumination: 0.15, openness: 0.35, reflective: 0.2, extraversion: 0.9 },
      tags: ["life is a montage", "loud in public", "skip-button optimist"],
    },
    {
      id: "deep_diver",
      label: "The Deep Diver",
      vector: { energy: 0.45, regulation: 0.3, rumination: 0.55, openness: 0.95, reflective: 0.7, extraversion: 0.2 },
      tags: ["rabbit-hole resident", "liner-notes literate", "quietly snobby"],
    },
    {
      id: "time_capsule",
      label: "The Time Capsule",
      vector: { energy: 0.4, regulation: 0.25, rumination: 0.7, openness: 0.08, reflective: 0.55, extraversion: 0.35 },
      tags: ["nostalgia loops", "2014 never ended", "comfort replays"],
    },
    {
      id: "maximalist",
      label: "The Maximalist",
      vector: { energy: 0.95, regulation: 0.7, rumination: 0.3, openness: 0.7, reflective: 0.25, extraversion: 0.65 },
      tags: ["volume as a lifestyle", "more is more", "festival circadian rhythm"],
    },
    {
      id: "mood_engineer",
      label: "The Mood Engineer",
      vector: { energy: 0.55, regulation: 0.95, rumination: 0.2, openness: 0.5, reflective: 0.4, extraversion: 0.45 },
      tags: ["playlists as medication", "DJ of their own brain", "a mood per playlist"],
    },
    {
      id: "aux_tyrant",
      label: "The Aux Tyrant",
      vector: { energy: 0.6, regulation: 0.5, rumination: 0.3, openness: 0.8, reflective: 0.5, extraversion: 0.85 },
      tags: ["curates aggressively", "taste evangelist", "benevolent dictator of the queue"],
    },
    {
      id: "catharsis_chaser",
      label: "The Catharsis Chaser",
      vector: { energy: 0.7, regulation: 0.6, rumination: 0.6, openness: 0.6, reflective: 0.8, extraversion: 0.35 },
      tags: ["screams lyrics, feels better", "sad bangers only", "emotional cardio"],
    },
    {
      id: "easy_listener",
      label: "The Easy Listener",
      vector: { energy: 0.35, regulation: 0.15, rumination: 0.1, openness: 0.15, reflective: 0.2, extraversion: 0.5 },
      tags: ["no skips, no stakes", "background-music citizen", "peace over edge"],
    },
    {
      id: "escape_artist",
      label: "The Escape Artist",
      vector: { energy: 0.6, regulation: 0.85, rumination: 0.5, openness: 0.55, reflective: 0.45, extraversion: 0.1 },
      tags: ["drowns the world politely", "headphones = boundary", "disappears mid-party"],
    },
  ],
};
