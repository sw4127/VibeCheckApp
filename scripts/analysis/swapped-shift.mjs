#!/usr/bin/env node
/**
 * Swapped vs. truthful mean shift chart (write-up [CHART 2] — brief §3.E10).
 *
 *   node scripts/analysis/swapped-shift.mjs --in export.json --out chart.svg
 *   node scripts/analysis/swapped-shift.mjs --demo --out chart.svg
 *
 * --in: posthog-export.mjs --json output (rows carry blind/labeled CSVs +
 * poolVersion). Per item, shift-toward-label = (labeled − blind) signed by
 * labelDirection; items are split swapped vs. truthful via pool-v*.json
 * (drift-guarded by pool-json.test.ts). Rows from other pool versions are
 * skipped and counted — never silently blended (N3).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const demo = args.includes("--demo");
const out = arg("--out") ?? "swapped-shift.svg";

// Current pool by default; --pool <file> renders historical versions.
const pool = JSON.parse(readFileSync(arg("--pool") ?? join(HERE, "pool-v4.json"), "utf8"));

// shifts[itemClass] = flat array of per-item shift-toward-label values.
const shifts = { swapped: [], truthful: [] };
let used = 0, skipped = 0;
let sourceLabel;

if (demo) {
  let s = 7;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let i = 0; i < 300 * pool.items.length; i++) {
    const swapped = i % pool.items.length < 3;
    const n = (rnd() + rnd() + rnd() + rnd() - 2) / 2;
    shifts[swapped ? "swapped" : "truthful"].push((swapped ? 1.4 : 0.8) + n * 2.4);
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
    if (blind.length !== pool.items.length || labeled.length !== pool.items.length) { skipped++; continue; }
    pool.items.forEach((item, i) => {
      if (item.isControl) return; // controls carry no label — neither class
      if (!Number.isFinite(blind[i]) || !Number.isFinite(labeled[i])) return;
      const toward = item.labelDirection === "up" ? labeled[i] - blind[i] : blind[i] - labeled[i];
      shifts[item.labelIsTrue ? "truthful" : "swapped"].push(toward);
    });
    used++;
  }
  sourceLabel = `n=${used} sessions (pool v${pool.poolVersion}${skipped ? `; ${skipped} other-version rows skipped` : ""})`;
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const groups = [
  { label: `swapped labels (${shifts.swapped.length} item-ratings)`, m: mean(shifts.swapped), fill: "hsl(42 80% 62%)" },
  { label: `truthful labels (${shifts.truthful.length} item-ratings)`, m: mean(shifts.truthful), fill: "hsl(42 30% 45%)" },
];

// SVG: two horizontal bars around a zero axis (dark/gold house style).
const W = 860, H = 300, PAD = 56, plotW = W - PAD * 2;
const MAXABS = Math.max(2, ...groups.map((g) => Math.abs(g.m))) * 1.25;
const x = (v) => PAD + ((v + MAXABS) / (2 * MAXABS)) * plotW;
const bars = groups.map((g, i) => {
  const y = 90 + i * 80;
  const x0 = Math.min(x(0), x(g.m)), w = Math.abs(x(g.m) - x(0));
  return `<rect x="${x0.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="34" fill="${g.fill}"/>
  <text x="${PAD}" y="${y - 8}" fill="#c9c2b2" font-size="13">${g.label}</text>
  <text x="${(x(g.m) + (g.m >= 0 ? 8 : -8)).toFixed(1)}" y="${y + 22}" fill="#fff" font-size="14" font-weight="bold" text-anchor="${g.m >= 0 ? "start" : "end"}">${g.m >= 0 ? "+" : ""}${g.m.toFixed(2)} pts</text>`;
}).join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Georgia, serif">
  <rect width="${W}" height="${H}" fill="#0B0A08"/>
  <text x="${PAD}" y="30" fill="#fff" font-size="18" font-weight="bold">Mean rating shift toward the label — swapped vs. truthful</text>
  <text x="${PAD}" y="48" fill="#8a8578" font-size="12">${sourceLabel} · rating points on a 0–${pool.scaleMax} scale</text>
  <line x1="${x(0).toFixed(1)}" y1="66" x2="${x(0).toFixed(1)}" y2="${H - 36}" stroke="#8a8578" stroke-dasharray="3 3"/>
  <text x="${x(0).toFixed(1)}" y="${H - 18}" fill="#8a8578" font-size="12" text-anchor="middle">0 (no sway)</text>
  ${bars}
  ${demo ? `<text x="${W / 2}" y="${H / 2}" fill="#ffffff" opacity="0.14" font-size="42" font-weight="bold" text-anchor="middle" transform="rotate(-10 ${W / 2} ${H / 2})">SYNTHETIC DEMO DATA</text>` : ""}
</svg>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (swapped ${groups[0].m.toFixed(2)} vs truthful ${groups[1].m.toFixed(2)}${demo ? ", SYNTHETIC" : ""})`);
