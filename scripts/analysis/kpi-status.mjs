#!/usr/bin/env node
/**
 * KPI status table (brief §3.D9 — serves C4/D6, honesty caps N3).
 *
 *   node scripts/analysis/kpi-status.mjs
 *
 * Prints the 30-second weekly read: funnel counts + Tier-2 threshold
 * progress, straight from PostHog. Prints ONLY what the API returns; if the
 * env is missing it exits loudly instead of showing zeros that look like
 * data. Tier-3 signals (HN, stars) are read manually by design (capped, not
 * chased — brief §2).
 */
import { hogql, EXCLUDE_DEV } from "./posthog.mjs";

const FUNNEL = [
  "landing_view",
  "bias_frame_view",
  "bias_start",
  "bias_blind_complete",
  "bias_labeled_complete",
  "bias_result",
  "bias_debrief_view",
  "bias_result_view",
];

const pad = (s, n) => String(s).padEnd(n);

// One round-trip for the whole table (was 16 sequential queries — red-teamed
// 2026-07-17): totals + 7-day window via countIf, grouped by event.
const inList = FUNNEL.map((e) => `'${e}'`).join(", ");
const { results } = await hogql(
  `select event, count(), countIf(timestamp > now() - interval 7 day)
   from events where event in (${inList}) ${EXCLUDE_DEV} group by event`,
);
const byEvent = new Map(results.map((r) => [r[0], [Number(r[1]), Number(r[2])]]));
const rows = FUNNEL.map((ev) => [ev, ...(byEvent.get(ev) ?? [0, 0])]);
const completed = rows.find((r) => r[0] === "bias_result")[1];

console.log(`\nKPI STATUS — ${new Date().toISOString().slice(0, 10)} (dev sessions excluded)\n`);
console.log(pad("event", 26) + pad("total", 10) + "last 7d");
console.log("-".repeat(46));
for (const [ev, total, week] of rows) console.log(pad(ev, 26) + pad(total, 10) + week);

console.log("\nTIER 2 THRESHOLDS (brief §2)");
console.log("-".repeat(46));
console.log(`completed sessions        ${completed} / 300 (norms defensible)`);
console.log(`                          ${completed} / 100 (charts render meaningfully)`);
console.log(
  completed >= 300
    ? "→ provisional norms DEFENSIBLE"
    : completed >= 100
      ? "→ charts meaningful; norms still provisional (N3)"
      : "→ pre-cohort: everything stays labeled provisional (N3)",
);
console.log("\nTier 3 (manual, capped): HN/subreddit post · GitHub stars · organic/AI referrals\n");
