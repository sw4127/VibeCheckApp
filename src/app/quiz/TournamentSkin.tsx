/**
 * §Tournament-skin background — the seasonal "tournament pop-up" atmosphere for
 * the football quiz column. Purely decorative: absolutely positioned, behind
 * content (z-0), pointer-events-none, aria-hidden. All positions are hardcoded
 * (no Math.random) so SSR and client markup match — no hydration mismatch, no
 * layout shift. IP-safe: generic sport geometry + abstract glyphs only (§13.D).
 */
import { HOST } from "./tournament-theme";

/** Points for a 5-point star (a universal sport glyph — not a national emblem). */
function starPoints(cx: number, cy: number, outer: number): string {
  const inner = outer * 0.42;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// Sparse confetti — fixed positions (% of the column), trio + gold.
const CONFETTI: { x: number; y: number; c: string; s: number; r: number }[] = [
  { x: 12, y: 9, c: HOST.green, s: 7, r: 18 },
  { x: 86, y: 13, c: HOST.blue, s: 6, r: -22 },
  { x: 70, y: 5, c: HOST.red, s: 5, r: 8 },
  { x: 26, y: 30, c: HOST.gold, s: 5, r: 30 },
  { x: 92, y: 46, c: HOST.green, s: 6, r: -14 },
  { x: 6, y: 58, c: HOST.red, s: 6, r: 20 },
  { x: 80, y: 74, c: HOST.gold, s: 7, r: -10 },
  { x: 18, y: 82, c: HOST.blue, s: 6, r: 16 },
  { x: 58, y: 92, c: HOST.green, s: 5, r: -24 },
];

// A few abstract stars (universal glyph) — low opacity, woven into the frame.
const STARS: { x: number; y: number; o: number; op: number; c: string }[] = [
  { x: 90, y: 24, o: 13, op: 0.1, c: HOST.gold },
  { x: 9, y: 40, o: 10, op: 0.08, c: HOST.blue },
  { x: 84, y: 88, o: 11, op: 0.09, c: HOST.green },
];

export default function TournamentSkin() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Tri-host gradient mesh — three soft colour fields grounding the dark. */}
      <div
        style={{
          position: "absolute", top: "-14%", left: "-22%", width: "75%", height: "44%",
          background: `radial-gradient(closest-side, ${HOST.green}26, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute", top: "26%", right: "-26%", width: "78%", height: "46%",
          background: `radial-gradient(closest-side, ${HOST.blue}26, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "-16%", left: "-10%", width: "80%", height: "42%",
          background: `radial-gradient(closest-side, ${HOST.red}1f, transparent)`,
        }}
      />

      {/* Faint pitch geometry — generic football lines (no club/nation marks). */}
      <svg
        viewBox="0 0 100 178" preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full" style={{ opacity: 0.05 }}
      >
        <line x1="0" y1="89" x2="100" y2="89" stroke="#fff" strokeWidth="0.4" />
        <circle cx="50" cy="89" r="16" fill="none" stroke="#fff" strokeWidth="0.4" />
        <circle cx="50" cy="89" r="0.8" fill="#fff" />
        <rect x="28" y="-2" width="44" height="22" fill="none" stroke="#fff" strokeWidth="0.4" />
        <rect x="28" y="158" width="44" height="22" fill="none" stroke="#fff" strokeWidth="0.4" />
      </svg>

      {/* Confetti dots. */}
      {CONFETTI.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
            width: d.s, height: d.s * 1.6, background: d.c, opacity: 0.55,
            borderRadius: 1, transform: `rotate(${d.r}deg)`,
          }}
        />
      ))}

      {/* Abstract stars. */}
      {STARS.map((s, i) => (
        <svg key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, overflow: "visible" }}>
          <polygon points={starPoints(0, 0, s.o)} fill={s.c} opacity={s.op} />
        </svg>
      ))}

      {/* Kinetic broadcast ribbon at the very top of the column. */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4, opacity: 0.85,
          background: `repeating-linear-gradient(135deg, ${HOST.green} 0 14px, ${HOST.blue} 14px 28px, ${HOST.red} 28px 42px)`,
        }}
      />
    </div>
  );
}
