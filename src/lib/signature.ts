/**
 * Vibe-signature rows — the data behind the signature chart / stat line.
 *
 * BIPOLAR (v2): every axis has TWO named poles (§18.D symmetric desirability —
 * the low end is a stance, not an absence). A row carries the pole the user
 * leans toward and the LEAN strength (0–100, distance from dead-center), so an
 * all-low-pole answerer reads as six strong leans ("Loyalist 88"), not six
 * empty bars. Mid axes stay honest: "dead center", never a fabricated lean.
 *
 * Honesty (the §23.E line, restated): every "proof" string is the user's ACTUAL
 * chosen answer — for a HIGH lean, the pick that loaded the axis most; for a
 * LOW lean, the pick where they declined the axis hardest (chose the calm
 * option with the loud one on the table). Derived from real inputs, never
 * invented telemetry. Values are the engine's normalized scores, NOT population
 * stats.
 */
import type { Answers, QuizConfig } from "@/engine";

export interface SignatureRow {
  axis: string;
  /** Flavor name mapped 1:1 to a real axis. */
  label: string;
  /** 0–100 — the user's raw level on this axis (engine-normalized). */
  value: number;
  /** The named pole they lean toward ("Loyalist"), or "Balanced" at center. */
  pole: string;
  /** 0–100 — strength of the lean (distance from dead-center, |value−50|×2). */
  lean: number;
  /** Which end of the axis the lean points to. */
  direction: "high" | "low" | "mid";
  /** Receipt: the user's literal answer behind the lean (see `driven`). */
  proof: string;
  /** True when `proof` is a chosen answer (render "from your pick: …"). */
  driven: boolean;
}

/** Axis pole names — BOTH ends ownable (§18.D). Data; swap freely. */
export interface AxisPoles {
  high: string;
  low: string;
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

/** Football poles — playing-style-safe, FUT-compact, both ends a flex. */
export const FOOTBALL_SIGNATURE_POLES: Record<string, AxisPoles> = {
  intensity: { high: "Relentless", low: "Measured" },
  flair: { high: "Showman", low: "Efficient" },
  workrate: { high: "Tireless", low: "Selective" },
  composure: { high: "Ice-cold", low: "Fiery" },
  teamplay: { high: "Selfless", low: "Lone Wolf" },
};

/** Music poles — trait axes reuse the PM-approved matrix modifier words. */
export const MUSIC_SIGNATURE_POLES: Record<string, AxisPoles> = {
  energy: { high: "Amped", low: "Mellow" },
  regulation: { high: "Alchemist", low: "Purist" },
  rumination: { high: "Marinator", low: "Skipper" },
  openness: { high: "Restless", low: "Loyalist" },
  reflective: { high: "Lyric-bound", low: "Visceral" },
  extraversion: { high: "Out-loud", low: "Guarded" },
};

/** A lean this small (|value−50|×2 ≤ 20 → value 40–60) is honestly "center". */
const MID_BAND = 20;

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
 * The LOW-lean receipt: the pick where the user declined the axis hardest —
 * the chosen option on the question whose available max weight for `axis` was
 * largest while their pick contributed least. Always a REAL chosen answer.
 */
function decliningAnswer(quiz: QuizConfig, answers: Answers, axis: string): string | null {
  let best: { label: string; declined: number } | null = null;
  for (const q of quiz.questions) {
    const chosen = q.options.find((o) => o.id === answers[q.id]);
    if (!chosen) continue;
    const potential = Math.max(...q.options.map((o) => o.weights[axis] ?? 0));
    const declined = potential - (chosen.weights[axis] ?? 0);
    if (declined > 0 && (!best || declined > best.declined)) {
      best = { label: chosen.label, declined };
    }
  }
  return best?.label ?? null;
}

/**
 * One row per axis (in declared order — the chart sorts by lean). `value` is
 * the raw 0–100 level; `pole`/`lean` are the bipolar read of it.
 */
export function buildSignatureRows(
  quiz: QuizConfig,
  answers: Answers,
  scores: Record<string, number | undefined>,
  labels: Record<string, string>,
  poles: Record<string, AxisPoles> = {},
): SignatureRow[] {
  return quiz.dimensions.map((axis) => {
    const value = Math.round(Math.max(0, Math.min(1, scores[axis] ?? 0.5)) * 100);
    const lean = Math.abs(value - 50) * 2;
    const direction: SignatureRow["direction"] =
      lean <= MID_BAND ? "mid" : value > 50 ? "high" : "low";
    const p = poles[axis];
    const pole =
      direction === "mid" ? "Balanced" : direction === "high" ? p?.high ?? labels[axis] ?? axis : p?.low ?? labels[axis] ?? axis;

    // Receipt matches the lean's direction; mid is honestly receipt-less.
    const driver =
      direction === "high"
        ? drivingAnswer(quiz, answers, axis)
        : direction === "low"
          ? decliningAnswer(quiz, answers, axis)
          : null;
    const proof =
      driver ??
      (direction === "mid"
        ? "dead center — no lean either way"
        : "nothing you picked leaned this way");

    return {
      axis,
      label: labels[axis] ?? axis,
      value,
      pole,
      lean,
      direction,
      proof,
      driven: driver !== null,
    };
  });
}
