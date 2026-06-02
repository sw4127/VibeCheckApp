/**
 * Core engine types — deliberately generic (no football / no music here).
 *
 * The whole Stage 1 / Stage 2 reuse story lives in this file: the engine
 * operates on abstract "dimensions" and matches a user's score vector against
 * labelled "centroids". A centroid set can be archetypes OR a player roster OR
 * (in Stage 2) music personas — the engine doesn't care. Content plugs in via
 * `QuizConfig` + `CentroidSet`s; the code below never changes.
 */

/** Opaque id for a scoring dimension (e.g. "intensity", "flair"). */
export type DimensionId = string;

/** A user's position on each dimension. Sparse: absent = "not contributed to". */
export type ScoreVector = Partial<Record<DimensionId, number>>;

/** One selectable answer. Its weights nudge the score vector per dimension. */
export interface QuizOption {
  id: string;
  label: string;
  /** Points this option contributes toward each dimension. May be negative. */
  weights: ScoreVector;
}

/** One tap question. Single-select for v1. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

/**
 * The full quiz definition. `dimensions` is the canonical, ordered axis list so
 * vectors are comparable and normalization is well-defined.
 */
export interface QuizConfig {
  id: string;
  title: string;
  dimensions: DimensionId[];
  questions: QuizQuestion[];
}

/** A user's chosen option id per question. */
export type Answers = Record<string /* questionId */, string /* optionId */>;

/** A labelled target in dimension space (an archetype, a player, a persona). */
export interface Centroid {
  id: string;
  label: string;
  /** Position in [0,1] per dimension (same scale as a normalized user vector). */
  vector: ScoreVector;
  /** Free-form descriptors handed to the LLM for flavor (e.g. playing-style tags). */
  tags?: string[];
}

/** A named collection of centroids to match against (roster, archetype list…). */
export interface CentroidSet {
  id: string;
  centroids: Centroid[];
}

/** One scored candidate from a nearest-match query. */
export interface MatchResult {
  id: string;
  label: string;
  tags?: string[];
  /** Euclidean distance to the user vector — lower is closer. */
  distance: number;
}

/**
 * The fully computed, deterministic verdict. The LLM receives this and only
 * writes prose for it — it never re-derives any field here.
 */
export interface Profile {
  /** Stable hash of (config + normalized answers) — the cache key. */
  hash: string;
  /** Raw summed weights per dimension. */
  raw: ScoreVector;
  /** Per-dimension normalized score in [0,1]. */
  normalized: ScoreVector;
  /** Nearest archetype (the named "vibe type"). */
  archetype: MatchResult;
  /** Nearest roster entry (the World Cup player in Stage 1). */
  match: MatchResult;
  /** Full ranked roster, nearest first — useful for "you were also close to…". */
  rankedMatches: MatchResult[];
}
