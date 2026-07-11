/**
 * Design-constraint tests for the Prestige-Bias item pool (mirrors the
 * world-cup design.test.ts pattern): the pool's psychometric shape is a
 * contract, not a suggestion. If the PM re-authors items, these must still
 * pass — or the change is a decision, not an accident.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BIAS_CLIPS, BIAS_POOL_VERSION } from "./items";

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

  it("pool version is a positive integer (RT-7b: rides every share URL + dataset event)", () => {
    expect(Number.isInteger(BIAS_POOL_VERSION)).toBe(true);
    expect(BIAS_POOL_VERSION).toBeGreaterThanOrEqual(1);
  });

  it("every REAL (non-placeholder) audioSrc exists under public/", () => {
    for (const c of BIAS_CLIPS) {
      if (c.audioSrc.includes("PLACEHOLDER")) continue;
      const file = join(process.cwd(), "public", c.audioSrc);
      expect(existsSync(file), `missing audio file for ${c.id}: ${c.audioSrc}`).toBe(true);
    }
  });

  // rt-answers §Content-ops item 4: "fail CI if any item lacks a license
  // snapshot or proof URL". This is that gate — it arms itself the moment an
  // item stops being a placeholder.
  it("every REAL item has a license snapshot + proof URL + source hash in the manifest", () => {
    interface ManifestItem {
      id: string;
      license: { proofPageUrl: string | null; snapshotFile: string | null; confirmedAt: string | null };
      source: { sha256: string | null };
    }
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "src", "content", "bias", "manifest.json"), "utf8"),
    ) as { items: ManifestItem[] };
    for (const c of BIAS_CLIPS) {
      if (c.audioSrc.includes("PLACEHOLDER")) continue;
      const entry = manifest.items.find((i) => i.id === c.id);
      expect(entry, `no manifest entry for real item ${c.id}`).toBeDefined();
      expect(entry!.license.proofPageUrl, `${c.id}: license proof URL missing`).toBeTruthy();
      expect(entry!.license.snapshotFile, `${c.id}: license snapshot missing (run clip-pipeline snapshot)`).toBeTruthy();
      expect(
        entry!.license.snapshotFile && existsSync(join(process.cwd(), "src", "content", "bias", "licenses", entry!.license.snapshotFile)),
        `${c.id}: snapshot file not on disk`,
      ).toBe(true);
      expect(entry!.source.sha256, `${c.id}: source sha256 missing (run clip-pipeline download)`).toBeTruthy();
    }
  });
});
