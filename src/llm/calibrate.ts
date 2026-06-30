/**
 * Slice 3 — the free-text TRANSLATOR (paid-flow C/A/N gap-fill).
 *
 * §6 GOVERNING RULE: the model is a TRANSLATOR, never a judge. It maps the
 * user's free-text self-description onto the EXISTING calibration option ids
 * (the same `meticulous`/`laugh`/`betrayed` ids the manual taps use) — it never
 * picks an archetype or scores anything. The engine (`applyPaidTaps`) then maps
 * option → level → score, exactly as for a manual tap. Same text → same ids
 * (cached) → same verdict.
 *
 * Enum-locked TWICE: the prompt lists the only valid ids, and we then drop any
 * returned id that isn't a real option of a requested tap. Cheap: Haiku, tiny
 * output, length-capped, cached at the route — paid-flow only.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { PaidTap } from "@/lib/paidTaps";

const CALIBRATE_MODEL = process.env.ANTHROPIC_MODEL_NARRATION ?? "claude-haiku-4-5";
export const CALIBRATE_MAX_CHARS = 240;

/** Fixed shape (one nullable id per trait); the prompt says which to fill. */
export const calibrateSchema = z.object({
  c: z.string().nullable(),
  a: z.string().nullable(),
  n: z.string().nullable(),
});

export type CalibrateIds = { c?: string; a?: string; n?: string };
export type CalibrateSource = "model" | "fallback" | "local";

/** System prompt — lists ONLY the requested taps and their exact option ids. */
export function buildCalibrateSystem(taps: PaidTap[]): string {
  const qs = taps
    .map((t) => `- ${t.id}: ${t.prompt}\n  options: ${t.options.map((o) => `${o.id} ("${o.label}")`).join(", ")}`)
    .join("\n");
  return `You map a person's free-text self-description to the SINGLE closest option for each listed question. You are a translator, not a judge: output ONLY an option id that appears below, or null. If the text says nothing relevant to a question, return null for it. Never invent an id, never explain.

QUESTIONS:
${qs}

For any of {c, a, n} NOT listed above, return null.`;
}

export function buildCalibrateMessage(text: string): string {
  return text.trim().slice(0, CALIBRATE_MAX_CHARS);
}

/**
 * Translate free text → calibration option ids, validated against the requested
 * taps' real options. Returns {} (→ fall back to manual taps / Medium) on no
 * key, empty text, no taps, or any failure. Never throws.
 */
export async function narrateCalibration(
  text: string,
  taps: PaidTap[],
): Promise<{ ids: CalibrateIds; source: CalibrateSource }> {
  const clean = buildCalibrateMessage(text);
  if (!process.env.ANTHROPIC_API_KEY || !clean || taps.length === 0) {
    return { ids: {}, source: "local" };
  }
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: CALIBRATE_MODEL,
      max_tokens: 100,
      temperature: 0.2, // close to deterministic — this is a mapping, not prose
      thinking: { type: "disabled" },
      system: [{ type: "text", text: buildCalibrateSystem(taps), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: clean }],
      output_config: { format: zodOutputFormat(calibrateSchema) },
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return { ids: {}, source: "fallback" };

    // §6 hard guard: keep ONLY ids that are real options of a REQUESTED tap.
    const ids: CalibrateIds = {};
    for (const tap of taps) {
      const picked = out[tap.id];
      if (picked && tap.options.some((o) => o.id === picked)) ids[tap.id] = picked;
    }
    return { ids, source: Object.keys(ids).length ? "model" : "fallback" };
  } catch {
    return { ids: {}, source: "fallback" };
  }
}
