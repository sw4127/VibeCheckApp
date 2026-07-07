import { describe, it, expect } from "vitest";
import { MUSIC_KB, lookupArtist, normalizeArtist } from "./kb";
import { MUSIC_DIMENSIONS } from "./quiz";

const AXES = new Set<string>(MUSIC_DIMENSIONS);

describe("§30 Music KB — batch 1", () => {
  it("schema: unique ids, non-empty names/tags/receipts, era, version", () => {
    const ids = MUSIC_KB.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of MUSIC_KB) {
      expect(a.names.length).toBeGreaterThanOrEqual(1);
      expect(a.tags.length).toBeGreaterThanOrEqual(2);
      expect(a.receipts.length).toBeGreaterThanOrEqual(1);
      expect(a.era).toBeTruthy();
      expect(a.version).toBe(1);
    }
  });

  it("weights: all six engine axes, all in [0,1]", () => {
    for (const a of MUSIC_KB) {
      const dims = Object.keys(a.weights);
      expect(dims.sort()).toEqual([...AXES].sort());
      for (const v of Object.values(a.weights)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it("no alias collisions across entries", () => {
    const seen = new Map<string, string>();
    for (const a of MUSIC_KB)
      for (const n of a.names) {
        const k = normalizeArtist(n);
        // same-entry duplicates (diacritic folds) are harmless; cross-entry = bug
        expect(seen.get(k) === undefined || seen.get(k) === a.id, `alias collision: "${n}" (${seen.get(k)} vs ${a.id})`).toBe(true);
        seen.set(k, a.id);
      }
  });

  it("lookup: deterministic, case/diacritic/space tolerant; unknown → null", () => {
    expect(lookupArtist("  phoebe   BRIDGERS ")?.id).toBe("phoebe-bridgers");
    expect(lookupArtist("Beyonce")?.id).toBe("beyonce"); // no diacritic
    expect(lookupArtist("Beyoncé")?.id).toBe("beyonce"); // with diacritic
    expect(lookupArtist("Some Garage Band")).toBeNull();
    expect(lookupArtist("phoebe")).toBe(lookupArtist("Phoebe Bridgers"));
  });
});
