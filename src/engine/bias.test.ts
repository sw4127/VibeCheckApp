import { describe, expect, it } from "vitest";
import {
  BIAS_CONTRARIAN_AT,
  BIAS_SWAYED_AT,
  computeBiasResult,
  decodeBiasRatings,
  encodeBiasRatings,
  type BiasItemSpec,
  type BiasRatings,
} from "./bias";

/** 4 up / 4 down, one swap each way + one extra — mirrors the content rules. */
const ITEMS: BiasItemSpec[] = [
  { id: "a", labelDirection: "up", labelIsTrue: true },
  { id: "b", labelDirection: "down", labelIsTrue: true },
  { id: "c", labelDirection: "up", labelIsTrue: false },
  { id: "d", labelDirection: "down", labelIsTrue: true },
  { id: "e", labelDirection: "up", labelIsTrue: true },
  { id: "f", labelDirection: "down", labelIsTrue: false },
  { id: "g", labelDirection: "up", labelIsTrue: true },
  { id: "h", labelDirection: "down", labelIsTrue: false },
];

const ratings = (value: number): BiasRatings =>
  Object.fromEntries(ITEMS.map((i) => [i.id, value]));

describe("computeBiasResult", () => {
  it("identical passes → zero sway, steady", () => {
    const r = computeBiasResult("t", ITEMS, ratings(5), ratings(5));
    expect(r.meanShiftPts).toBe(0);
    expect(r.pct).toBe(0);
    expect(r.verdict).toBe("steady");
    expect(r.receipts.every((x) => x.shift === 0 && x.towardLabel === 0)).toBe(true);
  });

  it("moving with every label → positive sway, swayed", () => {
    const blind = ratings(5);
    // +2 where the label pushes up, -2 where it pushes down: all toward-label.
    const labeled = Object.fromEntries(
      ITEMS.map((i) => [i.id, i.labelDirection === "up" ? 7 : 3]),
    );
    const r = computeBiasResult("t", ITEMS, blind, labeled);
    expect(r.meanShiftPts).toBe(2);
    expect(r.pct).toBe(20);
    expect(r.pct).toBeGreaterThanOrEqual(BIAS_SWAYED_AT);
    expect(r.verdict).toBe("swayed");
  });

  it("moving against every label → negative sway, contrarian", () => {
    const blind = ratings(5);
    const labeled = Object.fromEntries(
      ITEMS.map((i) => [i.id, i.labelDirection === "up" ? 3 : 7]),
    );
    const r = computeBiasResult("t", ITEMS, blind, labeled);
    expect(r.meanShiftPts).toBe(-2);
    expect(r.pct).toBe(-20);
    expect(r.pct).toBeLessThanOrEqual(BIAS_CONTRARIAN_AT);
    expect(r.verdict).toBe("contrarian");
  });

  it("down-direction sway is measured toward the label, not raw drift", () => {
    // Only item "b" (down) moves, 8 → 2: raw shift -6, toward-label +6.
    const blind = { ...ratings(5), b: 8 };
    const labeled = { ...ratings(5), b: 2 };
    const r = computeBiasResult("t", ITEMS, blind, labeled);
    const b = r.receipts.find((x) => x.id === "b")!;
    expect(b.shift).toBe(-6);
    expect(b.towardLabel).toBe(6);
    expect(r.meanShiftPts).toBe(0.75); // 6 / 8 items
  });

  it("verdict thresholds sit exactly at the provisional constants", () => {
    // meanShift 1.5pts → pct 15 → swayed (boundary inclusive).
    const blind = ratings(5);
    const labeled = Object.fromEntries(
      ITEMS.map((i, n) => [i.id, i.labelDirection === "up" ? (n % 2 ? 6 : 7) : (n % 2 ? 4 : 3)]),
    );
    const r = computeBiasResult("t", ITEMS, blind, labeled);
    expect(r.pct).toBe(BIAS_SWAYED_AT);
    expect(r.verdict).toBe("swayed");
  });

  it("reports edge items (no headroom toward the label) instead of hiding them", () => {
    const blind = { ...ratings(5), a: 10, b: 0 }; // a is up@max, b is down@min
    const r = computeBiasResult("t", ITEMS, blind, ratings(5));
    expect(r.edgeCount).toBe(2);
  });

  it("lists exactly the swapped ids for the mandatory debrief", () => {
    const r = computeBiasResult("t", ITEMS, ratings(5), ratings(5));
    expect(r.swappedIds).toEqual(["c", "f", "h"]);
  });

  it("isolates the causally clean swapped-only stats", () => {
    // Move +4 toward the label ONLY on the 3 swapped items (c=up, f/h=down).
    const blind = ratings(5);
    const labeled = { ...ratings(5), c: 9, f: 1, h: 1 };
    const r = computeBiasResult("t", ITEMS, blind, labeled);
    expect(r.swappedMeanShiftPts).toBe(4);
    expect(r.swappedPct).toBe(40);
    expect(r.meanShiftPts).toBe(1.5); // pooled headline stays diluted: 12/8
  });

  it("swapped stats are null when the item set has no swaps", () => {
    const truthful = ITEMS.map((i) => ({ ...i, labelIsTrue: true }));
    const r = computeBiasResult("t", truthful, ratings(5), ratings(5));
    expect(r.swappedMeanShiftPts).toBeNull();
    expect(r.swappedPct).toBeNull();
  });

  it("swayShare counts movable items only, so the edge artifact can't touch it", () => {
    // a (up) blind@10 and b (down) blind@0 are edge: excluded from the share.
    const blind = { ...ratings(5), a: 10, b: 0 };
    // Everything movable moves toward its label except g (away) and d (still).
    const labeled = {
      a: 10, b: 0,
      c: 7, e: 7, g: 4, // up items: c,e toward; g away
      d: 5, f: 3, h: 3, // down items: f,h toward; d unmoved
    };
    const r = computeBiasResult("t", ITEMS, blind, labeled);
    expect(r.movableCount).toBe(6);
    expect(r.swayShare).toBe(4 / 6);
    expect(r.edgeCount).toBe(2);
  });

  it("swayShare is null when every item is at the edge", () => {
    const allEdge = Object.fromEntries(
      ITEMS.map((i) => [i.id, i.labelDirection === "up" ? 10 : 0]),
    );
    const r = computeBiasResult("t", ITEMS, allEdge, allEdge);
    expect(r.swayShare).toBeNull();
    expect(r.movableCount).toBe(0);
    expect(r.edgeCount).toBe(8);
  });

  it("hash is stable across key order and distinct across inputs", () => {
    const blind = ratings(5);
    const labeled = ratings(6);
    const reversedBlind = Object.fromEntries(Object.entries(blind).reverse());
    const a = computeBiasResult("t", ITEMS, blind, labeled);
    const b = computeBiasResult("t", ITEMS, reversedBlind, labeled);
    const c = computeBiasResult("t", ITEMS, blind, ratings(7));
    expect(a.hash).toBe(b.hash);
    expect(a.hash).not.toBe(c.hash);
  });

  it("codec round-trips and decode is strict", () => {
    const ratings = Object.fromEntries(ITEMS.map((i, n) => [i.id, n % 11])) as BiasRatings;
    const csv = encodeBiasRatings(ITEMS, ratings);
    expect(csv).toBe("0,1,2,3,4,5,6,7");
    expect(decodeBiasRatings(ITEMS, csv)).toEqual(ratings);
    expect(decodeBiasRatings(ITEMS, "10,10,10,10,10,10,10,10")!.a).toBe(10);
    // Strictness: wrong length, non-integer, out-of-range, junk, undefined.
    expect(decodeBiasRatings(ITEMS, "1,2,3")).toBeNull();
    expect(decodeBiasRatings(ITEMS, "1,2,3,4,5,6,7,8,9")).toBeNull();
    expect(decodeBiasRatings(ITEMS, "1,2,3,4,5,6,7,11")).toBeNull();
    expect(decodeBiasRatings(ITEMS, "1,2,3,4,5,6,7,5.5")).toBeNull();
    expect(decodeBiasRatings(ITEMS, "1,2,3,4,5,6,7,-1")).toBeNull();
    expect(decodeBiasRatings(ITEMS, "1,2,3,4,5,6,7,x")).toBeNull();
    expect(decodeBiasRatings(ITEMS, undefined)).toBeNull();
  });

  it("rejects malformed input loudly", () => {
    expect(() => computeBiasResult("t", [], {}, {})).toThrow(/empty/);
    expect(() => computeBiasResult("t", ITEMS, ratings(5), { ...ratings(5), a: 11 })).toThrow(/\[0,10\]/);
    expect(() => computeBiasResult("t", ITEMS, ratings(5), { ...ratings(5), a: 5.5 })).toThrow(/integer/);
    const missing = ratings(5);
    delete missing.a;
    expect(() => computeBiasResult("t", ITEMS, missing, ratings(5))).toThrow(/missing blind/);
    expect(() => computeBiasResult("t", ITEMS, { ...ratings(5), zz: 5 }, ratings(5))).toThrow(/unknown/);
    const dupes = [...ITEMS, { ...ITEMS[0] }];
    expect(() => computeBiasResult("t", dupes, ratings(5), ratings(5))).toThrow(/duplicate/);
  });

  it("without controls, the headline equals the raw stat", () => {
    const r = computeBiasResult("t", ITEMS, ratings(5), ratings(6));
    expect(r.controlCount).toBe(0);
    expect(r.controlDriftPts).toBeNull();
    expect(r.controlReceipts).toEqual([]);
    expect(r.pct).toBe(r.rawPct);
    expect(r.adjustedMeanShiftPts).toBe(r.meanShiftPts);
  });
});

/**
 * v1.1 control items (RT-1a/RT-2a 2026-07-19). Fixture mirrors the REAL pool
 * shape: 8 scored (5 up / 3 down, like pool v4) + 2 controls, so the residual
 * factor (nUp − nDown)/n = 2/8 = 0.25 is actually exercised — a balanced
 * fixture would make the correction invisibly zero.
 */
const POOLISH: BiasItemSpec[] = [
  { id: "s1", labelDirection: "down", labelIsTrue: false },
  { id: "s2", labelDirection: "up", labelIsTrue: false },
  { id: "s3", labelDirection: "down", labelIsTrue: true },
  { id: "c1", labelDirection: "up", labelIsTrue: true, isControl: true },
  { id: "s4", labelDirection: "up", labelIsTrue: false },
  { id: "s5", labelDirection: "up", labelIsTrue: true },
  { id: "s6", labelDirection: "down", labelIsTrue: true },
  { id: "s7", labelDirection: "up", labelIsTrue: true },
  { id: "s8", labelDirection: "up", labelIsTrue: true },
  { id: "c2", labelDirection: "up", labelIsTrue: true, isControl: true },
];

const poolRatings = (value: number): BiasRatings =>
  Object.fromEntries(POOLISH.map((i) => [i.id, value]));

describe("control items (v1.1 drift baseline)", () => {
  it("controls are excluded from receipts, swaps, edges, and swayShare", () => {
    // Controls at the edge + drifting; scored items quiet. Nothing control-
    // side may leak into any sway stat.
    const blind = { ...poolRatings(5), c1: 10, c2: 0 };
    const labeled = { ...poolRatings(5), c1: 10, c2: 3 };
    const r = computeBiasResult("t", POOLISH, blind, labeled);
    expect(r.receipts.map((x) => x.id)).toEqual(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]);
    expect(r.swappedIds).toEqual(["s1", "s2", "s4"]);
    expect(r.edgeCount).toBe(0); // c1@10 blind is NOT an edge item — it's a control
    expect(r.movableCount).toBe(8);
    expect(r.controlCount).toBe(2);
    expect(r.controlReceipts).toEqual([
      { id: "c1", first: 10, second: 10, drift: 0 },
      { id: "c2", first: 0, second: 3, drift: 3 },
    ]);
  });

  it("controls still demand valid ratings in both passes", () => {
    const missing = poolRatings(5);
    delete missing.c1;
    expect(() => computeBiasResult("t", POOLISH, missing, poolRatings(5))).toThrow(/missing blind.*c1/);
    expect(() => computeBiasResult("t", POOLISH, poolRatings(5), { ...poolRatings(5), c2: 11 })).toThrow(/c2/);
  });

  it("an all-control pool is rejected", () => {
    const allControls = POOLISH.map((i) => ({ ...i, isControl: true }));
    expect(() => computeBiasResult("t", allControls, poolRatings(5), poolRatings(5))).toThrow(/no scored/);
  });

  // ---- The three worked examples of record (RT-2a residual correction) ----
  // adjusted = raw − d̄·(nUp−nDown)/n, here d̄·(5−3)/8 = 0.25·d̄.

  it("worked example 1: upward drift (d̄=+2) shaves the residual off the headline", () => {
    // Scored: every item moves +1.5 toward its label on average (up items
    // 5→6.5 ≈ alternating 6/7... use uniform +1.5 impossible with integers, so:
    // up items +2 (5→7), down items +... build raw mean = +1.5:
    // toward-label: s2,s4,s5,s7,s8 (up) = +2 each; s1,s3,s6 (down) = +2/3…
    // Integers only — use: all 8 scored move +2 toward label except s3/s6
    // unmoved: sum = 6×2 = 12, raw mean = 1.5.
    const blind = poolRatings(5);
    const labeled: BiasRatings = {
      ...poolRatings(5),
      s1: 3, // down, toward +2
      s2: 7, s4: 7, s5: 7, s7: 7, s8: 7, // up, toward +2 each
      c1: 7, c2: 7, // both controls drift +2 → d̄ = +2
    };
    const r = computeBiasResult("t", POOLISH, blind, labeled);
    expect(r.meanShiftPts).toBe(1.5);
    expect(r.rawPct).toBe(15); // uncorrected: verdict would be "swayed"
    expect(r.controlDriftPts).toBe(2);
    expect(r.adjustedMeanShiftPts).toBe(1.0); // 1.5 − 0.25·2
    expect(r.pct).toBe(10);
    expect(r.verdict).toBe("steady"); // the control changed the verdict — honestly
  });

  it("worked example 2: zero drift (d̄=0) leaves the stat untouched", () => {
    const blind = poolRatings(5);
    const labeled: BiasRatings = { ...poolRatings(5), s2: 8, s1: 2, c1: 5, c2: 5 };
    const r = computeBiasResult("t", POOLISH, blind, labeled);
    expect(r.controlDriftPts).toBe(0);
    expect(r.pct).toBe(r.rawPct);
    expect(r.adjustedMeanShiftPts).toBe(r.meanShiftPts);
  });

  it("worked example 3: downward drift (d̄=−2) had been MASKING sway — correction raises the headline", () => {
    // Scored raw mean = +0.5 (only s2 moves, +4 toward: 4/8). Controls drift
    // −3 and −1 → d̄ = −2, adjustment = 0.25·(−2) = −0.5 → adjusted = 1.0.
    const blind = poolRatings(5);
    const labeled: BiasRatings = { ...poolRatings(5), s2: 9, c1: 2, c2: 4 };
    const r = computeBiasResult("t", POOLISH, blind, labeled);
    expect(r.meanShiftPts).toBe(0.5);
    expect(r.rawPct).toBe(5);
    expect(r.controlDriftPts).toBe(-2);
    expect(r.adjustedMeanShiftPts).toBe(1.0);
    expect(r.pct).toBe(10); // headline RISES: their drift ran against the labels' net direction
  });

  it("codec carries controls transparently (10-slot CSV round-trip)", () => {
    const rs = Object.fromEntries(POOLISH.map((i, n) => [i.id, n])) as BiasRatings;
    const csv = encodeBiasRatings(POOLISH, rs);
    expect(csv).toBe("0,1,2,3,4,5,6,7,8,9");
    expect(decodeBiasRatings(POOLISH, csv)).toEqual(rs);
    expect(decodeBiasRatings(POOLISH, "1,2,3,4,5,6,7,8")).toBeNull(); // old 8-slot links die
  });

  it("hash covers control ratings (a drifted control is a different session)", () => {
    const a = computeBiasResult("t", POOLISH, poolRatings(5), poolRatings(5));
    const b = computeBiasResult("t", POOLISH, poolRatings(5), { ...poolRatings(5), c1: 6 });
    expect(a.hash).not.toBe(b.hash);
  });
});
