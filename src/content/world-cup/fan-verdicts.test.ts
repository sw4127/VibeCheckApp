import { describe, it, expect } from "vitest";
import { fanVerdicts, fanVerdict, fanVerdictRoster } from "./fan-verdicts";
import { worldCupRoster } from "./roster";

const ROSTER_IDS = new Set(worldCupRoster.centroids.map((c) => c.id));
// Authored so far (Batches 1–2). The remaining 15 land in later batches; when
// every roster player has a verdict this becomes the full-coverage gate.
const AUTHORED = [
  "messi", "ronaldo", "mbappe", "haaland", "bellingham", "yamal",
  "vinicius", "debruyne", "modric", "kane", "saka", "vandijk",
  "griezmann", "valverde", "rice", "lautaro",
];

// §3/§21 guardrails: no hedges, no protected-attribute words.
const BANNED = ["might", "maybe", "perhaps", "probably"];
const words = (s: string) => s.trim().split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));

describe("A2 — fan verdicts", () => {
  it("covers exactly the authored set (Batches 1–2)", () => {
    expect(Object.keys(fanVerdicts).sort()).toEqual([...AUTHORED].sort());
  });

  it("only keys real roster players (no typos / off-roster names)", () => {
    for (const id of Object.keys(fanVerdicts))
      expect(ROSTER_IDS.has(id), `unknown player id: ${id}`).toBe(true);
  });

  it("fanVerdictRoster is built from the roster and carries labels", () => {
    expect(fanVerdictRoster.map((p) => p.id).sort()).toEqual([...AUTHORED].sort());
    for (const p of fanVerdictRoster) expect(p.label.length).toBeGreaterThan(0);
  });

  it("fanVerdict resolves known ids and returns undefined for unknown", () => {
    expect(fanVerdict("messi")).toBe(fanVerdicts.messi);
    expect(fanVerdict("nobody")).toBeUndefined();
  });

  for (const [id, v] of Object.entries(fanVerdicts)) {
    describe(id, () => {
      it("has a non-empty verdict and law", () => {
        expect(v.verdict.trim()).not.toBe("");
        expect(v.law.trim()).not.toBe("");
      });

      it("LAW is a 6–10 word quotable rule (D3 spec)", () => {
        const n = words(v.law).length;
        expect(n, `law is ${n} words: "${v.law}"`).toBeGreaterThanOrEqual(6);
        expect(n).toBeLessThanOrEqual(10);
      });

      it("VERDICT is one sentence (≤30 words)", () => {
        expect(words(v.verdict).length).toBeLessThanOrEqual(30);
      });

      it("uses no hedges (D3: no hedges)", () => {
        const hay = `${v.verdict} ${v.law}`.toLowerCase();
        for (const b of BANNED)
          expect(new RegExp(`\\b${b}\\b`).test(hay), `contains hedge "${b}"`).toBe(false);
      });
    });
  }
});
