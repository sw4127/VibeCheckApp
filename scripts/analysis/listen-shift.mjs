#!/usr/bin/env node
/**
 * Listen-time vs. rating-shift scatter (write-up [CHART 3] — brief §3.E10).
 *
 *   node scripts/analysis/listen-shift.mjs --in export.json --out chart.svg
 *   node scripts/analysis/listen-shift.mjs --demo --out chart.svg
 *
 * One dot per item-rating: labeled-pass listen duration (s) against the
 * absolute rating shift between passes. The instrument's gating claim made
 * inspectable: ratings are judgments of heard audio, and the chart shows
 * whether quick listens behave differently. Same pool-version discipline as
 * swapped-shift.mjs (N3).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const demo = args.includes("--demo");
const out = arg("--out") ?? "listen-shift.svg";

const pool = JSON.parse(readFileSync(join(HERE, "pool-v3.json"), "utf8"));

const points = []; // { sec, shift }
let used = 0, skipped = 0;
let sourceLabel;

if (demo) {
  let s = 11;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let i = 0; i < 300 * pool.items.length; i++) {
    const sec = 5 + rnd() * 16;
    const n = (rnd() + rnd() + rnd() + rnd() - 2) / 2;
    points.push({ sec, shift: Math.min(10, Math.abs(n * 3.2)) });
  }
  sourceLabel = "SYNTHETIC DEMO DATA (n=300, seeded) — real cohort chart replaces this";
} else {
  const file = arg("--in");
  if (!file) { console.error("need --in <export.json> or --demo"); process.exit(2); }
  const rows = JSON.parse(readFileSync(file, "utf8"));
  for (const row of rows) {
    if (Number(row.poolVersion) !== pool.poolVersion) { skipped++; continue; }
    const blind = String(row.blind).split(",").map(Number);
    const labeled = String(row.labeled).split(",").map(Number);
    const listen = String(row.listen_l).split(",").map(Number);
    if (blind.length !== pool.items.length) { skipped++; continue; }
    pool.items.forEach((_, i) => {
      if (!Number.isFinite(blind[i]) || !Number.isFinite(labeled[i]) || !Number.isFinite(listen[i])) return;
      points.push({ sec: listen[i] / 1000, shift: Math.abs(labeled[i] - blind[i]) });
    });
    used++;
  }
  sourceLabel = `n=${used} sessions (pool v${pool.poolVersion}${skipped ? `; ${skipped} other-version rows skipped` : ""})`;
}

const W = 860, H = 420, PAD = 56, plotW = W - PAD * 2, plotH = H - PAD * 2 - 24;
// Axis clamps at 30s: pool v3 windows run up to 120s (pb4), and one long
// listen would squash the whole plot. Overflow lands on the "30s+" edge.
const CLAMP_SEC = 30;
const maxSec = CLAMP_SEC * 1.03;
const x = (sec) => PAD + (Math.min(sec, CLAMP_SEC) / maxSec) * plotW;
const y = (shift) => PAD + plotH - (shift / pool.scaleMax) * plotH;
const dots = points
  .map((p) => `<circle cx="${x(p.sec).toFixed(1)}" cy="${y(p.shift).toFixed(1)}" r="3" fill="hsl(42 80% 62%)" opacity="0.35"/>`)
  .join("\n  ");
const xTicks = [0, 5, 10, 15, 20, 25, 30]
  .map((t) => `<text x="${x(t).toFixed(1)}" y="${PAD + plotH + 18}" fill="#8a8578" font-size="12" text-anchor="middle">${t === CLAMP_SEC ? `${t}s+` : `${t}s`}</text>`)
  .join("\n  ");
const yTicks = [0, 2, 4, 6, 8, 10]
  .map((t) => `<text x="${PAD - 10}" y="${(y(t) + 4).toFixed(1)}" fill="#8a8578" font-size="12" text-anchor="end">${t}</text>`)
  .join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Georgia, serif">
  <rect width="${W}" height="${H}" fill="#0B0A08"/>
  <text x="${PAD}" y="30" fill="#fff" font-size="18" font-weight="bold">Listen time (labeled pass) vs. absolute rating shift</text>
  <text x="${PAD}" y="48" fill="#8a8578" font-size="12">${sourceLabel} · one dot per item-rating · 5s gate at the dashed line</text>
  <line x1="${x(5).toFixed(1)}" y1="${PAD}" x2="${x(5).toFixed(1)}" y2="${PAD + plotH}" stroke="#8a8578" stroke-dasharray="3 3"/>
  ${dots}
  ${xTicks}
  ${yTicks}
  ${demo ? `<text x="${W / 2}" y="${H / 2}" fill="#ffffff" opacity="0.14" font-size="46" font-weight="bold" text-anchor="middle" transform="rotate(-14 ${W / 2} ${H / 2})">SYNTHETIC DEMO DATA</text>` : ""}
</svg>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (${points.length} item-ratings${demo ? ", SYNTHETIC" : ""})`);
