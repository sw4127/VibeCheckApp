import { describe, it, expect } from "vitest";
import {
  buildPremiumUserMessage,
  localPremiumReport,
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

describe("premiumHash", () => {
  it("is deterministic and distinguishes different profiles", () => {
    const a = premiumHash(SAMPLE_PROFILES.velvet_cynic);
    expect(a).toBe(premiumHash(SAMPLE_PROFILES.velvet_cynic));
    expect(a).not.toBe(premiumHash(SAMPLE_PROFILES.hype_populist));
  });
});
