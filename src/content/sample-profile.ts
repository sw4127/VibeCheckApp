/**
 * Premium-report input profiles. SAMPLE_PROFILES remain the Slice-0 fallback /
 * direct-visit path; real users arrive via the stateless premium token built
 * from the music engine (§17.B).
 *
 * v2 (§20.B): `stateLevels` carries the STATE lane (recent/mood) so the Split's
 * LATELY column narrates engine-computed levels — never LLM judgment.
 */
import type { Level } from "@/llm/premiumSchema";

export type StateLevels = {
  energy: Level;
  regulation: Level;
  rumination: Level;
};

export interface PremiumProfile {
  /** Stable key for caching the narration by input. */
  id: string;
  archetype: string;
  bigFive: { trait: string; level: Level }[];
  attachmentStyle: string;
  /** Current-emotion descriptor from the state lane (legacy/back-compat line). */
  stateLine: string;
  /** STATE-lane levels (§17.B). Optional: p1 tokens / legacy callers omit it. */
  stateLevels?: StateLevels;
  artistsRecent: string[];
  artistsDurable: string[];
}

export const SAMPLE_PROFILES: Record<string, PremiumProfile> = {
  velvet_cynic: {
    id: "velvet_cynic",
    archetype: "The Velvet Cynic",
    bigFive: [
      { trait: "Openness", level: "High" },
      { trait: "Conscientiousness", level: "Low" },
      { trait: "Extraversion", level: "Low" },
      { trait: "Agreeableness", level: "Medium" },
      { trait: "Neuroticism", level: "High" },
    ],
    attachmentStyle: "Anxious-Preoccupied",
    stateLine: "running on low-grade dread and 1am replays",
    stateLevels: { energy: "Low", regulation: "Low", rumination: "High" },
    artistsRecent: ["Phoebe Bridgers", "Frank Ocean", "Steely Dan"],
    artistsDurable: ["Radiohead"],
  },
  hype_populist: {
    id: "hype_populist",
    archetype: "The Main Character",
    bigFive: [
      { trait: "Openness", level: "Low" },
      { trait: "Conscientiousness", level: "Medium" },
      { trait: "Extraversion", level: "High" },
      { trait: "Agreeableness", level: "High" },
      { trait: "Neuroticism", level: "Low" },
    ],
    attachmentStyle: "Secure",
    stateLine: "riding a hype high, soundtracking the group chat",
    stateLevels: { energy: "High", regulation: "Medium", rumination: "Low" },
    artistsRecent: ["Taylor Swift", "Drake", "Dua Lipa"],
    artistsDurable: ["Beyonce"],
  },
  anxious_archivist: {
    id: "anxious_archivist",
    archetype: "The Deep Diver",
    bigFive: [
      { trait: "Openness", level: "High" },
      { trait: "Conscientiousness", level: "High" },
      { trait: "Extraversion", level: "Low" },
      { trait: "Agreeableness", level: "Low" },
      { trait: "Neuroticism", level: "Medium" },
    ],
    attachmentStyle: "Dismissive-Avoidant",
    stateLine: "deep in a rabbit hole, alphabetizing feelings",
    stateLevels: { energy: "Medium", regulation: "Low", rumination: "High" },
    artistsRecent: ["Aphex Twin", "Bon Iver", "black midi"],
    artistsDurable: ["Radiohead"],
  },
};

export const DEFAULT_SAMPLE = SAMPLE_PROFILES.velvet_cynic;
