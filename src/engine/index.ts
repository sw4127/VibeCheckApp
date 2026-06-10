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
export { buildProfile, isComplete, missingAnswers } from "./profile";
export { archetypeFrequencies, archetypeRarityPct } from "./rarity";
export { levelOf, type LevelBucket } from "./levels";
