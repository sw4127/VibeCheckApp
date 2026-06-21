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
import { Sigil, THEME_HUES } from "@/lib/sigil";

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
    // Music sends its top 3 (ranked); football sends all 5 (the FUT stat line).
    .slice(0, 5);
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
  // Music keeps its dark theme palette. FOOTBALL now mirrors the bright fluid
  // quiz: a light stage + dark ink (the 2026 palette lives in the mesh below).
  const basePalette =
    isMusic && theme && THEME_ACCENTS[theme] ? { ...design.palette, accent: THEME_ACCENTS[theme] } : design.palette;
  const p = isMusic
    ? basePalette
    : { from: "#E6E6DD", to: "#E6E6DD", accent: design.palette.accent, text: "#15171C", sub: "#5B6573" };

  // §Fluid background for the football card — layered radial gradients (a static,
  // Satori-safe mirror of the quiz's FluidField), leaning toward the nation
  // accent. Palette is an intentional decoupled copy so deleting the seasonal
  // /quiz never breaks this route.
  // Darken light nationality accents (BRA/ESP golds, etc.) so they read as a
  // stat bar + mesh lead on the bright card. Numbers/labels are already ink.
  const readableAccent = (() => {
    if (isMusic) return p.accent;
    const m = p.accent.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum <= 0.62) return p.accent;
    const d = (v: number) => Math.round(v * 0.55).toString(16).padStart(2, "0");
    return `#${d(r)}${d(g)}${d(b)}`;
  })();

  const FB_FLUID = ["#38C0FF", "#00A35E", "#FF7A18", "#FF2E4C", "#2A3CD0", "#FBBF3F"];
  const fluidBg = () => {
    const anchors = ["14% 16%", "84% 20%", "22% 82%", "80% 74%", "48% 46%", "6% 56%"];
    const blobs = [readableAccent, ...FB_FLUID].map(
      (c, i) => `radial-gradient(circle at ${anchors[i % anchors.length]}, ${c}73 0%, transparent 46%)`,
    );
    return [`linear-gradient(180deg, #E6E6DDE6, #E6E6DD00 28%)`, ...blobs].join(", ");
  };
  // Music card: the same ambient mesh, dark + moody, in the archetype's theme
  // hue (analogous harmony — mirrors the music quiz's drifted field). hsla so
  // Satori parses the alpha (it can't take a hex suffix on hsl).
  const musicHue = THEME_HUES[theme ?? ""] ?? 250;
  const musicFluidBg = () => {
    const anchors = ["16% 14%", "84% 22%", "20% 84%", "82% 76%"];
    return [
      `hsla(${musicHue}, 74%, 58%, 0.62)`,
      `hsla(${(musicHue + 30) % 360}, 70%, 54%, 0.56)`,
      `hsla(${(musicHue + 330) % 360}, 70%, 54%, 0.56)`,
      `hsla(${(musicHue + 18) % 360}, 66%, 52%, 0.5)`,
    ]
      .map((c, i) => `radial-gradient(circle at ${anchors[i]}, ${c} 0%, transparent 55%)`)
      .join(", ");
  };
  const rootBg = isMusic ? musicFluidBg() : fluidBg();

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

  // Small black/white soccer-ball emblem (Satori-safe: circle + pentagon path).
  const ballSvg = (s: number) => {
    const c = s / 2;
    const R = c - 1.5;
    const pr = R * 0.42;
    const pt = (a: number): [number, number] => {
      const t = ((a - 90) * Math.PI) / 180;
      return [c + pr * Math.cos(t), c + pr * Math.sin(t)];
    };
    const pts = [-90, -18, 54, 126, 198].map(pt);
    const d =
      `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} ` +
      pts.slice(1).map((q) => `L${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ") +
      " Z";
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "flex" }}>
        <circle cx={c} cy={c} r={R} fill="#f5f5f6" stroke="#0c0d12" strokeWidth={1.5} />
        <path d={d} fill="#14171d" />
      </svg>
    );
  };

  // Vibe-signature on downloaded shares (story/square; OG keeps vertical bars).
  // MUSIC = labelled ranked rows (depth = WTP). FOOTBALL = the fun FUT-style
  // "stat line" — fixed order, big serif ratings, ball emblem. Static (Satori).
  const Signature =
    sigRows.length > 0 && !isOg ? (
      isMusic ? (
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
      ) : (
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(12), marginBottom: px(18) }}>
            {ballSvg(px(34))}
            <div style={{ display: "flex", fontSize: px(24), letterSpacing: px(5), fontWeight: 700, color: p.text }}>
              YOUR STAT LINE
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: px(16), width: "100%" }}>
            {sigRows.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: px(18) }}>
                <div style={{ display: "flex", width: px(232), fontSize: px(22), fontWeight: 700, letterSpacing: px(1), color: p.text }}>
                  {r.label.toUpperCase()}
                </div>
                <div style={{ display: "flex", flex: 1, height: px(12), background: "rgba(0,0,0,0.10)", borderRadius: px(6) }}>
                  <div style={{ display: "flex", width: `${Math.max(5, r.value)}%`, height: "100%", background: readableAccent, borderRadius: px(6) }} />
                </div>
                <div style={{ display: "flex", width: px(78), justifyContent: "flex-end", fontFamily: "Fraunces", fontSize: px(40), fontWeight: 900, color: p.text }}>
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    ) : sig.length >= 3 ? (
      <div style={{ display: "flex", alignItems: "flex-end", gap: px(10), height: px(72) }}>
        {sig.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: px(20), height: "100%" }}>
            <div style={{ display: "flex", width: "100%", height: `${Math.max(8, v)}%`, background: isMusic ? p.accent : readableAccent, borderRadius: px(4) }} />
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
      <div style={{ display: "flex", fontFamily: "Fraunces", fontWeight: 600, fontSize: px(56), color: isMusic ? p.accent : p.text, marginTop: px(4) }}>
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
            border: `${px(2)}px solid ${isMusic ? `${p.accent}55` : "rgba(0,0,0,0.16)"}`,
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
        borderTop: `${px(1)}px solid ${isMusic ? `${p.accent}26` : "rgba(0,0,0,0.12)"}`,
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
      <span style={{ display: "flex", color: isMusic ? p.accent : p.text }}>{host}</span>
    </div>
  );

  const Wordmark = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: px(28), letterSpacing: px(8), fontWeight: 800, color: isMusic ? p.accent : p.text }}>
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
        backgroundColor: isMusic ? "#08090d" : "#E6E6DD",
        backgroundImage: rootBg,
        color: p.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {isMusic ? AccentGlow : null}
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
        backgroundColor: isMusic ? "#08090d" : "#E6E6DD",
        backgroundImage: rootBg,
        color: p.text,
        fontFamily: "sans-serif",
        overflow: "hidden",
        justifyContent: "space-between",
      }}
    >
      {isMusic ? AccentGlow : null}
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
