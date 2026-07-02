"use client";

import { useEffect, useMemo, useState } from "react";
import type { SignatureRow } from "@/lib/signature";

/**
 * Ranked horizontal bar chart for the vibe signature (NOT a radar — position-
 * along-a-common-scale is the highest-accuracy encoding, and it stays legible on
 * a 375px webview). BIPOLAR (v2): rows rank by LEAN strength and name the POLE
 * ("Loyalist 88"), so the low end of an axis reads as a stance, not an absence
 * (§18.D) — the all-low answerer gets a strong chart, not an empty one. Bars
 * grow from 0 on mount to sell the "calculating" beat. No charting lib.
 */
function tierOf(lean: number): string {
  if (lean >= 66) return "Hard lean";
  if (lean > 20) return "Lean";
  return "Center";
}

export default function SignatureChart({
  rows,
  accent,
}: {
  rows: SignatureRow[];
  accent: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const sorted = useMemo(() => [...rows].sort((a, b) => b.lean - a.lean), [rows]);

  return (
    <ul className="flex flex-col gap-3.5" aria-label="Your vibe signature, ranked by lean">
      {sorted.map((row, i) => {
        // Top rank = full accent; each step down desaturates toward muted.
        const opacity = Math.max(0.32, 1 - i * 0.15);
        return (
          <li key={row.axis}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold">{row.label}</span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted">{tierOf(row.lean)}</span>
                <span className="font-display text-base font-bold" style={{ color: accent }}>
                  {row.pole}
                </span>
                {row.direction !== "mid" ? (
                  <span className="font-display text-base font-bold tabular-nums" style={{ color: accent }}>
                    {row.lean}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: mounted ? `${Math.max(6, row.lean)}%` : "0%",
                  background: accent,
                  opacity,
                }}
              />
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              {row.driven && row.direction === "high" ? (
                <>
                  from your pick: <span className="italic">&ldquo;{row.proof}&rdquo;</span>
                </>
              ) : row.driven ? (
                <>
                  your tell: picked <span className="italic">&ldquo;{row.proof}&rdquo;</span> with the other end on the table
                </>
              ) : (
                <span className="italic">{row.proof}</span>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
