/**
 * Rarity: what fraction of the (finite) answer space lands on each archetype.
 *
 * Because the quiz has a small, enumerable answer space, we can compute the
 * exact frequency of every archetype deterministically — an honest "only X%
 * share your vibe" spark, not a fabricated number. Memoized per config+set.
 */

import { nearestMatch } from "./match";
import { percentileNormalize, scoreAnswers } from "./score";
import type { CentroidSet, QuizConfig } from "./types";

const cache = new Map<string, Record<string, number>>();

/** Fraction in [0,1] of all answer combinations that map to each archetype id. */
export function archetypeFrequencies(
  config: QuizConfig,
  archetypes: CentroidSet,
): Record<string, number> {
  const key = `${config.id}|${archetypes.id}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const counts: Record<string, number> = {};
  const total = config.questions.reduce((acc, q) => acc * q.options.length, 1);

  for (let i = 0; i < total; i++) {
    let n = i;
    const answers: Record<string, string> = {};
    for (const q of config.questions) {
      const k = q.options.length;
      answers[q.id] = q.options[n % k].id;
      n = Math.floor(n / k);
    }
    const norm = percentileNormalize(config, scoreAnswers(config, answers));
    const m = nearestMatch(norm, archetypes.centroids);
    counts[m.id] = (counts[m.id] ?? 0) + 1;
  }

  const freq: Record<string, number> = {};
  for (const c of archetypes.centroids) freq[c.id] = (counts[c.id] ?? 0) / total;
  cache.set(key, freq);
  return freq;
}

/** Whole-percent rarity for one archetype (min 1 so it never reads "0%"). */
export function archetypeRarityPct(
  config: QuizConfig,
  archetypes: CentroidSet,
  archetypeId: string,
): number {
  const f = archetypeFrequencies(config, archetypes)[archetypeId] ?? 0;
  return Math.max(1, Math.round(f * 100));
}
