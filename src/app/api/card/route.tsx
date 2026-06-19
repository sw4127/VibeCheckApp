/**
 * GET /api/card?format=&archetype=&arch=&player=&v=&t=a,b,c&pos=&nat=&sig=&rar=
 *
 * Server-rendered share card via Satori (next/og === @vercel/og). Pure function
 * of its query params → CDN-cacheable + reusable as the OG unfurl image.
 *
 * Editorial poster: the archetype NAME is the hero, set in the bundled branded
 * display serif (Fraunces) — the same face the web uses. Neutral chrome base +
 * a single nationality accent (with a soft accent glow); a vibe-signature and a
 * rarity stat anchor the bottom. No badges/flags/likeness — type + colour only.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { buildCardDesign, POSITION_INFO, type Position } from "@/content/world-cup/design";
import { baseUrl } from "@/lib/site";
import { Sigil } from "@/lib/sigil";

export const runtime = "nodejs";

// Bundled display font (same .woff the web loads) — required for Satori (line 47).
// Read with fs (dev Turbopack can't fetch() a file: URL); traced into the
// function via outputFileTracingIncludes in next.config.ts.
const FONT_DIR = join(process.cwd(), "src", "fonts");
const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));

const SIZES = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  og: { w: 1200, h: 630 },
} as const;
type Format = keyof typeof SIZES;

/** §16.E: the §5/§7 theme enum drives the MUSIC card accent (per-archetype, designed). */
const THEME_ACCENTS: Record<string, string> = {
  ember: "#ff7a45",
  midnight: "#6ea8ff",
  neon: "#c04dff",
  bloom: "#ff5fa2",
  static: "#e8e8ea",
};

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const format = pick<Format>(searchParams.get("format"), ["story", "square", "og"], "story");
  const archetype = (searchParams.get("archetype") ?? "The Unknown").slice(0, 40);
  const player = (searchParams.get("player") ?? "Your Match").slice(0, 40);
  const verdict = (searchParams.get("v") ?? "").slice(0, 240);
  const traits = (searchParams.get("t") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 3);
  const sig = (searchParams.get("sig") ?? "")
    .split(",")
    .map((x) => Math.max(0, Math.min(100, Number(x) || 0)));
  // Top ranked labelled rows ("Label:value|…") → the labelled card signature.
  const sigRows = (searchParams.get("sigr") ?? "")
    .split("|")
    .map((s) => {
      const i = s.lastIndexOf(":");
      return i < 0 ? null : { label: s.slice(0, i), value: Math.max(0, Math.min(100, Number(s.slice(i + 1)) || 0)) };
    })
    .filter((x): x is { label: string; value: number } => x !== null)
    .slice(0, 3);
  // §23.E — the rarity % (`rar`) is no longer rendered (implied a population
  // stat we don't have). Param tolerated for old links, ignored.
  const isMusic = searchParams.get("mode") === "music";
  const theme = searchParams.get("theme");
  const isPaid = searchParams.get("tier") === "paid"; // §20.B5 collector card

  const design = buildCardDesign({
    position: pick<Position>(searchParams.get("pos"), Object.keys(POSITION_INFO) as Position[], "midfielder"),
    nation: searchParams.get("nat") ?? undefined,
  });
  // Music mode: accent comes from the archetype's designed theme (§16.E), on
  // the same neutral chrome; WC mode keeps the nationality accent.
  const p =
    isMusic && theme && THEME_ACCENTS[theme]
      ? { ...design.palette, accent: THEME_ACCENTS[theme] }
      : design.palette;

  const { w, h } = SIZES[format];
  const isOg = format === "og";
  const s = isOg ? 0.6 : format === "square" ? 0.9 : 1;
  const px = (n: number) => Math.round(n * s);
  const pad = px(isOg ? 56 : 84);
  const heroSize = archetype.length > 12 ? px(120) : px(150);

  const Label = (text: string) => (
    <div style={{ display: "flex", fontSize: px(24), letterSpacing: px(5), color: p.sub, fontWeight: 700 }}>
      {text}
    </div>
  );

  // Vibe-signature. Downloaded shares (story/square) get the labelled ranked
  // mini-chart — the proof of real analysis, on the artifact that travels. The
  // OG link-preview keeps the compact vertical bars (narrow column). Static, no
  // animation (Satori subset).
  const Signature =
    sigRows.length > 0 && !isOg ? (
      <div style={{ display: "flex", flexDirection: "column", gap: px(14), width: "100%" }}>
        {sigRows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: px(16) }}>
            <div style={{ display: "flex", width: px(248), fontSize: px(26), fontWeight: 700, color: p.text }}>
              {r.label}
            </div>
            <div style={{ display: "flex", flex: 1, height: px(16), background: `${p.accent}26`, borderRadius: px(8) }}>
              <div
                style={{
                  display: "flex",
                  width: `${Math.max(6, r.value)}%`,
                  height: "100%",
                  background: p.accent,
                  borderRadius: px(8),
                  opacity: 1 - i * 0.2,
                }}
              />
            </div>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: px(32), fontWeight: 900, color: p.accent }}>
              {r.value}
            </div>
          </div>
        ))}
      </div>
    ) : sig.length >= 3 ? (
      <div style={{ display: "flex", alignItems: "flex-end", gap: px(10), height: px(72) }}>
        {sig.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: px(20), height: "100%" }}>
            <div style={{ display: "flex", width: "100%", height: `${Math.max(8, v)}%`, background: p.accent, borderRadius: px(4) }} />
          </div>
        ))}
      </div>
    ) : null;

  const Hero = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {Label("YOUR VIBE IS")}
      <div
        style={{
          display: "flex",
          fontFamily: "Fraunces",
          fontWeight: 900,
          fontSize: heroSize,
          lineHeight: 0.92,
          letterSpacing: px(-2),
          color: p.text,
          marginTop: px(10),
        }}
      >
        {archetype}
      </div>
    </div>
  );

  const PlayerBlock = isMusic ? null : (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {Label("YOU PLAY LIKE")}
      <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: px(56), color: p.accent, marginTop: px(4) }}>
        {player}
      </div>
      {design.caption ? (
        <div style={{ display: "flex", fontSize: px(23), color: p.sub, marginTop: px(8), letterSpacing: px(1) }}>
          {design.caption}
        </div>
      ) : null}
    </div>
  );

  const Verdict = verdict ? (
    <div style={{ display: "flex", fontSize: px(34), lineHeight: 1.34, color: p.text }}>{verdict}</div>
  ) : null;

  const Traits = traits.length > 0 ? (
    <div style={{ display: "flex", flexWrap: "wrap", gap: px(14) }}>
      {traits.map((t) => (
        <div
          key={t}
          style={{
            display: "flex",
            fontSize: px(26),
            fontWeight: 700,
            color: p.text,
            border: `${px(2)}px solid ${p.accent}55`,
            borderRadius: px(999),
            padding: `${px(9)}px ${px(24)}px`,
          }}
        >
          {t}
        </div>
      ))}
    </div>
  ) : null;

  const Stats = Signature ? (
    <div
      style={{
        display: "flex",
        borderTop: `${px(1)}px solid ${p.accent}26`,
        paddingTop: px(28),
      }}
    >
      {Signature}
    </div>
  ) : null;

  // Domain derived from env (§19.C): never print a hardcoded, unowned domain
  // on a viral artifact. Falls back to the dev host locally.
  const host = (() => {
    try {
      return new URL(baseUrl()).host;
    } catch {
      return "localhost:3000";
    }
  })();

  const Footer = (
    <div style={{ display: "flex", alignItems: "center", gap: px(14), fontSize: px(28), fontWeight: 800, letterSpacing: px(1) }}>
      {/* §20.C2 — the locked sigil, the user's collectible mark (music only) */}
      {isMusic ? <Sigil size={px(52)} filled={7} colors={p.accent} /> : null}
      <span style={{ display: "flex", color: p.sub }}>Find yours →</span>
      <span style={{ display: "flex", color: p.accent }}>{host}</span>
    </div>
  );

  const Wordmark = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: px(28), letterSpacing: px(8), fontWeight: 800, color: p.accent }}>
        {isPaid ? "VIBE CHECK · THE FULL READ" : "VIBE CHECK"}
      </div>
      {isMusic && !isPaid ? (
        <div style={{ display: "flex", fontSize: px(22), color: p.sub, marginTop: px(6) }}>
          What does your taste say about you?
        </div>
      ) : null}
    </div>
  );

  const AccentGlow = (
    <div
      style={{
        position: "absolute",
        top: px(-160),
        left: px(-160),
        width: px(720),
        height: px(720),
        backgroundImage: `radial-gradient(closest-side, ${p.accent}33, transparent)`,
        display: "flex",
      }}
    />
  );

  const root = isOg ? (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: px(48),
        padding: pad,
        backgroundImage: `linear-gradient(160deg, ${p.from}, ${p.to})`,
        color: p.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {AccentGlow}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: px(22) }}>
        {Wordmark}
        {Hero}
        {PlayerBlock}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: px(20) }}>
        {Signature}
      </div>
    </div>
  ) : (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        display: "flex",
        flexDirection: "column",
        padding: pad,
        backgroundImage: `linear-gradient(160deg, ${p.from}, ${p.to})`,
        color: p.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
        justifyContent: "space-between",
      }}
    >
      {AccentGlow}
      {/* Three balanced zones fill the height — no dead middle. */}
      <div style={{ display: "flex", flexDirection: "column", gap: px(22) }}>
        {Wordmark}
        {Hero}
        {PlayerBlock}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: px(24) }}>
        {Verdict}
        {Traits}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: px(26) }}>
        {Stats}
        {Footer}
      </div>
    </div>
  );

  return new ImageResponse(root, {
    width: w,
    height: h,
    fonts: [
      { name: "Fraunces", data: fontBlack, weight: 900, style: "normal" },
      { name: "Fraunces", data: fontSemi, weight: 600, style: "normal" },
    ],
    headers: {
      "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
