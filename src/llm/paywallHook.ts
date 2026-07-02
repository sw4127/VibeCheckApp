/**
 * A1b — the cached Haiku POLISH of the paywall hook (the D2 prompt).
 *
 * The deterministic A1a hook (buildPreviewHook) is the floor + the fallback;
 * this returns a sharper, bespoke line ONLY when it can (a key is set AND the
 * user typed an artist to name). It returns `hook: null` on every non-model
 * path so the caller falls back to A1a — and the route caches only real model
 * hooks, so a missing key / transient error is never cached.
 *
 * Cost (we're watching it): artist-gated + CDN-cached by the normalized inputs
 * ⇒ ≤1 tiny Haiku call per unique (archetype · top-signal · artist set), served
 * from the edge forever after. Same Haiku snapshot + cache_control as narrate.ts.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const HOOK_MODEL = process.env.ANTHROPIC_MODEL_NARRATION ?? "claude-haiku-4-5";

export const paywallHookSchema = z.object({
  hook_line: z.string(),
});

/** D2 (PM-authored). The engine pre-computed everything; the model only writes. */
const HOOK_SYSTEM = `You write ONE un-blurred hook line that sits above a paywall blur. Goal: prove we read THEM, then dangle the LAW as the thing they unlock.

Output ONLY {"hook_line":"..."}.

RULES
- You MUST quote the exact TOP_SIGNAL text (e.g. "High Openness") verbatim, AND name at least one GIVEN artist. Both are required.
- End by implying that a single RULE which explains them sits just below the blur — do NOT state the rule. (e.g. "...and your whole taste runs on one rule you've never said out loud. It's the first line below.")
- Declarative, present tense, 2nd person, zero hedges ("might/maybe/probably").
- Anti-Barnum: it must be able to be WRONG about a stranger.
- 35 words MAX.
- Roast taste/behaviour only; no protected attributes, no clinical claims.

INPUT is pre-computed — never re-classify it.`;

export interface HookInput {
  archetype: string;
  topSignal: string; // e.g. "High Openness" — the GIVEN score+level, verbatim
  artists: string[]; // GIVEN artists the user typed
}

export type HookSource = "model" | "fallback" | "local";

export function buildHookUserMessage(input: HookInput): string {
  return [
    `ARCHETYPE: ${input.archetype}`,
    `TOP_SIGNAL: ${input.topSignal}`,
    `ARTISTS_TYPED: ${input.artists.join(", ")}`,
  ].join("\n");
}

/**
 * The polished hook, or `null` to signal "fall back to the deterministic A1a
 * hook". null when: no API key (local), no artist to name (gated — D2 requires
 * one), or any model failure/refusal.
 */
export async function narratePaywallHook(
  input: HookInput,
): Promise<{ hook: string | null; source: HookSource }> {
  if (!process.env.ANTHROPIC_API_KEY) return { hook: null, source: "local" };
  if (input.artists.length === 0 || !input.topSignal) {
    return { hook: null, source: "local" }; // artist-gated: nothing to be specific with
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: HOOK_MODEL,
      max_tokens: 200,
      temperature: 0.3, // close, declarative (§6 / §21)
      thinking: { type: "disabled" },
      system: [{ type: "text", text: HOOK_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildHookUserMessage(input) }],
      output_config: { format: zodOutputFormat(paywallHookSchema) },
    });

    const line = response.parsed_output?.hook_line?.trim();
    if (response.stop_reason === "refusal" || !line) {
      return { hook: null, source: "fallback" };
    }
    // Enforce the D2 contract server-side: the polish MUST quote the signal and
    // name an artist, and stay within the word budget (a runaway/injected line
    // is rejected, not published). Otherwise fall back to A1a — and, because
    // only "model" is cached, an off-spec line is never edge-cached.
    const words = line.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    const obeysD2 =
      words <= 40 &&
      line.includes(input.topSignal) &&
      input.artists.some((a) => line.includes(a));
    if (!obeysD2) return { hook: null, source: "fallback" };
    return { hook: line, source: "model" };
  } catch {
    return { hook: null, source: "fallback" };
  }
}
