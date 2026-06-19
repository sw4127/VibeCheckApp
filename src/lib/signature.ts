/**
 * Vibe-signature rows — the data behind the ranked-bar chart on the result pages.
 *
 * Honesty (the §23.E line, restated): every "proof" string is the user's ACTUAL
 * chosen answer that contributed the most weight to that axis — derived from real
 * inputs, never invented telemetry. The value is the engine's normalized 0–1
 * score mapped to 0–100 (the user's level on the axis), NOT a population stat.
 */
import type { Answers, QuizConfig } from "@/engine";

export interface SignatureRow {
  axis: string;
  /** Flavor name mapped 1:1 to a real axis. */
  label: string;
  /** 0–100 — the user's level on this axis (engine-normalized). */
  value: number;
  /** Receipt: the user's literal answer that drove this axis (driven), or an
   *  honest note that nothing they picked leaned this way (undriven). */
  proof: string;
  /** True when `proof` is a chosen answer (render "from your pick: …"). */
  driven: boolean;
}

/** Sharp, 1:1-to-axis flavor labels (data — swap freely). */
export const FOOTBALL_SIGNATURE_LABELS: Record<string, string> = {
  intensity: "Intensity",
  flair: "Flair",
  workrate: "Work Rate",
  composure: "Composure",
  teamplay: "Team Player",
};

export const MUSIC_SIGNATURE_LABELS: Record<string, string> = {
  energy: "Energy",
  regulation: "Mood Control",
  rumination: "Overthinking",
  openness: "Openness",
  reflective: "Depth",
  extraversion: "Social Battery",
};

/** The option the user picked that contributed the most weight to `axis`. */
function drivingAnswer(quiz: QuizConfig, answers: Answers, axis: string): string | null {
  let best: { label: string; w: number } | null = null;
  for (const q of quiz.questions) {
    const chosen = q.options.find((o) => o.id === answers[q.id]);
    const w = chosen?.weights[axis] ?? 0;
    if (chosen && w > 0 && (!best || w > best.w)) best = { label: chosen.label, w };
  }
  return best?.label ?? null;
}

/**
 * One row per axis (in declared order — the chart sorts). `value` is 0–100,
 * `proof` is the real driving answer.
 */
export function buildSignatureRows(
  quiz: QuizConfig,
  answers: Answers,
  scores: Record<string, number | undefined>,
  labels: Record<string, string>,
): SignatureRow[] {
  return quiz.dimensions.map((axis) => {
    const driver = drivingAnswer(quiz, answers, axis);
    return {
      axis,
      label: labels[axis] ?? axis,
      value: Math.round(Math.max(0, Math.min(1, scores[axis] ?? 0.5)) * 100),
      proof: driver ?? "nothing you picked leaned this way",
      driven: driver !== null,
    };
  });
}
