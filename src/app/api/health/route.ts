/**
 * Ops self-check (2026-07-16 brief §3.A2 — serves D6/N1: the dataset must
 * actually accumulate, and a dark analytics pipe must be LOUD, not silent).
 *
 * Reports env COMPLETENESS ONLY — booleans, never values. Nothing secret
 * leaves the server. `ok` is true iff every var required for D6 data
 * accumulation is present.
 */
import { BIAS_INSTRUMENT_ID, BIAS_POOL_VERSION } from "@/content/bias/items";

export const dynamic = "force-dynamic";

/** Vars without which the D6 dataset accumulates nothing (brief §0). */
const REQUIRED = ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_BASE_URL"] as const;

/** Present = degraded-gracefully features light up; absent = fallbacks. */
const OPTIONAL = [
  "NEXT_PUBLIC_POSTHOG_HOST",
  "ANTHROPIC_API_KEY",
  "PAYMENTS_PROVIDER",
] as const;

export function GET() {
  const present = (k: string) => Boolean(process.env[k]);
  const missing = REQUIRED.filter((k) => !present(k));
  return Response.json({
    ok: missing.length === 0,
    missing,
    env: Object.fromEntries([...REQUIRED, ...OPTIONAL].map((k) => [k, present(k)])),
    instrument: BIAS_INSTRUMENT_ID,
    poolVersion: BIAS_POOL_VERSION,
    ts: new Date().toISOString(),
  });
}
