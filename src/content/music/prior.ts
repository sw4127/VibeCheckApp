/**
 * §29 — WC→music progressive-profiling prior (AUTHORED static map, no DB).
 *
 * The two quizzes share NO engine dimensions, so answers cannot pass through.
 * Instead: the carried WC answers → normalized WC vector → this authored map →
 * a SNAPPED OPTION ID for the two music questions a bridged user skips
 * (`hooks`/reflective, `where`/extraversion). Snapping to real option ids keeps
 * §6 fully intact: the music engine still scores ordinary options; same WC
 * answers → same seeded options → same verdict. The result page discloses
 * seeded axes ("carried from your pitch read") — inferred is never presented
 * as measured.
 *
 * Confidence (documented, PM-tunable):
 *  - where ← teamplay (MODERATE: plays-with-others ↔ listens-with-others)
 *  - hooks ← flair   (WEAK: expressive/improvisational ↔ feeling/language-led;
 *    the weakest row — biased toward the middle option on purpose)
 * The state axes (rotation/job/sadsong) and openness (lately/sits) are NEVER
 * seeded — recent mood and openness have no honest football signal.
 */
import { percentileNormalize, scoreAnswers, isComplete, type Answers } from "@/engine";
import { worldCupQuiz } from "@/content/world-cup/quiz";

export const SEEDED_QUESTIONS = ["hooks", "where"] as const;

/** Bucket a normalized [0,1] axis into one of three option ids. */
const snap = (v: number, low: string, mid: string, high: string): string =>
  v < 0.4 ? low : v <= 0.72 ? mid : high;

/**
 * Seed the skipped music answers from complete WC answers. Returns null when
 * the WC set is incomplete/invalid (→ caller falls back to the full quiz).
 */
export function seedFromWorldCup(wcAnswers: Answers): { hooks: string; where: string } | null {
  if (!isComplete(worldCupQuiz, wcAnswers)) return null;
  const norm = percentileNormalize(worldCupQuiz, scoreAnswers(worldCupQuiz, wcAnswers));
  return {
    hooks: snap(norm.flair ?? 0.5, "beat", "texture", "lyrics"),
    where: snap(norm.teamplay ?? 0.5, "alone", "curate", "people"),
  };
}

/** Extract carried WC answers from arbitrary query params (ids don't collide). */
export function wcAnswersFrom(params: URLSearchParams): Answers {
  const out: Answers = {};
  for (const q of worldCupQuiz.questions) {
    const v = params.get(q.id);
    if (v) out[q.id] = v;
  }
  return out;
}
