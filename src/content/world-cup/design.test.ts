import { describe, it, expect } from "vitest";
import {
  ARCHETYPE_GLYPHS,
  archetypeGlyph,
  buildCardDesign,
  NATIONS,
  POSITION_INFO,
} from "./design";
import { worldCup, worldCupArchetypes, playerMeta } from "./index";

describe("buildCardDesign", () => {
  it("uses the nationality accent colour for a known nation", () => {
    const d = buildCardDesign({ position: "striker", nation: "NOR" });
    expect(d.palette.accent).toBe(NATIONS.NOR.accent);
    expect(d.palette.to).toBe(NATIONS.NOR.deep);
  });

  it("falls back gracefully for an unknown nation", () => {
    const d = buildCardDesign({ position: "striker", nation: "ZZZ" });
    expect(d.palette.accent).toBeTruthy();
    expect(d.caption).toBe("Central Striker");
  });

  it("builds a factual position · nation caption", () => {
    expect(buildCardDesign({ position: "defender", nation: "NED" }).caption).toBe(
      "Defender · Netherlands",
    );
  });

  it("is deterministic", () => {
    const a = buildCardDesign({ position: "winger", nation: "BRA" });
    const b = buildCardDesign({ position: "winger", nation: "BRA" });
    expect(a).toEqual(b);
  });
});

describe("archetype glyphs", () => {
  it("has a single-stroke path for every archetype", () => {
    for (const c of worldCupArchetypes.centroids) {
      expect(ARCHETYPE_GLYPHS[c.id], `missing glyph for ${c.id}`).toBeTruthy();
      expect(archetypeGlyph(c.id).startsWith("M")).toBe(true);
    }
  });

  it("returns a default path for an unknown archetype", () => {
    expect(archetypeGlyph("nope")).toBe(archetypeGlyph(undefined));
    expect(archetypeGlyph("nope").startsWith("M")).toBe(true);
  });
});

describe("playerMeta coverage", () => {
  it("has position + valid nation for every roster player", () => {
    for (const c of worldCup.roster.centroids) {
      const m = playerMeta[c.id];
      expect(m, `missing meta for ${c.id}`).toBeTruthy();
      expect(POSITION_INFO[m.position]).toBeTruthy();
      expect(NATIONS[m.nation], `unknown nation ${m.nation} for ${c.id}`).toBeTruthy();
    }
  });
});
