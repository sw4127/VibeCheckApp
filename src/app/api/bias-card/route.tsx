/**
 * GET /api/bias-card?format=&b=&l=
 *
 * The Prestige-Bias share card (memo D3: "the most shareable statistic").
 * Takes the RAW rating passes (same ?b=&l= as /bias/result) and RECOMPUTES
 * the verdict in-process — a pure function of its query params, so it's
 * CDN-cacheable AND unforgeable: no query string can make the card claim a
 * number the engine wouldn't compute (N3). Typography-driven, no imagery,
 * Satori CSS subset only (flexbox, bundled Fraunces) — same contract as
 * /api/card.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { computeBiasResult, decodeBiasRatings } from "@/engine/bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID, BIAS_POOL_VERSION } from "@/content/bias/items";
import { VERDICT_COPY } from "@/content/bias/copy";
import { baseUrl } from "@/lib/site";

export const runtime = "nodejs";

const FONT_DIR = join(process.cwd(), "src", "fonts");
const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));

const SIZES = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  og: { w: 1200, h: 630 },
} as const;
type Format = keyof typeof SIZES;

const GOLD = "hsl(42, 80%, 62%)";
const BASE = "#0B0A08";
const MUTED = "rgba(255,255,255,0.55)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format: Format = (["story", "square", "og"] as const).find(
    (f) => f === searchParams.get("format"),
  ) ?? "story";

  // RT-7b: a card is only renderable against the pool version that produced
  // the ratings — a stale/absent pv must never render today's pool's numbers.
  if (searchParams.get("pv") !== String(BIAS_POOL_VERSION)) {
    return new Response(JSON.stringify({ error: "pool version mismatch" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const blind = decodeBiasRatings(BIAS_CLIPS, searchParams.get("b") ?? undefined);
  const labeled = decodeBiasRatings(BIAS_CLIPS, searchParams.get("l") ?? undefined);
  if (!blind || !labeled) {
    return new Response(JSON.stringify({ error: "invalid ratings" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const result = computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled);
  const verdict = VERDICT_COPY[result.verdict];
  const swayed = result.swayShare !== null
    ? `moved with the label on ${Math.round(result.swayShare * result.movableCount)} of ${result.movableCount} clips`
    : null;
  const host = baseUrl().replace(/^https?:\/\//, "");

  const { w, h } = SIZES[format];
  const isOg = format === "og";
  // One scale factor per format keeps the composition identical (story is the
  // hero; square/og are crops of the same hierarchy, not new designs).
  const s = format === "story" ? 1 : format === "square" ? 0.86 : 0.62;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BASE,
          backgroundImage:
            "linear-gradient(160deg, rgba(212,165,71,0.14) 0%, rgba(11,10,8,0) 38%), linear-gradient(340deg, rgba(212,165,71,0.10) 0%, rgba(11,10,8,0) 42%)",
          color: "#fff",
          padding: 64 * s,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26 * s,
            fontFamily: "Fraunces",
            fontWeight: 600,
            letterSpacing: "0.42em",
            color: GOLD,
          }}
        >
          THE PRESTIGE TEST
        </div>
        <div
          style={{
            display: "flex",
            marginTop: (isOg ? 18 : 44) * s,
            fontSize: 300 * s,
            lineHeight: 1,
            fontFamily: "Fraunces",
            fontWeight: 900,
            color: GOLD,
          }}
        >
          {`${result.pct > 0 ? "+" : ""}${result.pct}%`}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22 * s,
            fontSize: 30 * s,
            color: MUTED,
          }}
        >
          my ratings moved when the famous names showed up
        </div>
        <div
          style={{
            display: "flex",
            marginTop: (isOg ? 26 : 58) * s,
            fontSize: 76 * s,
            lineHeight: 1.05,
            fontFamily: "Fraunces",
            fontWeight: 900,
          }}
        >
          {verdict.title}
        </div>
        {swayed && !isOg ? (
          <div
            style={{
              display: "flex",
              marginTop: 30 * s,
              padding: `${12 * s}px ${28 * s}px`,
              borderRadius: 999,
              border: "1.5px solid rgba(255,255,255,0.18)",
              fontSize: 26 * s,
              color: MUTED,
            }}
          >
            {swayed}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: (isOg ? 28 : 72) * s,
            fontSize: 26 * s,
            fontFamily: "Fraunces",
            fontWeight: 600,
            color: GOLD,
          }}
        >
          {`${host}/bias — get your number`}
        </div>
      </div>
    ),
    {
      width: w,
      height: h,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900 as const, style: "normal" as const },
        { name: "Fraunces", data: fontSemi, weight: 600 as const, style: "normal" as const },
      ],
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
