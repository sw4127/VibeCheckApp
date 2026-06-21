/**
 * §Tournament-skin host motifs — clean, hand-rolled GEOMETRIC SVGs, one per
 * host phase. Premium silhouettes (not cheap colour-coding), all lightweight,
 * scaled to a 24×24 viewBox, scoped to /quiz. IP-safe (§13.D): abstract glyphs,
 * no flags / coats of arms / "World Cup"/"FIFA".
 */
import type { CSSProperties } from "react";
import type { MotifKey } from "./tournament-theme";

interface MotifProps {
  size: number;
  color: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}

// CANADA — stylized maple leaf (broad serrated lobes + stem; recognizably a leaf).
const MAPLE_LEAF =
  "M12 22l.45-6.36C9.5 18.55 4 19 4 19l1.5-3.5C3.36 13.5 2 11 2 11l3.27.82c.36.09.67-.27.5-.6L4 8l3 .5c.28.04.5-.22.42-.5L6.5 5l2.7 1.62c.3.18.68-.08.6-.42L9 2.5l2.13 2.84c.43.57 1.31.57 1.74 0L15 2.5l-.8 3.7c-.08.34.3.6.6.42L17.5 5l-.92 3c-.08.28.14.54.42.5L20 8l-1.77 3.22c-.17.33.14.69.5.6L22 11s-1.36 2.5-3.5 4.5L20 19s-5.5-.45-8.45-3.36L12 22z";

export function MapleLeaf({ size, color, opacity = 1, className, style }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d={MAPLE_LEAF} fill={color} opacity={opacity} />
    </svg>
  );
}

// USA — geometric starburst: a sharp 8-point star (16 vertices, two radii).
function burstPoints(): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? 11 : 4;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}
const BURST = burstPoints();

export function Starburst({ size, color, opacity = 1, className, style }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <polygon points={BURST} fill={color} opacity={opacity} />
    </svg>
  );
}

// MEXICO — solar-calendar ring fragment: a ring with 12 radiating ray teeth and
// a centred core (sun-stone inspired; abstract, not the eagle/Escudo).
const SOLAR_RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (Math.PI / 4) * i;
  return {
    x1: (12 + 8.4 * Math.cos(a)).toFixed(2),
    y1: (12 + 8.4 * Math.sin(a)).toFixed(2),
    x2: (12 + 11 * Math.cos(a)).toFixed(2),
    y2: (12 + 11 * Math.sin(a)).toFixed(2),
  };
});

export function SolarRing({ size, color, opacity = 1, className, style }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <g opacity={opacity}>
        <circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="2.2" />
        {SOLAR_RAYS.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={color} strokeWidth="2" strokeLinecap="round" />
        ))}
        <circle cx="12" cy="12" r="2.6" fill={color} />
      </g>
    </svg>
  );
}

/** Render the motif for a given host phase. */
export function Motif({ kind, ...rest }: MotifProps & { kind: MotifKey }) {
  if (kind === "maple") return <MapleLeaf {...rest} />;
  if (kind === "star") return <Starburst {...rest} />;
  return <SolarRing {...rest} />;
}
