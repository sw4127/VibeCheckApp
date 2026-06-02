/**
 * buildProfile: the one call the rest of the app uses. Turns answers into the
 * complete, deterministic verdict that the LLM will narrate (and never alter).
 */

import { hashAnswers } from "./hash";
import { nearestMatch, rankMatches } from "./match";
import { percentileNormalize, scoreAnswers } from "./score";
import type {
  Answers,
  CentroidSet,
  Profile,
  QuizConfig,
} from "./types";

/** Question ids the user has not answered yet (empty = ready to score). */
export function missingAnswers(config: QuizConfig, answers: Answers): string[] {
  return config.questions
    .filter((q) => {
      const id = answers[q.id];
      return id === undefined || !q.options.some((o) => o.id === id);
    })
    .map((q) => q.id);
}

/** True when every tap question has a valid selected option (spec §10). */
export function isComplete(config: QuizConfig, answers: Answers): boolean {
  return missingAnswers(config, answers).length === 0;
}

/**
 * Compute the full verdict. Requires a complete answer set so the score vector
 * is whole (spec §10: "force completion of every tap question").
 */
export function buildProfile(
  config: QuizConfig,
  archetypes: CentroidSet,
  roster: CentroidSet,
  answers: Answers,
): Profile {
  const missing = missingAnswers(config, answers);
  if (missing.length > 0) {
    throw new Error(
      `buildProfile: incomplete answers; missing/invalid: ${missing.join(", ")}`,
    );
  }

  const raw = scoreAnswers(config, answers);
  // Percentile-normalized so users spread across the space and the roster gets
  // used evenly (see score.ts). This is the vector everything matches against.
  const normalized = percentileNormalize(config, raw);

  return {
    hash: hashAnswers(config, answers),
    raw,
    normalized,
    archetype: nearestMatch(normalized, archetypes.centroids),
    match: nearestMatch(normalized, roster.centroids),
    rankedMatches: rankMatches(normalized, roster.centroids),
  };
}
