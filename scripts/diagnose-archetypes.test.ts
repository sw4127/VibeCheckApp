/**
 * TRACK B — SLICE 0 (diagnosis only; read-only, changes no engine/content).
 *
 * Instruments the verdict distribution over the FULL finite answer space for both
 * quizzes, to answer: where does the space dogpile, what's unreachable, and which
 * archetype/player absorbs the most BALANCED answerers (the "generic type"
 * collapse). Reuses the live engine path (scoreAnswers → percentileNormalize →
 * nearest-centroid) — the same primitives the product uses.
 *
 * Full report:  DIAGNOSE=1 npx vitest run scripts/diagnose-archetypes.test.ts
 * (Quiet in the normal suite; this spec only asserts a sanity invariant.)
 */
import { describe, it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { scoreAnswers, percentileNormalize } from "@/engine/score";
import { rankMatches } from "@/engine/match";
import type { CentroidSet, QuizConfig } from "@/engine/types";
import { musicQuiz } from "@/content/music/quiz";
import { musicArchetypes } from "@/content/music/archetypes";
import { worldCup } from "@/content/world-cup";

const VERBOSE = process.env.DIAGNOSE === "1";
const LINES: string[] = [];
const log = (...a: unknown[]) => LINES.push(a.join(" "));

function stddev(v: number[]): number {
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
}

function herfindahl(counts: Record<string, number>, total: number): number {
  return Object.values(counts).reduce((a, n) => a + (n / total) ** 2, 0);
}

function dist(counts: Record<string, number>, ids: string[], total: number) {
  return ids
    .map((id) => ({ id, n: counts[id] ?? 0, pct: ((counts[id] ?? 0) / total) * 100 }))
    .sort((a, b) => b.n - a.n);
}

function diagnose(name: string, config: QuizConfig, set: CentroidSet, moderateId: string, roster?: CentroidSet) {
  const dims = config.dimensions;
  const total = config.questions.reduce((a, q) => a * q.options.length, 1);

  const archeCounts: Record<string, number> = {};
  const playerCounts: Record<string, number> = {};
  // `spread` = internal variance (flat); `central` = distance to all-0.5
  // (moderate). They differ: a uniformly-LOW answerer is flat but NOT moderate.
  const rows: { arche: string; spread: number; central: number }[] = [];

  for (let i = 0; i < total; i++) {
    let n = i;
    const answers: Record<string, string> = {};
    for (const q of config.questions) {
      const k = q.options.length;
      answers[q.id] = q.options[n % k].id;
      n = Math.floor(n / k);
    }
    const norm = percentileNormalize(config, scoreAnswers(config, answers)) as Record<string, number>;
    const arche = rankMatches(norm, set.centroids)[0].id;
    archeCounts[arche] = (archeCounts[arche] ?? 0) + 1;
    if (roster) {
      const p = rankMatches(norm, roster.centroids)[0].id;
      playerCounts[p] = (playerCounts[p] ?? 0) + 1;
    }
    const vec = dims.map((d) => norm[d] ?? 0.5);
    const central = Math.sqrt(vec.reduce((a, v) => a + (v - 0.5) ** 2, 0));
    rows.push({ arche, spread: stddev(vec), central });
  }

  const archeRows = dist(archeCounts, set.centroids.map((c) => c.id), total);
  const unreachable = archeRows.filter((r) => r.n === 0).map((r) => r.id);
  const even = 100 / set.centroids.length;

  // The geometric default: which archetype a perfectly moderate (all-0.5) answerer hits.
  const center: Record<string, number> = Object.fromEntries(dims.map((d) => [d, 0.5]));
  const centrist = rankMatches(center, set.centroids)[0];

  // Flattest decile (most BALANCED answerers, by normalized-vector stddev) → where they land.
  const sorted = [...rows].sort((a, b) => a.spread - b.spread);
  const decile = sorted.slice(0, Math.max(1, Math.floor(total * 0.1)));
  const flatCounts: Record<string, number> = {};
  for (const r of decile) flatCounts[r.arche] = (flatCounts[r.arche] ?? 0) + 1;
  const flatRows = Object.entries(flatCounts).sort((a, b) => b[1] - a[1]);

  // Most-CENTRAL decile (closest to all-0.5 — the genuinely MODERATE answerers,
  // as opposed to merely flat). This is the truer test of "the balanced person
  // gets the moderate type"; it should be owned cleanly by the moderate centroid.
  const byCentral = [...rows].sort((a, b) => a.central - b.central);
  const cDecile = byCentral.slice(0, Math.max(1, Math.floor(total * 0.1)));
  const centralCounts: Record<string, number> = {};
  for (const r of cDecile) centralCounts[r.arche] = (centralCounts[r.arche] ?? 0) + 1;
  const centralRows = Object.entries(centralCounts).sort((a, b) => b[1] - a[1]);

  log(`\n================ ${name} ================`);
  log(`answer space: ${total} combos · ${set.centroids.length} archetypes · even share = ${even.toFixed(1)}%`);
  log(`TOP (dogpile): ${archeRows[0].id} = ${archeRows[0].pct.toFixed(1)}%   |   starved: ${archeRows[archeRows.length - 1].id} = ${archeRows[archeRows.length - 1].pct.toFixed(1)}%`);
  log(`top:bottom ratio = ${(archeRows[0].n / Math.max(1, archeRows[archeRows.length - 1].n)).toFixed(1)}x   ·   Herfindahl = ${herfindahl(archeCounts, total).toFixed(3)} (even ${(1 / set.centroids.length).toFixed(3)} → 1.0 monopoly)`);
  log(`UNREACHABLE: ${unreachable.length ? unreachable.join(", ") : "none"}`);
  log(`CENTRIST default (all-axes-0.5 → nearest): ${centrist.id}  (dist ${centrist.distance.toFixed(3)})`);
  log(`FLATTEST decile (lowest internal variance) lands on: ${flatRows.map(([id, n]) => `${id} ${((n / decile.length) * 100).toFixed(0)}%`).join("   ")}`);
  log(`MOST-MODERATE decile (closest to all-0.5) lands on: ${centralRows.map(([id, n]) => `${id} ${((n / cDecile.length) * 100).toFixed(0)}%`).join("   ")}`);
  log(`archetype distribution (desc):`);
  for (const r of archeRows) log(`  ${r.pct.toFixed(1).padStart(5)}%  (${String(r.n).padStart(5)})  ${r.id}`);

  let playerSum = total;
  if (roster) {
    const pRows = dist(playerCounts, roster.centroids.map((c) => c.id), total);
    const zero = pRows.filter((r) => r.n === 0);
    log(`PLAYER MATCH — ${roster.centroids.length} players · even = ${(100 / roster.centroids.length).toFixed(1)}%`);
    log(`  top: ${pRows[0].id} ${pRows[0].pct.toFixed(1)}%  ·  Herfindahl ${herfindahl(playerCounts, total).toFixed(3)}  ·  never-matched: ${zero.length}/${roster.centroids.length}${zero.length ? " (" + zero.map((z) => z.id).join(", ") + ")" : ""}`);
    log(`  top 5: ${pRows.slice(0, 5).map((r) => `${r.id} ${r.pct.toFixed(1)}%`).join("  ")}`);
    // For each dead player, who wins at its OWN vector (its dominator) + margin.
    for (const z of zero) {
      const self = roster.centroids.find((c) => c.id === z.id)!;
      const ranked = rankMatches(self.vector, roster.centroids);
      const winner = ranked.find((r) => r.id !== z.id)!;
      const own = ranked.find((r) => r.id === z.id)!;
      log(`    DEAD ${z.id}: at its own vector → ${winner.id} wins (d=${winner.distance.toFixed(3)} vs self d=${own.distance.toFixed(3)}, margin ${(winner.distance - own.distance).toFixed(3)})`);
    }
    playerSum = Object.values(playerCounts).reduce((a, b) => a + b, 0);
  }

  const maxN = archeRows[0].n;
  const minN = archeRows[archeRows.length - 1].n;
  const playersZero = roster
    ? roster.centroids.filter((c) => (playerCounts[c.id] ?? 0) === 0).length
    : 0;

  return {
    total,
    archeSum: archeRows.reduce((a, r) => a + r.n, 0),
    playerSum,
    // Slice-1 acceptance targets (the PM's verbatim bar):
    minPct: (minN / total) * 100, //  floor — must be ≥ 5%
    ratio: maxN / Math.max(1, minN), //  top:bottom — must be ≤ 3.0x
    unreachableArche: unreachable.length, //  must be 0
    playersZero, //  must be 0
    moderateOwnsCentral: centralRows[0]?.[0] === moderateId, // moderate type owns the most-moderate decile
  };
}

const M = diagnose("MUSIC", musicQuiz, musicArchetypes, "omnivore");
const F = diagnose("FOOTBALL", worldCup.quiz, worldCup.archetypes, "equilibrist", worldCup.roster);

describe("Track B slice 0/1 — verdict distribution (diagnosis + regression)", () => {
  it("enumerates both answer spaces; counts conserve (run with DIAGNOSE=1 to print)", () => {
    if (VERBOSE) {
      const out = LINES.join("\n");
      console.log(out);
      writeFileSync("scripts/diagnose-report.txt", out + "\n");
    }
    expect(M.archeSum).toBe(M.total);
    expect(F.archeSum).toBe(F.total);
    expect(F.playerSum).toBe(F.total);
  });

  // --- Slice-1 acceptance gates (the PM's verbatim targets) ------------------
  // These lock the rebalance in: any future centroid/roster edit that regresses
  // the distribution fails CI here.
  for (const q of [M, F]) {
    const name = q === M ? "music" : "football";
    it(`${name}: every archetype is reachable (0 unreachable)`, () => {
      expect(q.unreachableArche).toBe(0);
    });
    it(`${name}: no archetype below the 5% floor`, () => {
      expect(q.minPct).toBeGreaterThanOrEqual(5);
    });
    it(`${name}: top:bottom archetype ratio ≤ 3.0x (no dogpile)`, () => {
      expect(q.ratio).toBeLessThanOrEqual(3.0);
    });
    it(`${name}: the moderate type owns the most-moderate decile`, () => {
      expect(q.moderateOwnsCentral).toBe(true);
    });
  }

  it("football: every roster player is reachable (0 never-matched)", () => {
    expect(F.playersZero).toBe(0);
  });
});
