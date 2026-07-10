/**
 * Design-constraint tests for the Prestige-Bias item pool (mirrors the
 * world-cup design.test.ts pattern): the pool's psychometric shape is a
 * contract, not a suggestion. If the PM re-authors items, these must still
 * pass — or the change is a decision, not an accident.
 */
import { describe, expect, it } from "vitest";
import { BIAS_CLIPS } from "./items";

describe("prestige-bias item pool design constraints", () => {
  it("has at least 8 items with unique ids", () => {
    expect(BIAS_CLIPS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(BIAS_CLIPS.map((c) => c.id)).size).toBe(BIAS_CLIPS.length);
  });

  it("has 2–3 swapped labels (the debrief must have something to disclose)", () => {
    const swapped = BIAS_CLIPS.filter((c) => !c.labelIsTrue);
    expect(swapped.length).toBeGreaterThanOrEqual(2);
    expect(swapped.length).toBeLessThanOrEqual(3);
  });

  it("balances label directions so sway ≠ generic second-pass drift", () => {
    const up = BIAS_CLIPS.filter((c) => c.labelDirection === "up").length;
    const down = BIAS_CLIPS.length - up;
    expect(Math.abs(up - down)).toBeLessThanOrEqual(2);
  });

  it("swaps exist in both directions", () => {
    const swapped = BIAS_CLIPS.filter((c) => !c.labelIsTrue);
    expect(swapped.some((c) => c.labelDirection === "up")).toBe(true);
    expect(swapped.some((c) => c.labelDirection === "down")).toBe(true);
  });

  it("truthful items show the true artist; swapped items must not", () => {
    for (const c of BIAS_CLIPS) {
      if (c.labelIsTrue) expect(c.shownArtist).toBe(c.trueArtist);
      else expect(c.shownArtist).not.toBe(c.trueArtist);
    }
  });

  it("every clip carries license + attribution fields (CC credit is a legal requirement)", () => {
    for (const c of BIAS_CLIPS) {
      expect(c.license.length).toBeGreaterThan(0);
      expect(c.audioSrc).toMatch(/^\/audio\/bias\//);
    }
  });
});
