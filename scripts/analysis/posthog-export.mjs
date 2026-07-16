#!/usr/bin/env node
/**
 * D6 dataset export (brief §3.D9; launch-checklist ops deadline 2027-06-01).
 *
 *   node scripts/analysis/posthog-export.mjs            → data/exports/bias-results-<date>.csv
 *   node scripts/analysis/posthog-export.mjs --json     → ...json (bias-distribution.mjs shape)
 *
 * Pulls raw `bias_result` events — the proprietary response dataset (N1).
 * Output goes to git-ignored `data/`: the dataset never ships in a public
 * repo. Dev sessions (?ref=dev) are excluded (N3).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { hogql, EXCLUDE_DEV } from "./posthog.mjs";

const asJson = process.argv.includes("--json");

const FIELDS = [
  "pool",
  "poolVersion",
  "hash",
  "blind",
  "labeled",
  "listen_b",
  "listen_l",
  "pct",
  "swappedPct",
  "swayShare",
  "edges",
  "verdict",
  "ref",
];

const select = FIELDS.map((f) => `properties.${f}`).join(", ");
const { results } = await hogql(
  `select timestamp, distinct_id, ${select} from events
   where event = 'bias_result' ${EXCLUDE_DEV}
   order by timestamp asc limit 100000`,
);

const header = ["timestamp", "session", ...FIELDS];
const rows = results.map((r) => header.map((_, i) => r[i]));

mkdirSync("data/exports", { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);

if (asJson) {
  const objs = rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
  const out = `data/exports/bias-results-${stamp}.json`;
  writeFileSync(out, JSON.stringify(objs, null, 2));
  console.log(`exported ${objs.length} bias_result rows → ${out}`);
} else {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const out = `data/exports/bias-results-${stamp}.csv`;
  writeFileSync(out, csv);
  console.log(`exported ${rows.length} bias_result rows → ${out}`);
}
console.log("dataset stays in git-ignored data/ — the N1 asset never ships in a public repo.");
