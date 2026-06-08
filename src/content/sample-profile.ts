/**
 * Hardcoded sample profiles for Slice 0 (the paid pipeline is built/proven
 * against these until the Stage-2 music engine lands in Slice 1).
 *
 * Shape mirrors what the real music engine will emit per spec §17.B: an
 * archetype, the trait lane (Big Five levels → Diagnosis) and a state line
 * (recent/mood → Red Flags), plus flavor-only artists split recent/durable (§6).
 */
import type { Level } from "@/llm/premiumSchema";

export interface PremiumProfile {
  /** Stable key for caching the narration by input. */
  id: string;
  archetype: string;
  bigFive: { trait: string; level: Level }[];
  attachmentStyle: string;
  /** Current-emotion descriptor from the state lane (feeds Red Flags). */
  stateLine: string;
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
    artistsRecent: ["Aphex Twin", "Bon Iver", "black midi"],
    artistsDurable: ["Radiohead"],
  },
};

export const DEFAULT_SAMPLE = SAMPLE_PROFILES.velvet_cynic;
