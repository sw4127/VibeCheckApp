import { describe, it, expect } from "vitest";
import { encodeChallenger, decodeChallenger, compareVerdict } from "./vs";
import { worldCup } from "@/content/world-cup";

const dims = worldCup.quiz.dimensions.length;

describe("challenge codec", () => {
  it("round-trips a valid challenger", () => {
    const token = encodeChallenger({
      archetypeId: "iceman",
      playerId: "haaland",
      signature: [0.25, 0.03, 0.98, 0.91, 0.12],
    });
    const c = decodeChallenger(token);
    expect(c).not.toBeNull();
    expect(c!.archetypeId).toBe("iceman");
    expect(c!.playerId).toBe("haaland");
    expect(c!.archetypeLabel).toBe("The Poacher");
    expect(c!.playerLabel).toBe("Erling Haaland");
    expect(c!.signature).toHaveLength(dims);
    // within rounding (stored as 0–100 ints)
    expect(c!.signature[2]).toBeCloseTo(0.98, 2);
  });

  it("rejects malformed or unknown tokens", () => {
    expect(decodeChallenger(undefined)).toBeNull();
    expect(decodeChallenger("")).toBeNull();
    expect(decodeChallenger("iceman.haaland")).toBeNull(); // missing sig
    expect(decodeChallenger("nope.haaland.25-3-98-91-12")).toBeNull(); // bad archetype
    expect(decodeChallenger("iceman.nobody.25-3-98-91-12")).toBeNull(); // bad player
    expect(decodeChallenger("iceman.haaland.25-3-98")).toBeNull(); // wrong sig length
  });
});

describe("compareVerdict", () => {
  it("names an edge for each side", () => {
    const v = compareVerdict([1, 0, 0, 0, 0], [0, 0, 0, 0, 1]);
    expect(v).toMatch(/You're more/);
    expect(v).toMatch(/they're more/);
  });
});
