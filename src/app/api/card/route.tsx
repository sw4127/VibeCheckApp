/**
 * GET /api/card?format=&archetype=&player=&v=&t=a,b,c&pos=&nat=&int=&fla=
 *
 * Server-rendered share card via Satori (next/og === @vercel/og). Pure function
 * of its query params → CDN-cacheable + reusable as the OG unfurl image.
 *
 * Design is LOGIC-DRIVEN, not random (see content/world-cup/design.ts): the
 * background palette comes from nationality COLOURS, the background motif from
 * the player's position, and how loud the motif reads from our style-axes. No
 * club badges, no flag images, no likeness — typography + original shapes only.
 *
 * Satori CSS subset: flexbox only, inline styles, every element with 2+ children
 * sets display:flex. That shapes the markup (and why motifs are built from divs).
 */
import { ImageResponse } from "next/og";
import {
  buildCardDesign,
  POSITION_INFO,
  type Motif,
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

function num(value: string | null): number | undefined {
  if (value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n / 100 : undefined;
}

/** Background motif built from plain divs (Satori-safe), one per position. */
function renderMotif(motif: Motif, accent: string, px: (n: number) => number) {
  const ring = (size: number, child?: React.ReactNode) => (
    <div
      style={{
        width: px(size),
        height: px(size),
        borderRadius: 9999,
        border: `${px(7)}px solid ${accent}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {child}
    </div>
  );
  const bar = (w: number, h: number, extra: React.CSSProperties = {}) => (
    <div style={{ width: px(w), height: px(h), background: accent, ...extra }} />
  );

  switch (motif) {
    case "target":
      return (
        <div style={{ position: "absolute", right: px(-180), top: px(180), display: "flex" }}>
          {ring(760, ring(540, ring(320)))}
        </div>
      );
    case "lines":
      return (
        <div
          style={{
            position: "absolute",
            right: px(-120),
            top: px(120),
            display: "flex",
            flexDirection: "column",
            gap: px(44),
            transform: "rotate(-28deg)",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex" }}>{bar(960, 12, { borderRadius: px(8) })}</div>
          ))}
        </div>
      );
    case "radiate":
      return (
        <div
          style={{
            position: "absolute",
            right: px(-40),
            top: px(300),
            width: px(560),
            height: px(560),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[-60, -30, 0, 30, 60, 90].map((a) => (
            <div
              key={a}
              style={{
                position: "absolute",
                width: px(560),
                height: px(9),
                background: accent,
                borderRadius: px(6),
                transform: `rotate(${a}deg)`,
              }}
            />
          ))}
        </div>
      );
    case "weave":
      return (
        <div style={{ position: "absolute", right: px(-140), top: px(260), display: "flex" }}>
          {ring(420)}
          <div style={{ display: "flex", marginLeft: px(-200) }}>{ring(420)}</div>
        </div>
      );
    case "shield":
      return (
        <div
          style={{
            position: "absolute",
            right: px(-50),
            top: px(170),
            display: "flex",
            flexDirection: "row",
            gap: px(26),
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex" }}>{bar(44, 560, { borderRadius: px(10) })}</div>
          ))}
        </div>
      );
    case "frame":
      return (
        <div
          style={{
            position: "absolute",
            right: px(-30),
            top: px(150),
            display: "flex",
            flexDirection: "column",
          }}
        >
          {bar(620, 16, { borderRadius: px(8) })}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: px(620) }}>
            {bar(16, 440)}
            {bar(16, 440)}
          </div>
        </div>
      );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const format = pick<Format>(searchParams.get("format"), ["story", "square", "og"], "story");
  const archetype = (searchParams.get("archetype") ?? "The Unknown").slice(0, 40);
  const player = (searchParams.get("player") ?? "Your Match").slice(0, 40);
  const verdict = (searchParams.get("v") ?? "").slice(0, 240);
  const traits = (searchParams.get("t") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const positions = Object.keys(POSITION_INFO) as Position[];
  const design = buildCardDesign({
    position: pick<Position>(searchParams.get("pos"), positions, "midfielder"),
    nation: searchParams.get("nat") ?? undefined,
    intensity: num(searchParams.get("int")),
    flair: num(searchParams.get("fla")),
  });
  const p = design.palette;

  const { w, h } = SIZES[format];
  const isOg = format === "og";
  const s = isOg ? 0.62 : format === "square" ? 0.92 : 1;
  const px = (n: number) => Math.round(n * s);

  const element = (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: px(isOg ? 56 : 90),
        backgroundImage: `linear-gradient(150deg, ${p.from}, ${p.to})`,
        color: p.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Position motif, nationality-accent, behind the content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: "flex",
          opacity: design.motifOpacity,
        }}
      >
        {renderMotif(design.motif, p.accent, px)}
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: px(34),
            letterSpacing: px(8),
            fontWeight: 800,
            color: p.accent,
          }}
        >
          VIBE CHECK
        </div>
        <div style={{ display: "flex", fontSize: px(24), color: p.sub, marginTop: px(6) }}>
          Which World Cup player matches your vibe?
        </div>
      </div>

      {/* Verdict block */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: px(26), letterSpacing: px(4), color: p.sub }}>
          YOUR VIBE IS
        </div>
        <div style={{ display: "flex", fontSize: px(92), fontWeight: 800, lineHeight: 1.02, marginTop: px(8) }}>
          {archetype}
        </div>
        <div style={{ display: "flex", fontSize: px(26), letterSpacing: px(4), color: p.sub, marginTop: px(28) }}>
          YOU PLAY LIKE
        </div>
        <div style={{ display: "flex", fontSize: px(64), fontWeight: 800, color: p.accent, marginTop: px(6) }}>
          {player}
        </div>
        {design.caption ? (
          <div style={{ display: "flex", fontSize: px(24), color: p.sub, marginTop: px(10), letterSpacing: px(2) }}>
            {design.caption}
          </div>
        ) : null}

        {verdict && !isOg ? (
          <div style={{ display: "flex", fontSize: px(34), lineHeight: 1.32, color: p.text, marginTop: px(32) }}>
            {verdict}
          </div>
        ) : null}

        {traits.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: px(16), marginTop: px(34) }}>
            {traits.map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  fontSize: px(28),
                  fontWeight: 700,
                  color: p.text,
                  border: `${px(2)}px solid ${p.accent}`,
                  borderRadius: px(999),
                  padding: `${px(10)}px ${px(26)}px`,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer URL — every share is an ad */}
      <div style={{ display: "flex", fontSize: px(28), fontWeight: 700, color: p.sub, letterSpacing: px(2) }}>
        vibecheck.app
      </div>
    </div>
  );

  return new ImageResponse(element, {
    width: w,
    height: h,
    headers: {
      "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
