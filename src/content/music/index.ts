/**
 * Music variant bundle (§16.F contract) + the §17.B two-lane routing, computed
 * in code — the LLM never decides lane membership.
 */

import {
  buildProfile,
  levelOf,
  type Answers,
  type Profile,
} from "@/engine";
import type { Level } from "@/llm/premiumSchema";
import type { PremiumProfile } from "@/content/sample-profile";
import { fnv1a } from "@/engine";
import { musicArchetypes, ARCHETYPE_THEMES } from "./archetypes";
import { musicSpines } from "./spines";
import {
  musicQuiz,
  CUES,
  REVERB,
  QUESTION_LANES,
  STATE_AXES,
  TRAIT_AXES,
  MUSIC_DIMENSIONS,
} from "./quiz";

export {
  musicQuiz,
  musicArchetypes,
  musicSpines,
  ARCHETYPE_THEMES,
  CUES,
  REVERB,
  QUESTION_LANES,
  STATE_AXES,
  TRAIT_AXES,
  MUSIC_DIMENSIONS,
};

/** The music verdict is the archetype alone — the archetype set doubles as the
 *  match-target set so the generic engine signature is satisfied. */
export function buildMusicProfile(answers: Answers): Profile {
  return buildProfile(musicQuiz, musicArchetypes, musicArchetypes, answers);
}

/** Theme for an archetype LABEL (tokens carry labels, not ids). Unknown → midnight. */
export function themeForArchetypeLabel(label: string): string {
  const c = musicArchetypes.centroids.find((x) => x.label === label);
  return (c && ARCHETYPE_THEMES[c.id]) || "midnight";
}

export interface Lanes {
  /** Recent/mood (→ Red Flags). */
  state: Record<string, Level>;
  /** Durable (→ Diagnosis / Big Five). */
  trait: Record<string, Level>;
}

/** §17.B: split the normalized vector into state/trait level buckets, in code. */
export function splitLanes(profile: Profile): Lanes {
  const state: Record<string, Level> = {};
  const trait: Record<string, Level> = {};
  for (const axis of STATE_AXES) state[axis] = levelOf(profile.normalized[axis] ?? 0.5);
  for (const axis of TRAIT_AXES) trait[axis] = levelOf(profile.normalized[axis] ?? 0.5);
  return { state, trait };
}

/** Deterministic current-state line from the state lane (feeds Red Flags). */
export function describeState(state: Record<string, Level>): string {
  const rum = state.rumination;
  const eng = state.energy;
  const reg = state.regulation;
  if (rum === "High" && eng === "Low") return "running on low-grade dread and 1am replays";
  if (rum === "High") return "feeling everything at full volume and calling it a phase";
  if (reg === "High") return "micromanaging your own mood, one playlist at a time";
  if (eng === "High") return "riding a hype high and outrunning the quiet";
  if (eng === "Low" && rum === "Low") return "coasting on calm and calling it balance";
  return "somewhere between fine and 'don't ask'";
}

/** Entertainment-lens attachment style (§8), deterministic from the TRAIT lane only. */
export function attachmentOf(trait: Record<string, Level>): string {
  const e = trait.extraversion;
  const r = trait.reflective;
  if (e === "Low" && r === "High") return "Dismissive-Avoidant";
  if (e === "Low") return "Fearful-Avoidant";
  if (r === "High") return "Anxious-Preoccupied";
  return "Secure";
}

/**
 * Map a music profile to the premium-report input (§17.B):
 * - Openness/Extraversion: real, from the trait lane.
 * - Conscientiousness/Agreeableness/Neuroticism: Medium placeholders until the
 *   paid-flow durable taps land (§17.C / §18.E) — NOT inferred from state
 *   (lane firewall: state never feeds Big Five).
 */
export function musicPremiumProfile(
  profile: Profile,
  artistsRecent: string[],
  artistsDurable: string[],
): PremiumProfile {
  const lanes = splitLanes(profile);
  return {
    id: fnv1a(`music|${profile.hash}|${artistsRecent.join(",")}|${artistsDurable.join(",")}`),
    archetype: profile.archetype.label,
    stateLevels: {
      energy: lanes.state.energy,
      regulation: lanes.state.regulation,
      rumination: lanes.state.rumination,
    },
    bigFive: [
      { trait: "Openness", level: lanes.trait.openness },
      { trait: "Conscientiousness", level: "Medium" },
      { trait: "Extraversion", level: lanes.trait.extraversion },
      { trait: "Agreeableness", level: "Medium" },
      { trait: "Neuroticism", level: "Medium" },
    ],
    attachmentStyle: attachmentOf(lanes.trait),
    stateLine: describeState(lanes.state),
    artistsRecent,
    artistsDurable,
  };
}
