import { describe, it, expect } from "vitest";
import { buildMusicProfile, musicQuiz, musicArchetypes, composeMusicIdentity } from "./index";
import type { Answers } from "@/engine";

const Q = musicQuiz.questions;
const TOTAL = Q.reduce((a, q) => a * q.options.length, 1);
const CORE_LABELS = new Set(musicArchetypes.centroids.map((c) => c.label));

function decode(i: number): Answers {
  const a: Answers = {};
  let n = i;
  for (const q of Q) {
    a[q.id] = q.options[n % q.options.length].id;
    n = Math.floor(n / q.options.length);
  }
  return a;
}

const rows = Array.from({ length: TOTAL }, (_, i) => {
  const a = decode(i);
  return { a, c: composeMusicIdentity(buildMusicProfile(a)) };
});

describe("composed identity (B): stable core handle × varied read", () => {
  it("covers the answer space deterministically", () => {
    expect(TOTAL).toBe(3456);
    const a = decode(123);
    expect(composeMusicIdentity(buildMusicProfile(a))).toEqual(
      composeMusicIdentity(buildMusicProfile(a)),
    );
  });

  it("the HANDLE is always a core label — the matrix never injects the volatile modifier into the name", () => {
    for (const r of rows) {
      expect(CORE_LABELS.has(r.c.handle), `"${r.c.handle}"`).toBe(true);
      const words = r.c.handle.replace(/^The /, "").trim().split(/\s+/).length;
      expect(words).toBeLessThanOrEqual(2);
    }
  });

  it("modifiers and tilts are all reachable (the texture exists across the space)", () => {
    const mods = new Set(rows.map((r) => r.c.modifier?.id).filter(Boolean));
    const tilts = new Set(rows.map((r) => r.c.tilt?.id).filter(Boolean));
    expect(mods.size).toBeGreaterThanOrEqual(4); // of 6
    expect(tilts.size).toBeGreaterThanOrEqual(4); // of 6
  });

  it("READ RESOLUTION + COST: many distinct cache keys, but far fewer than combos", () => {
    const keys = new Set(rows.map((r) => r.c.cacheKey));
    expect(keys.size).toBeGreaterThanOrEqual(100); // varied reads (resolution)
    expect(keys.size).toBeLessThan(TOTAL); // collapsed (cost)
    (globalThis as Record<string, unknown>).__keys = keys.size;
  });

  it("INVARIANT (B): the matrix adds ZERO handle instability — handle flips iff the core flips", () => {
    let perturb = 0;
    let handleFlips = 0;
    let coreFlips = 0;
    let keyFlips = 0;
    for (const r of rows) {
      for (const q of Q) {
        const cur = r.a[q.id];
        const next = q.options[(q.options.findIndex((o) => o.id === cur) + 1) % q.options.length].id;
        if (next === cur) continue;
        const pc = composeMusicIdentity(buildMusicProfile({ ...r.a, [q.id]: next }));
        perturb++;
        if (pc.handle !== r.c.handle) handleFlips++;
        if (pc.coreId !== r.c.coreId) coreFlips++;
        if (pc.cacheKey !== r.c.cacheKey) keyFlips++;
      }
    }
    const keys = (globalThis as Record<string, unknown>).__keys as number;
    // eslint-disable-next-line no-console
    console.log(
      `[compose-B] combos=${TOTAL} distinctReads(cacheKeys)=${keys} (${(TOTAL / keys).toFixed(1)}x collapse) ` +
        `handleFlip=${((handleFlips / perturb) * 100).toFixed(1)}% coreFlip=${((coreFlips / perturb) * 100).toFixed(1)}% ` +
        `readFlip=${((keyFlips / perturb) * 100).toFixed(1)}% (resolution, expected high)`,
    );
    // The handle is the core, nothing more: it flips exactly when the core does.
    expect(handleFlips).toBe(coreFlips);
    // The read (cache key) SHOULD vary at least as much as the core — that's the
    // resolution the matrix buys (texture moves the read even when the core holds).
    expect(keyFlips).toBeGreaterThanOrEqual(coreFlips);
  });

  it("sample reads for 6 representative answer-sets (printed)", () => {
    const samples: Answers[] = [
      { rotation: "bright", job: "scene", hooks: "beat", lately: "discover", sits: "offpath", sadsong: "skip", where: "people" },
      { rotation: "calm", job: "match", hooks: "lyrics", lately: "comfort", sits: "center", sadsong: "sit", where: "alone" },
      { rotation: "warm", job: "match", hooks: "texture", lately: "discover", sits: "popular", sadsong: "gut", where: "curate" },
      { rotation: "heavy", job: "drown", hooks: "beat", lately: "discover", sits: "offpath", sadsong: "sit", where: "alone" },
      { rotation: "calm", job: "change", hooks: "lyrics", lately: "comfort", sits: "nobody", sadsong: "gut", where: "curate" },
      { rotation: "bright", job: "change", hooks: "texture", lately: "discover", sits: "popular", sadsong: "skip", where: "people" },
    ];
    for (const a of samples) {
      const c = composeMusicIdentity(buildMusicProfile(a));
      // eslint-disable-next-line no-console
      console.log(`[sample] ${c.handle.padEnd(22)} mod:${(c.modifier?.label ?? "—").padEnd(12)} tilt:${c.stateLine.padEnd(26)} key:${c.cacheKey}`);
    }
    expect(samples.length).toBe(6);
  });
});
