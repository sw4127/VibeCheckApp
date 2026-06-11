/**
 * THE FORMING SIGIL (§20.C2) — one ring of 7 arc segments, one per quiz answer.
 * Pure SVG (plain <svg>/<path>) so the same component renders in the web app
 * AND inside Satori on the share card. Deterministic: geometry from constants,
 * colors from the caller. No labels, no verdict — the hue only *drifts*.
 */

const GAP_DEG = 16; // gap between segments (butt caps — keeps 7 arcs legible small)

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** Arc path between two angles (degrees, clockwise from 12 o'clock). */
export function sigilArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const [x0, y0] = polar(cx, cy, r, startDeg);
  const [x1, y1] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export interface SigilProps {
  size: number;
  /** How many segments are filled (0..total). */
  filled: number;
  total?: number;
  /** Color per filled segment (index-matched), or a single color for all. */
  colors: string | string[];
  /** Track color for unfilled segments (omit to hide them). */
  trackColor?: string;
  strokeWidth?: number;
  className?: string;
}

export function Sigil({
  size,
  filled,
  total = 7,
  colors,
  trackColor,
  strokeWidth,
  className,
}: SigilProps) {
  const sw = strokeWidth ?? Math.max(2, Math.round(size * 0.09));
  const r = size / 2 - sw;
  const c = size / 2;
  const span = 360 / total - GAP_DEG;
  const segs = [];
  for (let i = 0; i < total; i++) {
    const start = i * (360 / total) + GAP_DEG / 2;
    const isFilled = i < filled;
    const color = isFilled
      ? Array.isArray(colors)
        ? (colors[i] ?? colors[colors.length - 1])
        : colors
      : trackColor;
    if (!color) continue;
    segs.push(
      <path
        key={i}
        d={sigilArcPath(c, c, r, start, start + span)}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="butt"
      />,
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      {segs}
    </svg>
  );
}

/** Theme → hue (HSL degrees), for the in-quiz drift toward the secret theme. */
export const THEME_HUES: Record<string, number> = {
  ember: 20,
  midnight: 215,
  neon: 275,
  bloom: 330,
  static: 220,
};

const BRAND_HUE = 250; // the pre-result brand violet

/** Shortest-path hue interpolation (avoids sweeping through unrelated colors). */
export function driftHue(targetHue: number, t: number): number {
  const delta = ((targetHue - BRAND_HUE + 540) % 360) - 180;
  return (BRAND_HUE + delta * Math.max(0, Math.min(1, t)) + 360) % 360;
}
