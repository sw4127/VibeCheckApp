import { describe, it, expect } from "vitest";
import {
  anchorReport,
  buildPremiumUserMessage,
  localPremiumReport,
  narratePremium,
  premiumHash,
  premiumReportSchema,
} from "./index";
import { SAMPLE_PROFILES } from "@/content/sample-profile";

const samples = Object.values(SAMPLE_PROFILES);

describe("localPremiumReport (fallback / no-key path)", () => {
  it("is schema-valid for every diverse sample profile", () => {
    for (const p of samples) {
      const report = localPremiumReport(p);
      expect(() => premiumReportSchema.parse(report), `invalid for ${p.id}`).not.toThrow();
    }
  });

  it("uses the engine's archetype verbatim and emits all five Big Five", () => {
    for (const p of samples) {
      const r = localPremiumReport(p);
      expect(r.archetype).toBe(p.archetype);
      expect(r.diagnosis.big_five).toHaveLength(5);
      expect(r.diagnosis.big_five.map((b) => b.trait)).toEqual(p.bigFive.map((b) => b.trait));
      expect(r.diagnosis.big_five.map((b) => b.level)).toEqual(p.bigFive.map((b) => b.level));
    }
  });

  it("references the user's actual artists (specificity, not filler)", () => {
    const p = SAMPLE_PROFILES.velvet_cynic;
    const r = localPremiumReport(p);
    const blob = JSON.stringify(r);
    expect(blob).toContain(p.artistsRecent[0]);
    expect(blob).toContain(p.artistsDurable[0]);
  });
});

describe("buildPremiumUserMessage", () => {
  it("sends MODE premium_report + the pre-split profile (writer never classifies)", () => {
    const msg = buildPremiumUserMessage(SAMPLE_PROFILES.velvet_cynic);
    expect(msg).toContain("MODE: premium_report");
    expect(msg).toContain("ARCHETYPE: The Velvet Cynic");
    expect(msg).toContain("Openness=High");
    expect(msg).toContain("ARTISTS_DURABLE:");
  });
});

describe("anchorReport (LLM writes, never judges — §6)", () => {
  it("forces engine levels + attachment style over whatever the model wrote", () => {
    const p = SAMPLE_PROFILES.velvet_cynic;
    // Simulate a model output that tried to re-judge the user.
    const drifted = localPremiumReport(p);
    drifted.diagnosis.big_five = drifted.diagnosis.big_five.map((b) => ({
      ...b,
      level: "Medium" as const, // model "decided" differently
    }));
    drifted.diagnosis.attachment_style.style = "Secure"; // model overrode
    drifted.archetype = "The Imposter";

    const anchored = anchorReport(drifted, p);
    expect(anchored.archetype).toBe(p.archetype);
    expect(anchored.diagnosis.big_five.map((b) => b.level)).toEqual(
      p.bigFive.map((b) => b.level),
    );
    expect(anchored.diagnosis.attachment_style.style).toBe(p.attachmentStyle);
    // The model's PROSE survives — only verdict fields are forced.
    expect(anchored.diagnosis.big_five[0].line).toBe(drifted.diagnosis.big_five[0].line);
  });

  it("backfills a line if the model dropped a trait", () => {
    const p = SAMPLE_PROFILES.hype_populist;
    const partial = localPremiumReport(p);
    partial.diagnosis.big_five = partial.diagnosis.big_five.slice(0, 3);
    const anchored = anchorReport(partial, p);
    expect(anchored.diagnosis.big_five).toHaveLength(5);
    for (const b of anchored.diagnosis.big_five) expect(b.line.length).toBeGreaterThan(0);
  });
});

describe("narratePremium cache (no key → local path)", () => {
  it("re-serves the identical result for the same profile (§19.A)", async () => {
    const p = SAMPLE_PROFILES.anxious_archivist;
    const a = await narratePremium(p);
    const b = await narratePremium(p);
    expect(a.source).toBe("local");
    expect(b).toBe(a); // same cached object, not a regeneration
  });
});

describe("premiumHash", () => {
  it("is deterministic and distinguishes different profiles", () => {
    const a = premiumHash(SAMPLE_PROFILES.velvet_cynic);
    expect(a).toBe(premiumHash(SAMPLE_PROFILES.velvet_cynic));
    expect(a).not.toBe(premiumHash(SAMPLE_PROFILES.hype_populist));
  });
});
