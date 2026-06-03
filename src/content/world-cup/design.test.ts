import { describe, it, expect } from "vitest";
import { buildCardDesign, NATIONS, POSITION_INFO } from "./design";
import { worldCup, playerMeta } from "./index";

describe("buildCardDesign", () => {
  it("uses the nationality accent on a neutral base (no clash)", () => {
    const d = buildCardDesign({ position: "striker", nation: "NOR" });
    expect(d.palette.accent).toBe(NATIONS.NOR.accent);
    // Base is neutral chrome, not nationality-tinted, so colours never fight.
    expect(d.palette.from).toBe("#0c0d12");
    expect(d.palette.to).toBe("#070709");
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
