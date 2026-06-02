import { describe, it, expect } from "vitest";
import { buildProfile, dimensionRanges, type Answers } from "@/engine";
import { worldCup } from "./index";

const { quiz, archetypes, roster } = worldCup;
const dims = new Set(quiz.dimensions);

describe("World Cup config integrity", () => {
  it("has unique question and per-question option ids", () => {
    const qIds = quiz.questions.map((q) => q.id);
    expect(new Set(qIds).size).toBe(qIds.length);
    for (const q of quiz.questions) {
      const oIds = q.options.map((o) => o.id);
      expect(new Set(oIds).size).toBe(oIds.length);
    }
  });

  it("only weights declared dimensions", () => {
    for (const q of quiz.questions)
      for (const o of q.options)
        for (const dim of Object.keys(o.weights))
          expect(dims.has(dim)).toBe(true);
  });

  it("gives every dimension real spread (so normalization is meaningful)", () => {
    const ranges = dimensionRanges(quiz);
    for (const dim of quiz.dimensions)
      expect(ranges[dim].max).toBeGreaterThan(ranges[dim].min);
  });

  it("has centroid vectors within [0,1] over declared dimensions only", () => {
    for (const set of [archetypes, roster])
      for (const c of set.centroids)
        for (const [dim, v] of Object.entries(c.vector)) {
          expect(dims.has(dim)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
  });

  it("has unique roster + archetype ids", () => {
    const rIds = roster.centroids.map((c) => c.id);
    const aIds = archetypes.centroids.map((c) => c.id);
    expect(new Set(rIds).size).toBe(rIds.length);
    expect(new Set(aIds).size).toBe(aIds.length);
  });
});

describe("World Cup outcomes", () => {
  // Enumerate the full answer space (4^7 = 16384) and inspect the distribution.
  function allOutcomes() {
    const players = new Map<string, number>();
    const archs = new Map<string, number>();
    const counts = quiz.questions.map((q) => q.options.length);
    const total = counts.reduce((a, b) => a * b, 1);
    for (let i = 0; i < total; i++) {
      let n = i;
      const answers: Answers = {};
      for (const q of quiz.questions) {
        const k = q.options.length;
        answers[q.id] = q.options[n % k].id;
        n = Math.floor(n / k);
      }
      const p = buildProfile(quiz, archetypes, roster, answers);
      players.set(p.match.id, (players.get(p.match.id) ?? 0) + 1);
      archs.set(p.archetype.id, (archs.get(p.archetype.id) ?? 0) + 1);
    }
    return { players, archs, total };
  }

  const { players, archs, total } = allOutcomes();

  it("covers the full answer space without throwing", () => {
    expect(total).toBe(16384);
  });

  it("reaches a healthy variety of players (not funneled to one)", () => {
    expect(players.size).toBeGreaterThanOrEqual(8);
    // No single player should dominate the entire space.
    const max = Math.max(...players.values());
    expect(max / total).toBeLessThan(0.4);
  });

  it("uses most archetypes across the space", () => {
    expect(archs.size).toBeGreaterThanOrEqual(5);
  });

  it("is deterministic for a fixed answer set", () => {
    const a: Answers = {
      weekend: "plan", group: "glue", pressure: "cold",
      friends: "reliable", win: "next", problems: "calm", oneword: "steady",
    };
    expect(buildProfile(quiz, archetypes, roster, a)).toEqual(
      buildProfile(quiz, archetypes, roster, a),
    );
  });
});
