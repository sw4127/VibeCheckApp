/**
 * Nearest-centroid matching — the single primitive behind both archetype
 * assignment and player matching (and Stage 2 music personas).
 */

import type { Centroid, MatchResult, ScoreVector } from "./types";

/**
 * Euclidean distance between a user vector and a centroid, compared only over
 * the dimensions the centroid actually declares. Both are expected in [0,1].
 */
export function distance(user: ScoreVector, centroid: ScoreVector): number {
  let sum = 0;
  for (const [dim, target] of Object.entries(centroid)) {
    const u = user[dim] ?? 0.5; // missing user dim = neutral
    const d = u - (target ?? 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Rank every centroid by closeness to the user vector, nearest first.
 * Ties break by `id` (ascending) so the result is fully deterministic.
 */
export function rankMatches(
  user: ScoreVector,
  centroids: Centroid[],
): MatchResult[] {
  return centroids
    .map((c) => ({
      id: c.id,
      label: c.label,
      tags: c.tags,
      distance: distance(user, c.vector),
    }))
    .sort((a, b) =>
      a.distance === b.distance
        ? a.id < b.id
          ? -1
          : a.id > b.id
            ? 1
            : 0
        : a.distance - b.distance,
    );
}

/** The single nearest centroid (throws if the set is empty — a config bug). */
export function nearestMatch(
  user: ScoreVector,
  centroids: Centroid[],
): MatchResult {
  const ranked = rankMatches(user, centroids);
  if (ranked.length === 0) {
    throw new Error("nearestMatch: empty centroid set");
  }
  return ranked[0];
}
