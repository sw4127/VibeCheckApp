import { describe, it, expect } from "vitest";
import { buildCardDesign, NATIONS, POSITION_INFO } from "./design";
import { worldCup, playerMeta } from "./index";

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

  it("maps position to the right motif and a factual caption", () => {
    const d = buildCardDesign({ position: "defender", nation: "NED" });
    expect(d.motif).toBe(POSITION_INFO.defender.motif);
    expect(d.caption).toBe("Defender · Netherlands");
  });

  it("reads louder for higher-energy players", () => {
    const calm = buildCardDesign({ position: "keeper", intensity: 0.1, flair: 0.1 });
    const loud = buildCardDesign({ position: "striker", intensity: 0.95, flair: 0.95 });
    expect(loud.motifOpacity).toBeGreaterThan(calm.motifOpacity);
  });

  it("is deterministic", () => {
    const a = buildCardDesign({ position: "winger", nation: "BRA", intensity: 0.7, flair: 0.8 });
    const b = buildCardDesign({ position: "winger", nation: "BRA", intensity: 0.7, flair: 0.8 });
    expect(a).toEqual(b);
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
