import { describe, it, expect } from "vitest";
import { localMusicReading, musicReadingSchema, buildMusicUserMessage } from "./index";
import { buildMusicProfile, splitLanes } from "@/content/music";
import type { Answers } from "@/engine";

const answers: Answers = {
  rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
  sits: "nobody", sadsong: "sit", where: "alone",
};
const profile = buildMusicProfile(answers);
const lanes = splitLanes(profile);

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
