/**
 * §Tournament-skin host motifs — clean, stylized, GEOMETRIC SVGs (straight
 * edges, not realistic emblems). IP-safe (§13.D): abstract glyphs evoking the
 * three hosts, never flags or coats of arms. Scoped to /quiz; delete with the
 * rest of the seasonal layer.
 */
import type { CSSProperties } from "react";

// Stylized maple leaf (CANADA nod) — a clean, recognizable leaf silhouette
// (broad serrated lobes + stem), not a starburst. IP-safe: a generic leaf
// glyph, not the official flag emblem.
const MAPLE_LEAF =
  "M12 22l.45-6.36C9.5 18.55 4 19 4 19l1.5-3.5C3.36 13.5 2 11 2 11l3.27.82c.36.09.67-.27.5-.6L4 8l3 .5c.28.04.5-.22.42-.5L6.5 5l2.7 1.62c.3.18.68-.08.6-.42L9 2.5l2.13 2.84c.43.57 1.31.57 1.74 0L15 2.5l-.8 3.7c-.08.34.3.6.6.42L17.5 5l-.92 3c-.08.28.14.54.42.5L20 8l-1.77 3.22c-.17.33.14.69.5.6L22 11s-1.36 2.5-3.5 4.5L20 19s-5.5-.45-8.45-3.36L12 22z";

export function MapleLeaf({
  size,
  color,
  opacity = 1,
  className,
  style,
}: {
  size: number;
  color: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden
    >
      <path d={MAPLE_LEAF} fill={color} opacity={opacity} />
    </svg>
  );
}

// 5-point star (USA nod) — a universal sport glyph.
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

export function Star({ size, color, opacity = 1, style }: { size: number; color: string; opacity?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden>
      <polygon points={starPoints(12, 12, 11)} fill={color} opacity={opacity} />
    </svg>
  );
}

// Sunburst (MEXICO nod) — abstract rays, NOT the eagle/Escudo. 8 spokes.
export function SunBurst({ size, color, opacity = 1, style }: { size: number; color: string; opacity?: number; style?: CSSProperties }) {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i;
    return { x: 12 + 11 * Math.cos(a), y: 12 + 11 * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden>
      <circle cx="12" cy="12" r="4" fill={color} opacity={opacity} />
      {spokes.map((s, i) => (
        <line key={i} x1="12" y1="12" x2={s.x.toFixed(1)} y2={s.y.toFixed(1)} stroke={color} strokeWidth="1.4" opacity={opacity} />
      ))}
    </svg>
  );
}
