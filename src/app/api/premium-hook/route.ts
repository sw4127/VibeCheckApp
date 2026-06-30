/**
 * GET /api/premium-hook?a=<archetype>&s=<top signal>&ar=<artist,artist>
 *
 * A1b — the cached Haiku polish of the paywall hook (D2). Deterministic by query
 * string, so identical (archetype · signal · artists) serve from the edge. Only
 * a REAL model hook gets the long cache header — a no-key/error result returns
 * `hook: null` (the page falls back to the deterministic A1a hook) and is NOT
 * cached, so a transient failure can't poison the cache.
 */
import { narratePaywallHook } from "@/llm";
import { cleanNames } from "@/lib/sanitize";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const archetype = (searchParams.get("a") ?? "").slice(0, 40);
  const topSignal = (searchParams.get("s") ?? "").slice(0, 40);
  const artists = cleanNames((searchParams.get("ar") ?? "").split(","), 3);

  if (!archetype) {
    return Response.json({ hook: null, source: "local" }, { headers: { "Cache-Control": "no-store" } });
  }

  const { hook, source } = await narratePaywallHook({ archetype, topSignal, artists });

  return Response.json(
    { hook, source },
    {
      headers: {
        // Cache only a genuine model hook; never cache a fallback/no-key result.
        "Cache-Control":
          source === "model"
            ? "public, s-maxage=31536000, stale-while-revalidate=86400"
            : "no-store",
      },
    },
  );
}
