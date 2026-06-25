import { describe, it, expect } from "vitest";
import { worldCupSpines } from "./spines";
import { worldCupArchetypes } from "./archetypes";
import type { Spine } from "@/content/spine";

const ARCHETYPE_IDS = worldCupArchetypes.centroids.map((c) => c.id);
const ARCHETYPE_ID_SET = new Set(ARCHETYPE_IDS);

// §21.D banned list + §7/§21.A4 hedges. Word-boundaried, case-insensitive.
const BANNED = [
  "journey", "unique", "special", "eclectic", "music lover", "vibe with",
  "soundtrack of your life", "holding space", "doing the work",
  "might", "maybe", "perhaps", "probably",
];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const allText = (sp: Spine) => [sp.law, ...sp.tells, sp.reframe, sp.split, sp.closer].join(" ");

describe("World Cup spines (Slice 1b · Batch 1)", () => {
  it("covers every reachable football archetype (Batches 1–2 complete)", () => {
    expect(Object.keys(worldCupSpines).sort()).toEqual([...ARCHETYPE_IDS].sort());
  });

  it("only keys real, reachable archetype ids (no typos)", () => {
    for (const id of Object.keys(worldCupSpines))
      expect(ARCHETYPE_ID_SET.has(id), `unknown archetype id: ${id}`).toBe(true);
  });

  for (const [id, sp] of Object.entries(worldCupSpines)) {
    describe(id, () => {
      it("has every field non-empty", () => {
        expect(sp.law.trim()).not.toBe("");
        expect(sp.reframe.trim()).not.toBe("");
        expect(sp.split.trim()).not.toBe("");
        expect(sp.closer.trim()).not.toBe("");
        expect(sp.tells.every((t) => t.trim() !== "")).toBe(true);
      });

      it("LAW is a 6–10 word quotable rule (§21 — the fixed token)", () => {
        const n = words(sp.law).length;
        expect(n, `LAW is ${n} words: "${sp.law}"`).toBeGreaterThanOrEqual(6);
        expect(n).toBeLessThanOrEqual(10);
      });

      it("has 2–3 tells (§21.A1 self-detection triggers)", () => {
        expect(sp.tells.length).toBeGreaterThanOrEqual(2);
        expect(sp.tells.length).toBeLessThanOrEqual(3);
      });

      it("CLOSER is ≤25 words (§21.C screenshottable budget)", () => {
        const n = words(sp.closer).length;
        expect(n, `closer is ${n} words`).toBeLessThanOrEqual(25);
      });

      it("uses no banned words or hedges (§21.D)", () => {
        const hay = allText(sp).toLowerCase();
        for (const b of BANNED)
          expect(new RegExp(`\\b${b}\\b`).test(hay), `contains banned "${b}"`).toBe(false);
      });

      it("slots reference real spine fields only", () => {
        for (const k of Object.keys(sp.slots ?? {}))
          expect(["law", "tells", "reframe", "split", "closer"]).toContain(k);
      });
    });
  }
});
