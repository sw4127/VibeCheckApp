/**
 * Scoring: answers -> raw score vector -> normalized [0,1] vector.
 *
 * Pure arithmetic, no randomness, no LLM. Same answers in -> same vector out,
 * every time. This is what makes the "it's actually computed" credibility claim
 * honest (spec §6).
 */

import type {
  Answers,
  DimensionId,
  QuizConfig,
  QuizQuestion,
  ScoreVector,
} from "./types";

/** Sum each selected option's weights into a raw per-dimension vector. */
export function scoreAnswers(config: QuizConfig, answers: Answers): ScoreVector {
  const raw: ScoreVector = {};
  // Seed every declared dimension at 0 so the vector shape is always complete.
  for (const dim of config.dimensions) raw[dim] = 0;

  for (const question of config.questions) {
    const chosenId = answers[question.id];
    if (chosenId === undefined) continue; // tolerated here; completeness enforced separately
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const [dim, w] of Object.entries(option.weights)) {
      raw[dim] = (raw[dim] ?? 0) + (w ?? 0);
    }
  }
  return raw;
}

/**
 * Per dimension, the min and max total reachable across the quiz — the sum over
 * each question of its smallest / largest option weight for that dimension.
 * Used to normalize a raw score into [0,1] regardless of how many questions feed
 * a dimension (this is also how the spec's "average two Openness indicators"
 * note generalizes: more contributing questions just widens the range).
 */
export function dimensionRanges(
  config: QuizConfig,
): Record<DimensionId, { min: number; max: number }> {
  const ranges: Record<DimensionId, { min: number; max: number }> = {};
  for (const dim of config.dimensions) ranges[dim] = { min: 0, max: 0 };

  for (const question of config.questions) {
    // For each dimension, the per-question contribution ranges over the options.
    const perDim: Record<DimensionId, { min: number; max: number }> = {};
    for (const option of question.options) {
      for (const dim of config.dimensions) {
        const w = option.weights[dim] ?? 0;
        const cur = perDim[dim];
        if (!cur) perDim[dim] = { min: w, max: w };
        else {
          cur.min = Math.min(cur.min, w);
          cur.max = Math.max(cur.max, w);
        }
      }
    }
    for (const dim of config.dimensions) {
      const pd = perDim[dim] ?? { min: 0, max: 0 };
      ranges[dim].min += pd.min;
      ranges[dim].max += pd.max;
    }
  }
  return ranges;
}

/**
 * Map a raw vector to [0,1] per dimension using the quiz's reachable range.
 * A dimension with no spread (min === max) normalizes to 0.5 (neutral).
 */
export function normalize(config: QuizConfig, raw: ScoreVector): ScoreVector {
  const ranges = dimensionRanges(config);
  const out: ScoreVector = {};
  for (const dim of config.dimensions) {
    const { min, max } = ranges[dim];
    const v = raw[dim] ?? 0;
    if (max === min) {
      out[dim] = 0.5;
    } else {
      const t = (v - min) / (max - min);
      out[dim] = t < 0 ? 0 : t > 1 ? 1 : t;
    }
  }
  return out;
}

// --- Percentile normalization ----------------------------------------------
//
// Min-max normalization squashes users toward the low corner, because the
// theoretical per-axis max requires picking that axis's best option on *every*
// question — impossible with one tap per question. So we instead rank each raw
// score against the realistic distribution of all answer combinations: a user's
// normalized value becomes their percentile (≈uniform on [0,1], mean ~0.5).
// This is what makes the roster get used evenly.

/** Cap on full enumeration; larger answer spaces are stride-sampled instead. */
const MAX_ENUMERATION = 60000;

const sampleCache = new Map<string, Record<DimensionId, number[]>>();

function decodeAnswers(config: QuizConfig, index: number): Answers {
  const answers: Answers = {};
  let n = index;
  for (const q of config.questions) {
    const k = q.options.length;
    answers[q.id] = q.options[n % k].id;
    n = Math.floor(n / k);
  }
  return answers;
}

/**
 * Sorted raw-score samples per dimension across the answer space. Fully
 * enumerated when feasible, otherwise a deterministic stride sample (no RNG, so
 * results stay reproducible). Memoized per config id.
 */
export function axisSamples(config: QuizConfig): Record<DimensionId, number[]> {
  const cached = sampleCache.get(config.id);
  if (cached) return cached;

  const total = config.questions.reduce(
    (acc: number, q: QuizQuestion) => acc * q.options.length,
    1,
  );
  const sampleCount = Math.min(total, MAX_ENUMERATION);

  const acc: Record<DimensionId, number[]> = {};
  for (const dim of config.dimensions) acc[dim] = [];

  for (let i = 0; i < sampleCount; i++) {
    // Full enumeration when small; evenly strided indices otherwise.
    const index =
      total <= MAX_ENUMERATION ? i : Math.floor((i * total) / sampleCount);
    const raw = scoreAnswers(config, decodeAnswers(config, index));
    for (const dim of config.dimensions) acc[dim].push(raw[dim] ?? 0);
  }
  for (const dim of config.dimensions) acc[dim].sort((a, b) => a - b);

  sampleCache.set(config.id, acc);
  return acc;
}

/** Mid-rank percentile of `value` within a sorted array, in [0,1]. */
function percentileOf(sorted: number[], value: number): number {
  if (sorted.length === 0) return 0.5;
  let less = 0;
  let equal = 0;
  for (const s of sorted) {
    if (s < value) less++;
    else if (s === value) equal++;
    else break; // sorted ascending
  }
  return (less + equal / 2) / sorted.length;
}

/**
 * Normalize a raw vector to per-axis percentiles against the realistic answer
 * distribution. This is the vector used for matching (spec §6 stays satisfied:
 * deterministic, same answers -> same percentiles -> same verdict).
 */
export function percentileNormalize(
  config: QuizConfig,
  raw: ScoreVector,
): ScoreVector {
  const samples = axisSamples(config);
  const out: ScoreVector = {};
  for (const dim of config.dimensions) {
    out[dim] = percentileOf(samples[dim], raw[dim] ?? 0);
  }
  return out;
}
