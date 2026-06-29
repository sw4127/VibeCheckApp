/** Public surface of the reusable scoring engine. */
export * from "./types";
export {
  scoreAnswers,
  normalize,
  dimensionRanges,
  axisSamples,
  percentileNormalize,
} from "./score";
export { distance, rankMatches, nearestMatch } from "./match";
export { canonicalAnswers, fnv1a, hashAnswers } from "./hash";
export { buildProfile, assembleProfile, isComplete, missingAnswers } from "./profile";
export {
  buildWeightedProfile,
  scoreWeightedAnswers,
  missingWeighted,
  primaryAnswers,
  primaryOf,
  canonicalWeighted,
  hashWeighted,
  parseAnswerChoice,
  encodeAnswerChoice,
  BLEND_DELIM,
  SPLIT_PRIMARY,
  SPLIT_SECONDARY,
  SPLIT_PCTS,
  type WeightedAnswer,
  type AnswerChoice,
  type WeightedAnswers,
} from "./weighted";
export { archetypeFrequencies, archetypeRarityPct } from "./rarity";
export { levelOf, type LevelBucket } from "./levels";
