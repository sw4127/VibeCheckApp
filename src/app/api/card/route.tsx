/**
 * GET /api/card?format=&archetype=&arch=&player=&v=&t=a,b,c&pos=&nat=
 *
 * Server-rendered share card via Satori (next/og === @vercel/og). Pure function
 * of its query params → CDN-cacheable + reusable as the OG unfurl image.
 *
 * Premium-minimalist: a single, continuous, ultra-thin line-art glyph keyed to
 * the archetype's vibe (flame, mountain, infinity…) floats on a clean open
 * gradient — no pitch, no boxes, no heavy shapes. Accent = nationality colour,
 * drawn with a subtle opacity gradient + soft glow. No badges/flags/likeness.
 */
import { ImageResponse } from "next/og";
import {
  archetypeGlyph,
  buildCardDesign,
  POSITION_INFO,
  type Position,
} from "@/content/world-cup/design";

export const runtime = "nodejs";

const SIZES = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  og: { w: 1200, h: 630 },
} as const;
type Format = keyof typeof SIZES;

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** The floating line-art glyph: soft glow + ultra-thin accent-gradient stroke. */
function glyph(d: string, accent: string, size: number) {
  const gradId = "stroke-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accent} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* soft glow */}
      <path d={d} fill="none" stroke={accent} strokeWidth={4} strokeOpacity={0.1} strokeLinecap="round" strokeLinejoin="round" />
      {/* hero hairline */}
      <path d={d} fill="none" stroke={`url(#${gradId})`} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const format = pick<Format>(searchParams.get("format"), ["story", "square", "og"], "story");
  const archetype = (searchParams.get("archetype") ?? "The Unknown").slice(0, 40);
  const archId = searchParams.get("arch") ?? undefined;
  const player = (searchParams.get("player") ?? "Your Match").slice(0, 40);
  const verdict = (searchParams.get("v") ?? "").slice(0, 240);
  const traits = (searchParams.get("t") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 3);

  const positions = Object.keys(POSITION_INFO) as Position[];
  const design = buildCardDesign({
    position: pick<Position>(searchParams.get("pos"), positions, "midfielder"),
    nation: searchParams.get("nat") ?? undefined,
  });
  const p = design.palette;
  const d = archetypeGlyph(archId);

  const { w, h } = SIZES[format];
  const isOg = format === "og";
  const s = isOg ? 0.62 : format === "square" ? 0.92 : 1;
  const px = (n: number) => Math.round(n * s);
  const pad = px(isOg ? 56 : 80);

  const glyphSize = isOg
    ? Math.min((w - 2 * pad) * 0.4, h - 2 * pad)
    : Math.round((h - 2 * pad) * (format === "square" ? 0.34 : 0.3));

  const Wordmark = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: px(32), letterSpacing: px(8), fontWeight: 800, color: p.accent }}>
        VIBE CHECK
      </div>
      {!isOg ? (
        <div style={{ display: "flex", fontSize: px(23), color: p.sub, marginTop: px(6) }}>
          Which World Cup player matches your vibe?
        </div>
      ) : null}
    </div>
  );

  const Graphic = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
      {glyph(d, p.accent, glyphSize)}
    </div>
  );

  const Identity = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: px(24), letterSpacing: px(4), color: p.sub }}>YOUR VIBE IS</div>
      <div style={{ display: "flex", fontSize: px(isOg ? 72 : 86), fontWeight: 800, lineHeight: 1.02, marginTop: px(6) }}>
        {archetype}
      </div>
      <div style={{ display: "flex", fontSize: px(24), letterSpacing: px(4), color: p.sub, marginTop: px(24) }}>
        YOU PLAY LIKE
      </div>
      <div style={{ display: "flex", fontSize: px(isOg ? 48 : 60), fontWeight: 800, color: p.accent, marginTop: px(4) }}>
        {player}
      </div>
      {design.caption ? (
        <div style={{ display: "flex", fontSize: px(23), color: p.sub, marginTop: px(10), letterSpacing: px(2) }}>
          {design.caption}
        </div>
      ) : null}
    </div>
  );

  const TraitsAndVerdict = !isOg ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {verdict ? (
        <div style={{ display: "flex", fontSize: px(33), lineHeight: 1.32, color: p.text }}>{verdict}</div>
      ) : null}
      {traits.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: px(14), marginTop: px(28) }}>
          {traits.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: px(27),
                fontWeight: 700,
                color: p.text,
                border: `${px(2)}px solid ${p.accent}`,
                borderRadius: px(999),
                padding: `${px(9)}px ${px(24)}px`,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  ) : null;

  const Footer = (
    <div style={{ display: "flex", fontSize: px(26), fontWeight: 700, color: p.sub, letterSpacing: px(2) }}>
      vibecheck.app
    </div>
  );

  const root = isOg ? (
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: px(40),
        padding: pad,
        backgroundImage: `linear-gradient(150deg, ${p.from}, ${p.to})`,
        color: p.text,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: px(24) }}>
        {Wordmark}
        {Identity}
        {Footer}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {glyph(d, p.accent, glyphSize)}
      </div>
    </div>
  ) : (
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: pad,
        backgroundImage: `linear-gradient(150deg, ${p.from}, ${p.to})`,
        color: p.text,
        fontFamily: "sans-serif",
      }}
    >
      {Wordmark}
      {Graphic}
      {Identity}
      {TraitsAndVerdict}
      {Footer}
    </div>
  );

  return new ImageResponse(root, {
    width: w,
    height: h,
    headers: {
      "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
