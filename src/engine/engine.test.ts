import { describe, it, expect } from "vitest";
import {
  buildProfile,
  canonicalAnswers,
  dimensionRanges,
  distance,
  hashAnswers,
  isComplete,
  missingAnswers,
  nearestMatch,
  normalize,
  scoreAnswers,
} from "./index";
import type { Answers, CentroidSet, QuizConfig } from "./types";

// --- Synthetic 2-dimension fixture (NOT the real World Cup content) ---------
const config: QuizConfig = {
  id: "test-quiz",
  title: "Test",
  dimensions: ["a", "b"],
  questions: [
    {
      id: "q1",
      prompt: "Q1",
      options: [
        { id: "hi", label: "high a", weights: { a: 2 } },
        { id: "lo", label: "low a", weights: { a: 0 } },
      ],
    },
    {
      id: "q2",
      prompt: "Q2",
      options: [
        { id: "hi", label: "high b", weights: { b: 2 } },
        { id: "lo", label: "low b", weights: { b: 0 } },
      ],
    },
  ],
};

const archetypes: CentroidSet = {
  id: "arch",
  centroids: [
    { id: "a1", label: "A One", vector: { a: 1, b: 0 } },
    { id: "a2", label: "A Two", vector: { a: 0, b: 1 } },
  ],
};

const roster: CentroidSet = {
  id: "roster",
  centroids: [
    { id: "alpha", label: "Alpha", vector: { a: 1, b: 1 }, tags: ["bold"] },
    { id: "beta", label: "Beta", vector: { a: 0, b: 0 }, tags: ["calm"] },
  ],
};

const high: Answers = { q1: "hi", q2: "hi" };
const low: Answers = { q1: "lo", q2: "lo" };

describe("scoreAnswers", () => {
  it("sums selected option weights per dimension", () => {
    expect(scoreAnswers(config, high)).toEqual({ a: 2, b: 2 });
    expect(scoreAnswers(config, low)).toEqual({ a: 0, b: 0 });
    expect(scoreAnswers(config, { q1: "hi", q2: "lo" })).toEqual({ a: 2, b: 0 });
  });

  it("seeds every declared dimension even with no contribution", () => {
    expect(scoreAnswers(config, low)).toHaveProperty("a", 0);
    expect(scoreAnswers(config, low)).toHaveProperty("b", 0);
  });
});

describe("dimensionRanges / normalize", () => {
  it("computes reachable min/max per dimension", () => {
    expect(dimensionRanges(config)).toEqual({
      a: { min: 0, max: 2 },
      b: { min: 0, max: 2 },
    });
  });

  it("maps raw scores into [0,1]", () => {
    expect(normalize(config, { a: 2, b: 2 })).toEqual({ a: 1, b: 1 });
    expect(normalize(config, { a: 0, b: 0 })).toEqual({ a: 0, b: 0 });
    expect(normalize(config, { a: 1, b: 1 })).toEqual({ a: 0.5, b: 0.5 });
  });

  it("clamps out-of-range values and neutralizes zero-spread dims", () => {
    expect(normalize(config, { a: 99, b: -99 })).toEqual({ a: 1, b: 0 });
    const flat: QuizConfig = {
      ...config,
      questions: [
        {
          id: "q1",
          prompt: "Q1",
          options: [
            { id: "x", label: "x", weights: { a: 5 } },
            { id: "y", label: "y", weights: { a: 5 } },
          ],
        },
      ],
      dimensions: ["a"],
    };
    expect(normalize(flat, { a: 5 })).toEqual({ a: 0.5 });
  });
});

describe("distance / nearestMatch", () => {
  it("measures only over dimensions the centroid declares", () => {
    expect(distance({ a: 1, b: 1 }, { a: 1, b: 1 })).toBe(0);
    expect(distance({ a: 1, b: 0 }, { a: 0 })).toBe(1);
  });

  it("treats a missing user dimension as neutral 0.5", () => {
    expect(distance({}, { a: 0.5 })).toBe(0);
  });

  it("picks the closest centroid", () => {
    expect(nearestMatch({ a: 1, b: 1 }, roster.centroids).id).toBe("alpha");
    expect(nearestMatch({ a: 0, b: 0 }, roster.centroids).id).toBe("beta");
  });

  it("breaks ties deterministically by ascending id", () => {
    // Equidistant from a1 and a2; lower id "a1" must win, repeatably.
    const r1 = nearestMatch({ a: 1, b: 1 }, archetypes.centroids);
    const r2 = nearestMatch({ a: 1, b: 1 }, archetypes.centroids);
    expect(r1.id).toBe("a1");
    expect(r2.id).toBe("a1");
  });

  it("throws on an empty centroid set (config bug)", () => {
    expect(() => nearestMatch({ a: 1 }, [])).toThrow();
  });
});

describe("completeness", () => {
  it("flags missing and invalid answers", () => {
    expect(missingAnswers(config, high)).toEqual([]);
    expect(missingAnswers(config, { q1: "hi" })).toEqual(["q2"]);
    expect(missingAnswers(config, { q1: "nope", q2: "hi" })).toEqual(["q1"]);
    expect(isComplete(config, high)).toBe(true);
    expect(isComplete(config, { q1: "hi" })).toBe(false);
  });
});

describe("hashing", () => {
  it("is independent of answer key insertion order", () => {
    const a: Answers = { q1: "hi", q2: "lo" };
    const b: Answers = { q2: "lo", q1: "hi" };
    expect(canonicalAnswers(config, a)).toBe(canonicalAnswers(config, b));
    expect(hashAnswers(config, a)).toBe(hashAnswers(config, b));
  });

  it("differs for different answers and namespaces by quiz id", () => {
    expect(hashAnswers(config, high)).not.toBe(hashAnswers(config, low));
    const other: QuizConfig = { ...config, id: "other-quiz" };
    expect(hashAnswers(other, high)).not.toBe(hashAnswers(config, high));
  });
});

describe("buildProfile", () => {
  it("produces the complete deterministic verdict", () => {
    const p = buildProfile(config, archetypes, roster, high);
    expect(p.normalized).toEqual({ a: 1, b: 1 });
    expect(p.match.id).toBe("alpha");
    expect(p.match.tags).toEqual(["bold"]);
    expect(p.archetype.id).toBe("a1"); // tie -> lowest id
    expect(p.rankedMatches.map((m) => m.id)).toEqual(["alpha", "beta"]);
    expect(p.hash).toBe(hashAnswers(config, high));
  });

  it("is fully deterministic: identical answers -> identical profile", () => {
    const p1 = buildProfile(config, archetypes, roster, high);
    const p2 = buildProfile(config, archetypes, roster, { q2: "hi", q1: "hi" });
    expect(p1).toEqual(p2);
  });

  it("refuses to score an incomplete answer set", () => {
    expect(() => buildProfile(config, archetypes, roster, { q1: "hi" })).toThrow(
      /incomplete/,
    );
  });
});
