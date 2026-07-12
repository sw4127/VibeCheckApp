#!/usr/bin/env node
/**
 * Bias-gap distribution chart (portfolio DoD item d — Prestige instrument).
 *
 *   node scripts/analysis/bias-distribution.mjs --in results.json --out chart.svg
 *   node scripts/analysis/bias-distribution.mjs --demo --out docs/assets/bias-gap-demo.svg
 *
 * --in: JSON array of bias_result events (needs a numeric `pct` per row) —
 *       the PostHog raw-event export shape. This is the REAL-data path; it
 *       becomes usable the moment cohort data exists (memo §7).
 * --demo: seeded synthetic data, and the chart is WATERMARKED as synthetic —
 *       no fabricated claims ever leave this script unlabeled (N3).
 *
 * Pure Node, zero deps, emits standalone SVG (the write-up embeds it).
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const demo = args.includes("--demo");
const out = arg("--out") ?? "bias-gap.svg";

let pcts;
let sourceLabel;
if (demo) {
  // Seeded LCG → deterministic pseudo-normal around +18% (the literature-shaped
  // prior that prestige sways most people somewhat). SYNTHETIC — watermarked.
  let s = 42;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  pcts = Array.from({ length: 300 }, () => {
    const n = (rnd() + rnd() + rnd() + rnd() - 2) / 2; // ~normal(0, .29)
    return Math.max(-100, Math.min(100, Math.round(18 + n * 55)));
  });
  sourceLabel = "SYNTHETIC DEMO DATA (n=300, seeded) — real cohort chart replaces this";
} else {
  const file = arg("--in");
  if (!file) { console.error("need --in <results.json> or --demo"); process.exit(2); }
  const rows = JSON.parse(readFileSync(file, "utf8"));
  pcts = rows.map((r) => Number(r.pct)).filter((v) => Number.isFinite(v));
  sourceLabel = `n=${pcts.length} · bias_result export`;
}

// Bin into 10%-wide buckets across [-100, 100].
const BIN = 10;
const bins = new Map();
for (let lo = -100; lo < 100; lo += BIN) bins.set(lo, 0);
for (const p of pcts) {
  const lo = Math.max(-100, Math.min(90, Math.floor(p / BIN) * BIN));
  bins.set(lo, (bins.get(lo) ?? 0) + 1);
}
const maxCount = Math.max(...bins.values(), 1);
const mean = pcts.reduce((a, b) => a + b, 0) / (pcts.length || 1);

// SVG (dark, gold accent — the product's palette).
const W = 860, H = 420, PAD = 56, plotW = W - PAD * 2, plotH = H - PAD * 2 - 24;
const bw = plotW / bins.size;
const x = (lo) => PAD + ((lo + 100) / 200) * plotW;
const bars = [...bins.entries()].map(([lo, c]) => {
  const h = (c / maxCount) * plotH;
  return `<rect x="${(x(lo) + 1).toFixed(1)}" y="${(PAD + plotH - h).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${h.toFixed(1)}" fill="hsl(42 80% 62%)" opacity="${lo < 0 ? 0.55 : 0.9}"/>`;
}).join("\n  ");
const meanX = x(mean).toFixed(1);
const ticks = [-100, -50, 0, 50, 100].map((t) =>
  `<text x="${x(t).toFixed(1)}" y="${PAD + plotH + 18}" fill="#8a8578" font-size="12" text-anchor="middle">${t > 0 ? "+" : ""}${t}%</text>`,
).join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Georgia, serif">
  <rect width="${W}" height="${H}" fill="#0B0A08"/>
  <text x="${PAD}" y="30" fill="#fff" font-size="18" font-weight="bold">The Prestige Test — headline sway distribution</text>
  <text x="${PAD}" y="48" fill="#8a8578" font-size="12">${sourceLabel} · mean ${mean >= 0 ? "+" : ""}${mean.toFixed(1)}%</text>
  ${bars}
  <line x1="${x(0).toFixed(1)}" y1="${PAD}" x2="${x(0).toFixed(1)}" y2="${PAD + plotH}" stroke="#8a8578" stroke-dasharray="3 3"/>
  <line x1="${meanX}" y1="${PAD}" x2="${meanX}" y2="${PAD + plotH}" stroke="#fff" stroke-dasharray="5 4"/>
  <text x="${meanX}" y="${PAD - 6}" fill="#fff" font-size="11" text-anchor="middle">mean</text>
  ${ticks}
  ${demo ? `<text x="${W / 2}" y="${H / 2}" fill="#ffffff" opacity="0.14" font-size="46" font-weight="bold" text-anchor="middle" transform="rotate(-14 ${W / 2} ${H / 2})">SYNTHETIC DEMO DATA</text>` : ""}
</svg>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (${pcts.length} results, mean ${mean.toFixed(1)}%${demo ? ", SYNTHETIC" : ""})`);
