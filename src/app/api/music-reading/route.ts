/**
 * GET /api/music-reading?core=<archetypeId>&mod=<modifierId|_>&tilt=<tiltId|_>&voice=
 *
 * Matrix edition: the route is a pure WRITER for a pre-computed composite (§6 —
 * the engine composed it in the result page; nothing here classifies). Inputs
 * are ENUM-LOCKED via lookupMusicComposite (unknown ids → 400), so the entire
 * input space is finite: ~250 reachable composites × 2 voices — the free read's
 * worst-case lifetime model cost is bounded at roughly a dollar, and the CDN
 * collapses 3,456 answer-combos onto those keys (§19.A). Artists never reach
 * this route anymore (decision (i): they're a deterministic receipt in the page).
 */
import { lookupMusicComposite } from "@/content/music";
import { narrateMusic } from "@/llm";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const found = lookupMusicComposite(
    searchParams.get("core") ?? "",
    searchParams.get("mod") ?? "_",
    searchParams.get("tilt") ?? "_",
  );
  if (!found) {
    return Response.json({ error: "unknown_composite" }, { status: 400 });
  }
  const voice = searchParams.get("voice") === "online" ? "online" : "classic";
  const { reading, source } = await narrateMusic(found.composite, found.coreTags, voice);

  return Response.json(
    { reading, source, key: found.composite.cacheKey },
    {
      headers: {
        // model/local are deterministic per (composite, voice) → cache hard.
        // A transient failure (fallback) must never be pinned for a year.
        "Cache-Control":
          source === "fallback"
            ? "no-store"
            : "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    },
  );
}
