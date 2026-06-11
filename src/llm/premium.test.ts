import { describe, it, expect } from "vitest";
import {
  anchorReport,
  buildPremiumUserMessage,
  localPremiumReport,
  narratePremium,
  premiumHash,
  premiumReportSchema,
  receiptFacts,
} from "./index";
import { SAMPLE_PROFILES } from "@/content/sample-profile";
import { buildMusicProfile, musicPremiumProfile } from "@/content/music";
import type { Answers } from "@/engine";

const samples = Object.values(SAMPLE_PROFILES);

// A real music-derived profile (O/E measured, C/A/N Medium placeholders).
const musicAnswers: Answers = {
  rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
  sits: "nobody", sadsong: "sit", where: "alone",
};
const musicProfile = musicPremiumProfile(buildMusicProfile(musicAnswers), ["Phoebe Bridgers"], ["Radiohead"]);

describe("localPremiumReport v2 (fallback / $0 path)", () => {
  it("is schema-valid for every sample profile AND a music-derived profile", () => {
    for (const p of [...samples, musicProfile]) {
      const r = localPremiumReport(p);
      expect(() => premiumReportSchema.parse(r), `invalid for ${p.id}`).not.toThrow();
    }
  });

  it("renders the Split with LATELY tied to engine state levels (§20.B1)", () => {
    const r = localPremiumReport(SAMPLE_PROFILES.velvet_cynic); // rumination High
    expect(r.split.lately.headline).toBe("You've been sitting in it.");
    expect(r.split.lately.lines.length).toBeGreaterThanOrEqual(2);
    expect(r.split.always.lines.length).toBeGreaterThanOrEqual(2);
    expect(r.split.verdict.length).toBeGreaterThan(0);
  });

  it("is signal-only: Medium traits collapse into steady_line (§20.B2)", () => {
    const r = localPremiumReport(musicProfile); // C/A/N are Medium placeholders
    const rendered = r.diagnosis.traits.map((t) => t.trait);
    expect(rendered).not.toContain("Conscientiousness");
    expect(rendered).not.toContain("Agreeableness");
    expect(rendered).not.toContain("Neuroticism");
    expect(r.diagnosis.traits.every((t) => t.level !== "Medium")).toBe(true);
    expect(r.diagnosis.steady_line.length).toBeGreaterThan(0);
  });

  it("every red flag carries a receipt (§20.B3)", () => {
    for (const p of [...samples, musicProfile]) {
      const r = localPremiumReport(p);
      expect(r.red_flags).toHaveLength(3);
      for (const f of r.red_flags) {
        expect(f.flag.length).toBeGreaterThan(0);
        expect(f.receipt.length).toBeGreaterThan(0);
      }
    }
  });

  it("references the user's actual artists (§8/§21 specificity)", () => {
    const blob = JSON.stringify(localPremiumReport(SAMPLE_PROFILES.velvet_cynic));
    expect(blob).toContain("Radiohead");
  });

  it("two different profiles never share Red Flags or the Split (anti-Barnum)", () => {
    const a = localPremiumReport(SAMPLE_PROFILES.velvet_cynic);
    const b = localPremiumReport(SAMPLE_PROFILES.hype_populist);
    expect(a.red_flags.map((f) => f.flag)).not.toEqual(b.red_flags.map((f) => f.flag));
    expect(a.split.lately.headline).not.toBe(b.split.lately.headline);
  });
});

describe("anchorReport v2 (LLM writes, never judges — §6/§19.B1)", () => {
  it("forces engine levels, drops Medium traits, keeps model prose", () => {
    const p = SAMPLE_PROFILES.velvet_cynic;
    const drifted = localPremiumReport(p);
    // Simulate a model that re-judged: wrong levels, wrong style, extra trait.
    drifted.diagnosis.traits = [
      { trait: "Openness", level: "Low", line: "model prose for openness" },
      { trait: "Agreeableness", level: "High", line: "should be dropped (engine says Medium)" },
    ];
    drifted.diagnosis.attachment_style.style = "Secure";
    drifted.archetype = "The Imposter";
    drifted.diagnosis.steady_line = "";

    const a = anchorReport(drifted, p);
    expect(a.archetype).toBe(p.archetype);
    expect(a.diagnosis.attachment_style.style).toBe(p.attachmentStyle);
    const open = a.diagnosis.traits.find((t) => t.trait === "Openness")!;
    expect(open.level).toBe("High"); // engine wins
    expect(open.line).toBe("model prose for openness"); // prose survives
    expect(a.diagnosis.traits.map((t) => t.trait)).not.toContain("Agreeableness");
    expect(a.diagnosis.steady_line.length).toBeGreaterThan(0); // collapse guaranteed
  });
});

describe("receiptFacts (§21.A5 — only engine-true citables)", () => {
  it("derives facts from non-Medium levels only", () => {
    const facts = receiptFacts(SAMPLE_PROFILES.velvet_cynic);
    expect(facts.some((f) => f.includes("Q6"))).toBe(true); // rumination High
    expect(facts.some((f) => f.includes("Q7"))).toBe(true); // extraversion Low
  });
});

describe("buildPremiumUserMessage v2", () => {
  it("sends pre-split lanes + receipt facts (writer never classifies)", () => {
    const msg = buildPremiumUserMessage(SAMPLE_PROFILES.velvet_cynic);
    expect(msg).toContain("MODE: premium_report");
    expect(msg).toContain("TRAIT_SCORES:");
    expect(msg).toContain("STATE_SCORES: Energy=Low, Regulation=Low, Rumination=High");
    expect(msg).toContain("RECEIPT_FACTS:");
    expect(msg).toContain("ARTISTS_DURABLE: [Radiohead]");
  });
});

describe("narratePremium cache (no key → local path)", () => {
  it("re-serves the identical result for the same profile (§19.A)", async () => {
    const a = await narratePremium(SAMPLE_PROFILES.anxious_archivist);
    const b = await narratePremium(SAMPLE_PROFILES.anxious_archivist);
    expect(a.source).toBe("local");
    expect(b).toBe(a);
  });
});

describe("premiumHash", () => {
  it("is deterministic and distinguishes profiles incl. state levels", () => {
    const a = premiumHash(SAMPLE_PROFILES.velvet_cynic);
    expect(a).toBe(premiumHash(SAMPLE_PROFILES.velvet_cynic));
    expect(a).not.toBe(premiumHash(SAMPLE_PROFILES.hype_populist));
    const altered = {
      ...SAMPLE_PROFILES.velvet_cynic,
      stateLevels: { energy: "High" as const, regulation: "Low" as const, rumination: "High" as const },
    };
    expect(premiumHash(altered)).not.toBe(a);
  });
});
