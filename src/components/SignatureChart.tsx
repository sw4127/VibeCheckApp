"use client";

import { useEffect, useMemo, useState } from "react";
import type { SignatureRow } from "@/lib/signature";

/**
 * Ranked horizontal bar chart for the vibe signature (NOT a radar — position-
 * along-a-common-scale is the highest-accuracy encoding, and it stays legible on
 * a 375px webview). Sorted high→low so the dominant trait is always on top;
 * fill desaturates by rank for instant hierarchy; bars grow from 0 on mount to
 * sell the "calculating" beat. Native divs + Tailwind — no charting lib.
 */
function tierOf(value: number): string {
  if (value >= 66) return "Dominant";
  if (value >= 34) return "Balanced";
  return "Dormant";
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

  const sorted = useMemo(() => [...rows].sort((a, b) => b.value - a.value), [rows]);

  return (
    <ul className="flex flex-col gap-3.5" aria-label="Your vibe signature, ranked">
      {sorted.map((row, i) => {
        // Top rank = full accent; each step down desaturates toward muted.
        const opacity = Math.max(0.32, 1 - i * 0.15);
        return (
          <li key={row.axis}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold">{row.label}</span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted">{tierOf(row.value)}</span>
                <span className="font-display text-base font-bold tabular-nums" style={{ color: accent }}>
                  {row.value}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: mounted ? `${row.value}%` : "0%",
                  background: accent,
                  opacity,
                }}
              />
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              {row.driven ? (
                <>
                  from your pick: <span className="italic">&ldquo;{row.proof}&rdquo;</span>
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
