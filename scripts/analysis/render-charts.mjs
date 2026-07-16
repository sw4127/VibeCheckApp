#!/usr/bin/env node
/**
 * Write-up chart runner (brief §3.E10 — charts auto-generate when N arrives).
 *
 *   node scripts/analysis/render-charts.mjs --in data/exports/bias-results-<date>.json
 *   node scripts/analysis/render-charts.mjs --demo
 *
 * One command → every [CHART] slot in docs/writeup-quantifying-hume.md that
 * the live instrument can fill:
 *   docs/assets/bias-gap.svg        (headline sway distribution)
 *   docs/assets/swapped-shift.svg   (swapped vs. truthful shift)
 *   docs/assets/listen-shift.svg    (listen time vs. rating shift)
 * Demo renders are WATERMARKED SYNTHETIC by each script (N3). The IRT chart
 * waits for the delicacy battery — no script pretends otherwise.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const demo = args.includes("--demo");
const input = arg("--in");
if (!demo && !input) {
  console.error("need --in <export.json> (from posthog-export.mjs --json) or --demo");
  process.exit(2);
}

const source = demo ? ["--demo"] : ["--in", input];
const CHARTS = [
  ["bias-distribution.mjs", "docs/assets/bias-gap.svg"],
  ["swapped-shift.mjs", "docs/assets/swapped-shift.svg"],
  ["listen-shift.mjs", "docs/assets/listen-shift.svg"],
];

let failed = false;
for (const [script, out] of CHARTS) {
  const r = spawnSync("node", [join(HERE, script), ...source, "--out", out], { stdio: "inherit" });
  if (r.status !== 0) failed = true;
}
if (failed) process.exit(1);
console.log(`\nall charts rendered${demo ? " (SYNTHETIC watermarked)" : ""} → docs/assets/`);
