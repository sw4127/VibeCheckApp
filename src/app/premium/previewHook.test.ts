import { describe, it, expect } from "vitest";
import { buildPreviewHook } from "./previewHook";
import { lawForArchetypeLabel } from "@/content/music";
import { SAMPLE_PROFILES } from "@/content/sample-profile";

const SAMPLES = Object.values(SAMPLE_PROFILES);

describe("A1a — paywall hook + LAW dangle", () => {
  it("resolves a real LAW for each sample archetype, undefined for unknown", () => {
    for (const p of SAMPLES)
      expect(lawForArchetypeLabel(p.archetype), `no law for ${p.archetype}`).toBeTruthy();
    expect(lawForArchetypeLabel("The Nonexistent")).toBeUndefined();
  });

  for (const p of SAMPLES) {
    describe(p.archetype, () => {
      const law = lawForArchetypeLabel(p.archetype)!;
      const text = buildPreviewHook(p, true);

      it("re-states an engine fact: a scored trait level", () => {
        const extreme = p.bigFive.find((b) => b.level !== "Medium")!;
        expect(text).toContain(`${extreme.level} ${extreme.trait}`);
      });

      it("names the user's typed artist (the receipt)", () => {
        const artist = p.artistsRecent[0] ?? p.artistsDurable[0];
        expect(text).toContain(artist);
      });

      it("dangles the rule below the blur without stating it (anti-spoiler)", () => {
        expect(text).toContain("first line below");
        // The LAW text itself must NOT appear in the un-blurred hook.
        expect(text.includes(law)).toBe(false);
      });

      it("stays within the D2 ≤35-word hook budget", () => {
        // Count words, not punctuation tokens ("/", "—" are separators).
        const n = text.trim().split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
        expect(n, `hook is ${n} words: "${text}"`).toBeLessThanOrEqual(35);
      });
    });
  }

  it("falls back gracefully when no LAW exists (no dangle, no crash)", () => {
    const text = buildPreviewHook(SAMPLES[0], false);
    expect(text).toContain("un-blurred part");
    expect(text).not.toContain("first line below");
  });

  it("prints the 3 rendered hooks for the record", () => {
    for (const p of SAMPLES) {
      const law = lawForArchetypeLabel(p.archetype)!;
      console.log(`\n[${p.archetype}]`);
      console.log(`  HOOK (un-blurred): ${buildPreviewHook(p, true)}`);
      console.log(`  LAW  (1st blurred line): ${law}`);
    }
    expect(true).toBe(true);
  });
});
