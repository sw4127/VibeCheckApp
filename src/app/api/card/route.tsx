/**
 * GET /api/card?format=story|square|og&theme=...&archetype=...&player=...&v=...&t=a,b,c
 *
 * Server-rendered share card via Satori (next/og === @vercel/og). Pure function
 * of its query params → CDN-cacheable, reliable in IG/TikTok in-app browsers,
 * and reusable as the OG unfurl image. Typography + color only — no photos or
 * badges (real-people / copyright guardrails).
 *
 * Satori supports only a CSS subset: flexbox, inline styles, every element with
 * 2+ children must set display:flex. That constraint shapes the markup below.
 */
import { ImageResponse } from "next/og";
import { THEMES, type Theme } from "@/llm/schema";

export const runtime = "nodejs";

type Palette = { from: string; to: string; accent: string; text: string; sub: string };

const PALETTES: Record<Theme, Palette> = {
  ember: { from: "#1a0f0a", to: "#451409", accent: "#ff7a45", text: "#fff7f2", sub: "#e7b9a3" },
  midnight: { from: "#070b18", to: "#16203c", accent: "#6ea8ff", text: "#f1f5ff", sub: "#9fb4dd" },
  neon: { from: "#0a0a16", to: "#240a36", accent: "#c04dff", text: "#f6f0ff", sub: "#b79fd6" },
  bloom: { from: "#1a0a14", to: "#3a0a2a", accent: "#ff5fa2", text: "#fff0f7", sub: "#e3a9c6" },
  static: { from: "#101012", to: "#26262b", accent: "#e8e8ea", text: "#fafafa", sub: "#b5b5ba" },
};

const SIZES = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  og: { w: 1200, h: 630 },
} as const;
type Format = keyof typeof SIZES;

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const format = pick<Format>(searchParams.get("format"), ["story", "square", "og"], "story");
  const theme = pick<Theme>(searchParams.get("theme"), THEMES, "midnight");
  const archetype = (searchParams.get("archetype") ?? "The Unknown").slice(0, 40);
  const player = (searchParams.get("player") ?? "Your Match").slice(0, 40);
  const verdict = (searchParams.get("v") ?? "").slice(0, 240);
  const traits = (searchParams.get("t") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const p = PALETTES[theme];
  const { w, h } = SIZES[format];
  const isOg = format === "og";

  // Scale a base type ramp to the format.
  const s = isOg ? 0.62 : format === "square" ? 0.92 : 1;
  const px = (n: number) => Math.round(n * s);

  const element = (
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: px(isOg ? 56 : 90),
        backgroundImage: `linear-gradient(150deg, ${p.from}, ${p.to})`,
        color: p.text,
        fontFamily: "sans-serif",
      }}
    >
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
        <div
          style={{
            display: "flex",
            fontSize: px(92),
            fontWeight: 800,
            lineHeight: 1.02,
            marginTop: px(8),
          }}
        >
          {archetype}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: px(26),
            letterSpacing: px(4),
            color: p.sub,
            marginTop: px(28),
          }}
        >
          YOU PLAY LIKE
        </div>
        <div
          style={{
            display: "flex",
            fontSize: px(64),
            fontWeight: 800,
            color: p.accent,
            marginTop: px(6),
          }}
        >
          {player}
        </div>

        {verdict && !isOg ? (
          <div
            style={{
              display: "flex",
              fontSize: px(34),
              lineHeight: 1.32,
              color: p.text,
              marginTop: px(36),
            }}
          >
            {verdict}
          </div>
        ) : null}

        {traits.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: px(16), marginTop: px(36) }}>
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
      <div
        style={{
          display: "flex",
          fontSize: px(28),
          fontWeight: 700,
          color: p.sub,
          letterSpacing: px(2),
        }}
      >
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
