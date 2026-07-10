import { describe, expect, it } from "vitest";
import {
  BIAS_CONTRARIAN_AT,
  BIAS_SWAYED_AT,
  computeBiasResult,
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
});
