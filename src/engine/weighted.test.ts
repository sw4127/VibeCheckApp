import { describe, it, expect } from "vitest";
import {
  buildProfile,
  buildWeightedProfile,
  scoreAnswers,
  scoreWeightedAnswers,
  hashAnswers,
  hashWeighted,
  missingWeighted,
  parseAnswerChoice,
  encodeAnswerChoice,
  SPLIT_PRIMARY,
  SPLIT_SECONDARY,
  type Answers,
  type WeightedAnswers,
} from "@/engine";
import { worldCup } from "@/content/world-cup";
import { musicQuiz, musicArchetypes } from "@/content/music";

const WC = worldCup;
const wcAnswers: Answers = {
  weekend: "plan", group: "glue", pressure: "cold",
  friends: "reliable", win: "next", problems: "calm", oneword: "steady",
};
const musicAnswers: Answers = {
  rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
  sits: "nobody", sadsong: "sit", where: "alone",
};

describe("Slice 2a — weighted answers (engine)", () => {
  it("the split is a fixed, normalised 70/30", () => {
    expect(SPLIT_PRIMARY + SPLIT_SECONDARY).toBeCloseTo(1, 10);
    expect(SPLIT_PRIMARY).toBe(0.7);
    expect(SPLIT_SECONDARY).toBe(0.3);
  });

  it("BACKWARD-COMPAT: an all-single-pick set is byte-identical to buildProfile", () => {
    // Football
    expect(buildWeightedProfile(WC.quiz, WC.archetypes, WC.roster, wcAnswers)).toEqual(
      buildProfile(WC.quiz, WC.archetypes, WC.roster, wcAnswers),
    );
    // Music
    expect(
      buildWeightedProfile(musicQuiz, musicArchetypes, musicArchetypes, musicAnswers),
    ).toEqual(buildProfile(musicQuiz, musicArchetypes, musicArchetypes, musicAnswers));
  });

  it("an all-single-pick hash matches the single-pick hash (cache stays valid)", () => {
    expect(hashWeighted(WC.quiz, wcAnswers)).toBe(hashAnswers(WC.quiz, wcAnswers));
  });

  it("BLEND MATH: a 70/30 question = 0.7·primary + 0.3·secondary on every axis", () => {
    const pure = (opt: string): Answers => ({ ...wcAnswers, weekend: opt });
    const rawA = scoreAnswers(WC.quiz, pure("plan")); // primary
    const rawB = scoreAnswers(WC.quiz, pure("chaos")); // secondary
    const blend: WeightedAnswers = { ...wcAnswers, weekend: { primary: "plan", secondary: "chaos" } };
    const rawBlend = scoreWeightedAnswers(WC.quiz, blend);

    for (const dim of WC.quiz.dimensions) {
      const expected = SPLIT_PRIMARY * (rawA[dim] ?? 0) + SPLIT_SECONDARY * (rawB[dim] ?? 0);
      expect(rawBlend[dim] ?? 0, `axis ${dim}`).toBeCloseTo(expected, 10);
    }
  });

  it("CONVEXITY: the blend lands strictly between the two pure picks where they differ", () => {
    const rawA = scoreAnswers(WC.quiz, { ...wcAnswers, weekend: "plan" });
    const rawB = scoreAnswers(WC.quiz, { ...wcAnswers, weekend: "chaos" });
    const rawBlend = scoreWeightedAnswers(WC.quiz, {
      ...wcAnswers, weekend: { primary: "plan", secondary: "chaos" },
    });
    let sawDiff = false;
    for (const dim of WC.quiz.dimensions) {
      const a = rawA[dim] ?? 0, b = rawB[dim] ?? 0, x = rawBlend[dim] ?? 0;
      if (a !== b) {
        sawDiff = true;
        expect(x).toBeGreaterThan(Math.min(a, b));
        expect(x).toBeLessThan(Math.max(a, b));
      }
    }
    expect(sawDiff, "the two options must differ on at least one axis").toBe(true);
  });

  it("DETERMINISM: identical weighted answers → identical verdict (§6)", () => {
    const w: WeightedAnswers = { ...wcAnswers, pressure: { primary: "cold", secondary: "loud" } };
    expect(buildWeightedProfile(WC.quiz, WC.archetypes, WC.roster, w)).toEqual(
      buildWeightedProfile(WC.quiz, WC.archetypes, WC.roster, w),
    );
  });

  it("CACHE SEPARATION: a blend hashes differently from its pure-primary pick", () => {
    const blend: WeightedAnswers = { ...wcAnswers, weekend: { primary: "plan", secondary: "chaos" } };
    expect(hashWeighted(WC.quiz, blend)).not.toBe(hashWeighted(WC.quiz, wcAnswers));
  });

  it("VALIDATION: missingWeighted flags a missing primary and an invalid secondary", () => {
    const badSecondary: WeightedAnswers = {
      ...wcAnswers, weekend: { primary: "plan", secondary: "nope" },
    };
    expect(missingWeighted(WC.quiz, badSecondary)).toEqual(["weekend"]);

    const { pressure, ...missingOne } = wcAnswers; // drop a required question
    void pressure;
    expect(missingWeighted(WC.quiz, missingOne)).toContain("pressure");

    expect(missingWeighted(WC.quiz, wcAnswers)).toEqual([]); // all good
  });

  it("URL SYNTAX: parse/encode round-trips both a pick and a blend", () => {
    expect(parseAnswerChoice("calm")).toBe("calm");
    expect(parseAnswerChoice("calm~heavy")).toEqual({ primary: "calm", secondary: "heavy" });
    expect(parseAnswerChoice("calm~")).toBe("calm"); // empty secondary degrades to a pick
    expect(encodeAnswerChoice("calm")).toBe("calm");
    expect(encodeAnswerChoice({ primary: "calm", secondary: "heavy" })).toBe("calm~heavy");
    for (const v of ["calm", "calm~heavy"]) expect(encodeAnswerChoice(parseAnswerChoice(v))).toBe(v);
  });

  it("a blend still resolves to a real archetype + roster match (no crash)", () => {
    const p = buildWeightedProfile(WC.quiz, WC.archetypes, WC.roster, {
      ...wcAnswers, group: { primary: "glue", secondary: "idea" },
    });
    expect(WC.archetypes.centroids.some((c) => c.id === p.archetype.id)).toBe(true);
    expect(WC.roster.centroids.some((c) => c.id === p.match.id)).toBe(true);
  });
});
