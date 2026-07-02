import { describe, it, expect } from "vitest";
import {
  localMusicReading, musicReadingSchema, buildMusicUserMessage, slangFor, ONLINE_SLANG,
} from "./index";
import { buildMusicProfile, composeMusicIdentity } from "@/content/music";
import type { Answers } from "@/engine";

const mk = (ans: Answers) => {
  const prof = buildMusicProfile(ans);
  return { c: composeMusicIdentity(prof), tags: prof.archetype.tags ?? [] };
};

// Three diverse composites for the voice/purity contracts.
const PROFILES = [
  { name: "sad introvert",
    ...mk({ rotation: "calm", job: "match", hooks: "lyrics", lately: "discover", sits: "nobody", sadsong: "sit", where: "alone" }) },
  { name: "loud extravert mainstream",
    ...mk({ rotation: "bright", job: "scene", hooks: "beat", lately: "comfort", sits: "center", sadsong: "skip", where: "people" }) },
  { name: "mood-fixer",
    ...mk({ rotation: "calm", job: "change", hooks: "beat", lately: "comfort", sits: "center", sadsong: "skip", where: "alone" }) },
];

describe("localMusicReading (fallback / $0 path) — composite edition", () => {
  it("is schema-valid, on-handle, and card-sized for all composites", () => {
    for (const p of PROFILES) {
      const r = localMusicReading(p.c, p.tags);
      expect(() => musicReadingSchema.parse(r)).not.toThrow();
      expect(r.archetype).toBe(p.c.handle);
      expect(r.tags.length).toBeGreaterThanOrEqual(2);
      expect(r.vibe_check.length).toBeLessThan(300);
    }
  });

  it("surfaces the matrix texture: a modifier/tilt line reaches the $0 read", () => {
    const p = PROFILES.find((x) => x.c.modifier || x.c.tilt)!;
    const r = localMusicReading(p.c, p.tags);
    const line = p.c.modifier?.line ?? p.c.tilt?.line ?? "";
    expect(r.vibe_check).toContain(line);
  });
});

describe("buildMusicUserMessage — §19.A key purity", () => {
  it("is a pure function of the composite: same key → byte-identical message", () => {
    // Two DIFFERENT answer sets that land on the same composite must produce
    // the same prompt (this is what makes the composite cache key correct).
    const a = mk({ rotation: "calm", job: "match", hooks: "lyrics", lately: "discover", sits: "nobody", sadsong: "sit", where: "alone" });
    const b = mk({ rotation: "calm", job: "match", hooks: "lyrics", lately: "discover", sits: "offpath", sadsong: "sit", where: "alone" });
    if (a.c.cacheKey === b.c.cacheKey) {
      expect(buildMusicUserMessage(a.c, a.tags)).toBe(buildMusicUserMessage(b.c, b.tags));
    }
    // And determinism regardless:
    expect(buildMusicUserMessage(a.c, a.tags)).toBe(buildMusicUserMessage(a.c, a.tags));
  });

  it("sends composite fields only — no artists, no raw scores", () => {
    const p = PROFILES[0];
    const msg = buildMusicUserMessage(p.c, p.tags);
    expect(msg).toContain("MODE: vibe_check");
    expect(msg).toContain(`ARCHETYPE: ${p.c.handle}`);
    expect(msg).toContain("TEXTURE (durable modifier):");
    expect(msg).toContain("WEATHER (recent state):");
    expect(msg).not.toContain("ARTISTS_RECENT");
    expect(msg).not.toContain("TRAIT_SCORES");
    expect(msg).not.toContain("STATE_SCORES");
  });

  it("tells the model not to parrot the authored lines", () => {
    const p = PROFILES[0];
    expect(buildMusicUserMessage(p.c, p.tags)).toContain("never quote them verbatim");
  });
});

describe("online voice (§10.A) — composite-gated slang contract", () => {
  it("classic voice (default) contains ZERO slang — unchanged behaviour", () => {
    for (const p of PROFILES) {
      const r = localMusicReading(p.c, p.tags); // default classic
      for (const tok of ONLINE_SLANG) expect(r.vibe_check.toLowerCase()).not.toContain(tok);
    }
  });

  it("gates slang to the composite: ≤2, never an un-earned or held-out token", () => {
    for (const p of PROFILES) {
      const gated = slangFor(p.c);
      expect(gated.length).toBeLessThanOrEqual(2);
      // six-seven / rizzless held out; crash-out unreachable from a composite.
      for (const held of ["six-seven", "rizzless", "crash-out"]) expect(gated).not.toContain(held);
      const r = localMusicReading(p.c, p.tags, "online");
      const text = r.vibe_check.toLowerCase();
      const present = ONLINE_SLANG.filter((tok) => text.includes(tok));
      expect(present.length).toBeLessThanOrEqual(2);
      for (const tok of present) expect(gated).toContain(tok); // only earned tokens appear
    }
  });

  it("buildMusicUserMessage(online) offers ONLY the gated slang, with the guardrails", () => {
    const p = PROFILES[0];
    const msg = buildMusicUserMessage(p.c, p.tags, "online");
    expect(msg).toContain("VOICE: extremely-online");
    expect(msg).toContain("anti-Barnum");
    const gated = slangFor(p.c);
    expect(msg).toContain(`[${gated.join(", ")}]`);
    for (const tok of ONLINE_SLANG) {
      if (!gated.includes(tok)) expect(msg).not.toContain(tok);
    }
  });
});
