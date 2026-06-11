import { describe, it, expect } from "vitest";
import { buildProtocol, pickProtocolAxis } from "./protocol";
import { localPremiumReport, anchorReport } from "./index";
import { SAMPLE_PROFILES } from "@/content/sample-profile";
import type { StateLevels } from "@/content/sample-profile";

const L = ["High", "Medium", "Low"] as const;

describe("7-Day Recalibration (§20.B4)", () => {
  it("always returns a full 7-day track for every state-level combo", () => {
    for (const e of L) for (const r of L) for (const g of L) {
      const p = {
        ...SAMPLE_PROFILES.velvet_cynic,
        stateLevels: { energy: e, regulation: g, rumination: r } as StateLevels,
      };
      const proto = buildProtocol(p);
      expect(proto.days).toHaveLength(7);
      expect(proto.title).toMatch(/^The 7-Day Recalibration: /);
      for (const d of proto.days) expect(d.length).toBeGreaterThan(0);
    }
    // No state lane at all (legacy p1 token) → maintenance track, never crashes.
    const legacy = { ...SAMPLE_PROFILES.velvet_cynic, stateLevels: undefined };
    expect(buildProtocol(legacy).days).toHaveLength(7);
  });

  it("targets the most extreme state axis, priority order on ties (§20.B4)", () => {
    expect(pickProtocolAxis({ energy: "High", regulation: "High", rumination: "High" })).toBe("rumination");
    expect(pickProtocolAxis({ energy: "High", regulation: "Medium", rumination: "Medium" })).toBe("energy");
    expect(pickProtocolAxis({ energy: "Medium", regulation: "Medium", rumination: "Medium" })).toBeNull();
  });

  it("is engine content: fallback includes it and anchor overrides the model's", () => {
    const p = SAMPLE_PROFILES.velvet_cynic; // rumination High → De-marination
    const local = localPremiumReport(p);
    expect(local.prescription.protocol?.title).toContain("De-marination");

    const drifted = localPremiumReport(p);
    drifted.prescription.protocol = { title: "Model Invention", days: ["x"] };
    const anchored = anchorReport(drifted, p);
    expect(anchored.prescription.protocol?.title).toContain("De-marination");
    expect(anchored.prescription.protocol?.days).toHaveLength(7);
  });
});
