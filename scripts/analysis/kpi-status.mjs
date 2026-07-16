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

const count = async (event, since = null) => {
  const window = since ? `and timestamp > now() - interval ${since} day` : "";
  const { results } = await hogql(
    `select count() from events where event = '${event}' ${window} ${EXCLUDE_DEV}`,
  );
  return Number(results?.[0]?.[0] ?? 0);
};

const pad = (s, n) => String(s).padEnd(n);

const rows = [];
for (const ev of FUNNEL) {
  rows.push([ev, await count(ev), await count(ev, 7)]);
}
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
