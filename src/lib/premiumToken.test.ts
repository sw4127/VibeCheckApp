import { describe, it, expect } from "vitest";
import { encodePremiumToken, decodePremiumToken } from "./premiumToken";
import { SAMPLE_PROFILES } from "@/content/sample-profile";

describe("premium token", () => {
  it("round-trips a profile (levels, style, state, artists)", () => {
    const p = SAMPLE_PROFILES.velvet_cynic;
    const decoded = decodePremiumToken(encodePremiumToken(p));
    expect(decoded).not.toBeNull();
    expect(decoded!.archetype).toBe(p.archetype);
    expect(decoded!.bigFive.map((b) => b.level)).toEqual(p.bigFive.map((b) => b.level));
    expect(decoded!.attachmentStyle).toBe(p.attachmentStyle);
    expect(decoded!.stateLine).toBe(p.stateLine);
    expect(decoded!.artistsRecent).toEqual(p.artistsRecent);
    expect(decoded!.artistsDurable).toEqual(p.artistsDurable);
  });

  it("rejects malformed tokens (falls back to null, never throws)", () => {
    expect(decodePremiumToken(undefined)).toBeNull();
    expect(decodePremiumToken("")).toBeNull();
    expect(decodePremiumToken("not-base64!!")).toBeNull();
    expect(decodePremiumToken(Buffer.from("{}").toString("base64url"))).toBeNull();
    expect(decodePremiumToken(Buffer.from('{"v":"p1","a":"X","b":"HHXHH"}').toString("base64url"))).toBeNull();
  });

  it("stays under Stripe's 500-char metadata limit even at max field sizes", () => {
    const token = encodePremiumToken({
      id: "x",
      archetype: "A".repeat(80),
      bigFive: SAMPLE_PROFILES.velvet_cynic.bigFive,
      attachmentStyle: "Anxious-Preoccupied-Extended-Label".repeat(3),
      stateLine: "s".repeat(200),
      artistsRecent: ["Artist Name That Is Really Quite Long Indeed".repeat(2), "B".repeat(60), "C".repeat(60)],
      artistsDurable: ["D".repeat(60)],
    });
    expect(token.length).toBeLessThan(490);
    expect(decodePremiumToken(token)).not.toBeNull();
  });
});
