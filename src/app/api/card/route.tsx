/**
 * GET /api/card?format=&archetype=&player=&v=&t=a,b,c&pos=&nat=&int=&fla=
 *
 * Server-rendered share card via Satori (next/og === @vercel/og). Pure function
 * of its query params → CDN-cacheable + reusable as the OG unfurl image.
 *
 * Design = an ultra-minimal TACTICAL BOARD. A faint vector pitch blueprint is
 * the background grid; one bold "movement vector" (the hero element) is shaped
 * to embody the player's role, attacking left→right:
 *   spear=central run to goal · flank=jagged wing run into the box ·
 *   hub=passing node · boxtobox=sweeping S · wall=immovable 90° block · arc=keeper
 * Style-axes (intensity/flair) drive how violent vs. immovable the vector reads.
 * Nationality COLOUR is the accent. No badges, flags, club identity, or likeness.
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

const PITCH_LINE = "rgba(255,255,255,0.14)";

/** A tactical board: faint pitch + one role-shaped movement vector (attacking →). */
function tacticalBoard(motif: Motif, pw: number, ph: number, accent: string, energy: number) {
  const mx = pw * 0.06;
  const my = ph * 0.1;
  const lw = Math.max(1, Math.round(Math.min(pw, ph) * 0.006));
  const vw = Math.max(2, Math.round(Math.min(pw, ph) * 0.02 * (0.8 + energy * 0.7)));
  const vOpacity = 0.72 + energy * 0.24;
  const boxW = pw * 0.13;
  const boxH = ph * 0.5;
  const boxY = (ph - boxH) / 2;
  const cr = Math.min(pw, ph) * 0.14;

  const pitch = [
    <rect key="p" x={mx} y={my} width={pw - 2 * mx} height={ph - 2 * my} rx={Math.round(lw * 3)} fill="none" stroke={PITCH_LINE} strokeWidth={lw} />,
    <line key="h" x1={pw / 2} y1={my} x2={pw / 2} y2={ph - my} stroke={PITCH_LINE} strokeWidth={lw} />,
    <circle key="c" cx={pw / 2} cy={ph / 2} r={cr} fill="none" stroke={PITCH_LINE} strokeWidth={lw} />,
    <circle key="cs" cx={pw / 2} cy={ph / 2} r={lw * 1.4} fill={PITCH_LINE} />,
    <rect key="lb" x={mx} y={boxY} width={boxW} height={boxH} fill="none" stroke={PITCH_LINE} strokeWidth={lw} />,
    <rect key="rb" x={pw - mx - boxW} y={boxY} width={boxW} height={boxH} fill="none" stroke={PITCH_LINE} strokeWidth={lw} />,
  ];

  const poly = (pts: number[][], key: string) => (
    <polyline
      key={key}
      points={pts.map((p) => `${Math.round(p[0])},${Math.round(p[1])}`).join(" ")}
      fill="none"
      stroke={accent}
      strokeWidth={vw}
      strokeLinejoin="miter"
      strokeLinecap="round"
    />
  );
  const dot = (x: number, y: number, key: string, scale = 1.9) => (
    <circle key={key} cx={x} cy={y} r={vw * scale} fill={accent} />
  );

  let vector: React.ReactNode[] = [];

  switch (motif) {
    case "flank": {
      // Jagged run down the wing, breaking into the right box. Chaotic at high energy.
      const j = 0.6 + energy * 0.9;
      vector = [
        poly(
          [
            [pw * 0.18, ph * 0.8],
            [pw * 0.34, ph * (0.88 + 0.04 * (j - 1))],
            [pw * 0.49, ph * (0.68 - 0.05 * j)],
            [pw * 0.62, ph * (0.88 + 0.05 * (j - 1))],
            [pw * 0.78, ph * 0.6],
            [pw * 0.81, ph * 0.46],
          ],
          "v",
        ),
        dot(pw * 0.81, ph * 0.46, "d"),
      ];
      if (energy > 0.6) {
        vector.push(
          <line key="spark" x1={pw * 0.5} y1={ph * 0.6} x2={pw * 0.6} y2={ph * 0.46} stroke={accent} strokeWidth={Math.round(vw * 0.6)} strokeLinecap="round" />,
        );
      }
      break;
    }
    case "spear": {
      // Central penetrating dart to goal, with a spearhead.
      const tipX = pw * 0.82;
      const tipY = ph * 0.5;
      vector = [
        poly([[pw * 0.4, ph * 0.5], [pw * 0.6, ph * 0.43], [tipX, tipY]], "v"),
        poly([[tipX - pw * 0.08, tipY - ph * 0.08], [tipX, tipY], [tipX - pw * 0.08, tipY + ph * 0.08]], "head"),
        dot(tipX, tipY, "d", 1.5),
      ];
      break;
    }
    case "hub": {
      // Passing node fanning out — the one dot is the hub.
      const hx = pw * 0.44;
      const hy = ph * 0.5;
      const targets = [
        [pw * 0.8, ph * 0.5],
        [pw * 0.66, ph * 0.24],
        [pw * 0.66, ph * 0.76],
        [pw * 0.28, ph * 0.3],
      ];
      vector = targets.map((t, i) => poly([[hx, hy], t], `v${i}`));
      vector.push(dot(hx, hy, "hub", 2.4));
      break;
    }
    case "boxtobox": {
      // Sweeping S, end to end.
      const d = `M ${mx + pw * 0.06} ${ph * 0.5} C ${pw * 0.34} ${ph * 0.16}, ${pw * 0.56} ${ph * 0.84}, ${pw - mx - pw * 0.06} ${ph * 0.5}`;
      vector = [
        <path key="v" d={d} fill="none" stroke={accent} strokeWidth={vw} strokeLinecap="round" />,
        dot(pw - mx - pw * 0.06, ph * 0.5, "d", 1.6),
      ];
      break;
    }
    case "wall": {
      // Monolithic 90° block — immovable, symmetric, zero angle. No dot.
      const x = pw * 0.36;
      const w = pw * 0.05;
      const y = my + ph * 0.04;
      const h = ph - 2 * my - ph * 0.08;
      vector = [
        <rect key="b1" x={x} y={y} width={w} height={h} fill={accent} opacity={0.55} />,
        <rect key="b1e" x={x + w - lw} y={y} width={Math.max(2, lw * 1.5)} height={h} fill={accent} />,
        <rect key="b2" x={pw * 0.27} y={y} width={pw * 0.025} height={h} fill={accent} opacity={0.28} />,
      ];
      break;
    }
    case "arc": {
      // Keeper command arc at the (left) goal + goal mouth.
      const gx = mx + boxW;
      const r = ph * 0.22;
      const d = `M ${gx} ${ph / 2 - r} A ${r} ${r} 0 0 1 ${gx} ${ph / 2 + r}`;
      vector = [
        <path key="v" d={d} fill="none" stroke={accent} strokeWidth={vw} strokeLinecap="round" />,
        <line key="g" x1={mx} y1={ph * 0.4} x2={mx} y2={ph * 0.6} stroke={accent} strokeWidth={vw * 1.6} strokeLinecap="round" />,
      ];
      break;
    }
  }

  return (
    <svg width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`}>
      <g>{pitch}</g>
      <g opacity={vOpacity}>{vector}</g>
    </svg>
  );
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

  const positions = Object.keys(POSITION_INFO) as Position[];
  const design = buildCardDesign({
    position: pick<Position>(searchParams.get("pos"), positions, "midfielder"),
    nation: searchParams.get("nat") ?? undefined,
    intensity: num(searchParams.get("int")),
    flair: num(searchParams.get("fla")),
  });
  const p = design.palette;
  const energy = ((num(searchParams.get("int")) ?? 0.5) + (num(searchParams.get("fla")) ?? 0.5)) / 2;

  const { w, h } = SIZES[format];
  const isOg = format === "og";
  const s = isOg ? 0.62 : format === "square" ? 0.92 : 1;
  const px = (n: number) => Math.round(n * s);
  const pad = px(isOg ? 56 : 80);

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

  const TraitsAndVerdict =
    !isOg ? (
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

  // Tactical board panel.
  const panelW = isOg ? Math.round((w - 2 * pad) * 0.42) : w - 2 * pad;
  const panelH = isOg ? h - 2 * pad : Math.round((h - 2 * pad) * (format === "square" ? 0.42 : 0.4));
  const Board = (
    <div
      style={{
        display: "flex",
        width: panelW,
        height: panelH,
        borderRadius: px(20),
        border: `${px(1)}px solid ${p.accent}33`,
        background: "rgba(255,255,255,0.025)",
        overflow: "hidden",
      }}
    >
      {tacticalBoard(design.motif, panelW, panelH, p.accent, energy)}
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
      {Board}
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
      {Board}
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
