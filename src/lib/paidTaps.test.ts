import { describe, it, expect } from "vitest";
import { applyPaidTaps, neededTaps, PAID_TAPS } from "./paidTaps";
import { premiumHash, localPremiumReport } from "@/llm";
import { buildMusicProfile, musicPremiumProfile } from "@/content/music";
import type { Answers } from "@/engine";

const musicAnswers: Answers = {
  rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
  sits: "nobody", sadsong: "sit", where: "alone",
};
const musicProfile = musicPremiumProfile(buildMusicProfile(musicAnswers), [], []);

describe("paid calibration taps (§18.E)", () => {
  it("asks only for unmeasured (Medium) traits", () => {
    const taps = neededTaps(musicProfile); // C/A/N are placeholders on music profiles
    expect(taps.map((t) => t.id).sort()).toEqual(["a", "c", "n"]);
  });

  it("maps answers to engine levels deterministically", () => {
    const upgraded = applyPaidTaps(musicProfile, { c: "meticulous", a: "never", n: "betrayed" });
    const get = (t: string) => upgraded.bigFive.find((b) => b.trait === t)!.level;
    expect(get("Conscientiousness")).toBe("High");
    expect(get("Agreeableness")).toBe("Low");
    expect(get("Neuroticism")).toBe("High");
    // Measured traits untouched.
    expect(get("Openness")).toBe(musicProfile.bigFive.find((b) => b.trait === "Openness")!.level);
  });

  it("ignores invalid/missing option ids (no-op, never throws)", () => {
    const same = applyPaidTaps(musicProfile, { c: "not-an-option" });
    expect(same.bigFive).toEqual(musicProfile.bigFive);
    expect(applyPaidTaps(musicProfile, {})).toBe(musicProfile);
  });

  it("changes premiumHash → the report regenerates with full signal (§20.B2)", () => {
    const upgraded = applyPaidTaps(musicProfile, { c: "chaos", a: "laugh", n: "love" });
    expect(premiumHash(upgraded)).not.toBe(premiumHash(musicProfile));
    const report = localPremiumReport(upgraded);
    // All five measured → traits may include C/A/N and the collapse line is gone.
    expect(report.diagnosis.steady_line).toBe("");
  });

  it("every tap option carries a valid level", () => {
    for (const tap of PAID_TAPS)
      for (const o of tap.options) expect(["High", "Medium", "Low"]).toContain(o.level);
  });
});
