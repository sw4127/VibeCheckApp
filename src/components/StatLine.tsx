"use client";

import { useEffect, useState } from "react";
import type { SignatureRow } from "@/lib/signature";

/**
 * The footballer result's "player rating" stat line — FUT/broadcast-inspired
 * (a fun, screenshot-bait reframing of the five axes as player stats), NOT the
 * analytical ranked chart (that's for the music read, where depth = WTP). Fixed
 * stat order, bold serif ratings, slim bars, a black/white ball emblem; bars
 * grow on mount. Native divs + Tailwind, webview-safe.
 */
function Ball({ size, accent }: { size: number; accent: string }) {
  const c = size / 2;
  const r = c - 1.5;
  const pr = r * 0.42;
  const pt = (a: number, rad: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return `${(c + rad * Math.cos(t)).toFixed(2)},${(c + rad * Math.sin(t)).toFixed(2)}`;
  };
  const angles = [0, 72, 144, 216, 288];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="#f5f5f6" stroke="#0c0d12" strokeWidth={1.5} />
      <polygon points={angles.map((a) => pt(a, pr)).join(" ")} fill="#14171d" />
      {angles.map((a, i) => {
        const [x1, y1] = pt(a, pr).split(",").map(Number);
        const [x2, y2] = pt(a, r).split(",").map(Number);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14171d" strokeWidth={1.3} />;
      })}
    </svg>
  );
}

export default function StatLine({ rows, accent }: { rows: SignatureRow[]; accent: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Ball size={22} accent={accent} />
        <span className="text-[11px] font-bold tracking-[0.3em]" style={{ color: accent }}>
          YOUR STAT LINE
        </span>
      </div>
      <div className="mt-2.5 h-px w-full" style={{ background: `${accent}40` }} />
      <ul className="mt-3.5 flex flex-col gap-3" aria-label="Your player stat line">
        {rows.map((row) => (
          <li key={row.axis} className="flex items-center gap-3.5">
            <span className="w-[5.5rem] shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              {row.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? `${row.value}%` : "0%", background: accent }}
              />
            </div>
            <span
              className="w-9 text-right font-display text-2xl font-black tabular-nums leading-none"
              style={{ color: accent }}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
