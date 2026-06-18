import { describe, it, expect } from "vitest";
import {
  localMusicReading, musicReadingSchema, buildMusicUserMessage, slangFor, ONLINE_SLANG,
} from "./index";
import { buildMusicProfile, splitLanes } from "@/content/music";
import type { Answers } from "@/engine";

const answers: Answers = {
  rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
  sits: "nobody", sadsong: "sit", where: "alone",
};
const profile = buildMusicProfile(answers);
const lanes = splitLanes(profile);

// Three diverse profiles for the §10.A online-voice contract.
const PROFILES = [
  { name: "sad introvert + artists", ans: answers, ar: ["Phoebe Bridgers"], ad: ["Radiohead"] },
  { name: "loud extravert mainstream",
    ans: { rotation: "bright", job: "scene", hooks: "beat", lately: "comfort", sits: "center", sadsong: "skip", where: "people" } as Answers,
    ar: [] as string[], ad: [] as string[] },
  { name: "mood-fixer",
    ans: { rotation: "calm", job: "change", hooks: "beat", lately: "comfort", sits: "center", sadsong: "skip", where: "alone" } as Answers,
    ar: ["Drake"], ad: [] as string[] },
].map((p) => {
  const prof = buildMusicProfile(p.ans);
  return { ...p, prof, lanes: splitLanes(prof) };
});

describe("localMusicReading (fallback / $0 path)", () => {
  it("is schema-valid with and without artists", () => {
    for (const [ar, ad] of [
      [["Phoebe Bridgers"], ["Radiohead"]],
      [[], []],
    ] as const) {
      const r = localMusicReading(profile, lanes, [...ar], [...ad]);
      expect(() => musicReadingSchema.parse(r)).not.toThrow();
      expect(r.archetype).toBe(profile.archetype.label);
      expect(r.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("references the actual artists when given (§8 specificity)", () => {
    const r = localMusicReading(profile, lanes, ["Phoebe Bridgers"], ["Radiohead"]);
    expect(r.vibe_check).toContain("Phoebe Bridgers");
    expect(r.vibe_check).toContain("Radiohead");
  });

  it("reads as exactly two sentences-ish (fits the card)", () => {
    const r = localMusicReading(profile, lanes, [], []);
    expect(r.vibe_check.length).toBeLessThan(280);
  });
});

describe("buildMusicUserMessage", () => {
  it("sends the pre-split lanes — the model narrates, never classifies (§17.B)", () => {
    const msg = buildMusicUserMessage(profile, lanes, ["A"], ["B"]);
    expect(msg).toContain("MODE: vibe_check");
    expect(msg).toContain(`ARCHETYPE: ${profile.archetype.label}`);
    expect(msg).toContain("TRAIT_SCORES (durable):");
    expect(msg).toContain("STATE_SCORES (recent mood):");
    expect(msg).toContain("ARTISTS_RECENT: [A]");
    expect(msg).toContain("ARTISTS_DURABLE: [B]");
  });
});

describe("online voice (§10.A) — vector-gated slang contract", () => {
  it("classic voice (default) contains ZERO slang — unchanged behaviour", () => {
    for (const p of PROFILES) {
      const r = localMusicReading(p.prof, p.lanes, p.ar, p.ad); // default classic
      for (const tok of ONLINE_SLANG) expect(r.vibe_check.toLowerCase()).not.toContain(tok);
    }
  });

  it("gates slang to the vector: at most 2, and NEVER an un-earned token", () => {
    for (const p of PROFILES) {
      const gated = slangFor(p.lanes);
      expect(gated.length).toBeLessThanOrEqual(2);
      // six-seven / rizzless are held out entirely.
      expect(gated).not.toContain("six-seven");
      expect(gated).not.toContain("rizzless");
      const r = localMusicReading(p.prof, p.lanes, p.ar, p.ad, "online");
      const text = r.vibe_check.toLowerCase();
      const present = ONLINE_SLANG.filter((tok) => text.includes(tok));
      expect(present.length).toBeLessThanOrEqual(2);
      for (const tok of present) expect(gated).toContain(tok); // only earned tokens appear
    }
  });

  it("online stays schema-valid, on-archetype, artist-specific, and card-sized", () => {
    for (const p of PROFILES) {
      const r = localMusicReading(p.prof, p.lanes, p.ar, p.ad, "online");
      expect(() => musicReadingSchema.parse(r)).not.toThrow();
      expect(r.archetype).toBe(p.prof.archetype.label);
      expect(r.vibe_check.length).toBeLessThan(280);
      if (p.ar[0]) expect(r.vibe_check).toContain(p.ar[0]); // specificity survives
    }
  });

  it("buildMusicUserMessage(online) offers ONLY the gated slang, with the guardrails", () => {
    const p = PROFILES[0];
    const msg = buildMusicUserMessage(p.prof, p.lanes, p.ar, p.ad, "online");
    expect(msg).toContain("VOICE: extremely-online");
    expect(msg).toContain("anti-Barnum");
    const gated = slangFor(p.lanes);
    expect(msg).toContain(`[${gated.join(", ")}]`);
    // never leaks the held-out / un-earned tokens into the prompt
    for (const tok of ONLINE_SLANG) {
      if (!gated.includes(tok)) expect(msg).not.toContain(tok);
    }
  });
});
