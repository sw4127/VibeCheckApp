/**
 * GET /api/calibrate?text=<free text>&taps=c,a,n
 *
 * Slice 3 — translates a free-text self-description into the EXISTING C/A/N
 * calibration option ids (§6: translator, not judge). `taps` lists which gaps to
 * fill (the traits still unmeasured). Deterministic by query → identical text +
 * gap-set serve from the edge. Only a real model result is cached; a no-key /
 * error returns {} + no-store, so the page falls back to the manual taps.
 */
import { narrateCalibration } from "@/llm";
import { PAID_TAPS } from "@/lib/paidTaps";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") ?? "";
  const requested = new Set((searchParams.get("taps") ?? "").split(",").map((s) => s.trim()));
  const taps = PAID_TAPS.filter((t) => requested.has(t.id));

  const { ids, source } = await narrateCalibration(text, taps);

  return Response.json(
    { ids, source },
    {
      headers: {
        "Cache-Control":
          source === "model"
            ? "public, s-maxage=31536000, stale-while-revalidate=86400"
            : "no-store",
      },
    },
  );
}
