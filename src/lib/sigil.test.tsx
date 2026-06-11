import { describe, it, expect } from "vitest";
import { sigilArcPath, driftHue, Sigil } from "./sigil";

describe("sigil geometry (§20.C2)", () => {
  it("produces a valid arc path", () => {
    const d = sigilArcPath(50, 50, 40, 0, 41);
    expect(d).toMatch(/^M [\d.]+ [\d.]+ A 40 40 0 0 1 [\d.]+ [\d.]+$/);
  });

  it("hue drifts toward the target as t grows, clamped to [0,1]", () => {
    expect(driftHue(215, 0)).toBe(250); // start = brand hue
    expect(driftHue(215, 1)).toBe(215); // full drift = target
    const mid = driftHue(215, 0.5);
    expect(mid).toBeGreaterThan(215);
    expect(mid).toBeLessThan(250);
    expect(driftHue(215, 5)).toBe(215); // clamped
  });

  it("takes the shortest hue path (no sweep through unrelated colors)", () => {
    // 250 → 20: shortest path goes UP through 360 (via violet/red), not down through green.
    const step = driftHue(20, 0.25);
    expect(step).toBeGreaterThan(250);
  });

  it("renders the right number of segments", () => {
    const el = Sigil({ size: 44, filled: 3, colors: ["a", "b", "c"], trackColor: "t" });
    // 3 filled + 4 track = all 7 segments present.
    expect((el.props.children as unknown[]).filter(Boolean)).toHaveLength(7);
    const partial = Sigil({ size: 44, filled: 2, colors: "x" });
    // No trackColor → only the 2 filled segments render.
    expect((partial.props.children as unknown[]).filter(Boolean)).toHaveLength(2);
  });
});
