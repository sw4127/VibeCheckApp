/**
 * Drift guard: scripts/analysis/pool-v3.json must mirror the live pool
 * (src/content/bias/items.ts) — the .mjs chart scripts key on it, and a pool
 * bump without a regenerated JSON would silently misclassify swapped items
 * in the write-up charts (N3).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BIAS_CLIPS, BIAS_POOL_VERSION } from "@/content/bias/items";
import { BIAS_SCALE_MAX } from "@/engine/bias";

const json = JSON.parse(
  readFileSync(join(__dirname, `pool-v${BIAS_POOL_VERSION}.json`), "utf8"),
);

describe(`pool-v${BIAS_POOL_VERSION}.json mirrors items.ts`, () => {
  it("matches pool version and scale", () => {
    expect(json.poolVersion).toBe(BIAS_POOL_VERSION);
    expect(json.scaleMax).toBe(BIAS_SCALE_MAX);
  });

  it("matches item ids, order, directions, and swap flags", () => {
    expect(json.items).toEqual(
      BIAS_CLIPS.map((c) => ({
        id: c.id,
        labelDirection: c.labelDirection,
        labelIsTrue: c.labelIsTrue,
      })),
    );
  });
});
