/** Public surface of the reusable scoring engine. */
export * from "./types";
export { scoreAnswers, normalize, dimensionRanges } from "./score";
export { distance, rankMatches, nearestMatch } from "./match";
export { canonicalAnswers, fnv1a, hashAnswers } from "./hash";
export { buildProfile, isComplete, missingAnswers } from "./profile";
