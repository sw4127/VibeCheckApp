import { describe, it, expect } from "vitest";
import { seedFromWorldCup, wcAnswersFrom } from "./prior";
import { musicQuiz } from "./quiz";
import { worldCupQuiz } from "@/content/world-cup/quiz";
import type { Answers } from "@/engine";

const validIds = (qid: string) =>
  new Set(musicQuiz.questions.find((q) => q.id === qid)!.options.map((o) => o.id));

describe("§29 WC→music prior", () => {
  it("returns null on incomplete WC answers (falls back to the full quiz)", () => {
    expect(seedFromWorldCup({})).toBeNull();
    expect(seedFromWorldCup({ weekend: "plan" })).toBeNull();
    expect(seedFromWorldCup({ weekend: "nope", group: "glue", pressure: "cold", friends: "reliable", win: "next", problems: "calm", oneword: "steady" })).toBeNull();
  });

  it("ALWAYS snaps to real option ids, over the entire WC answer space", () => {
    const hooksIds = validIds("hooks");
    const whereIds = validIds("where");
    const total = worldCupQuiz.questions.reduce((a, q) => a * q.options.length, 1);
    for (let i = 0; i < total; i += 7) { // stride-sample ~2.3k of 16384 (deterministic)
      let n = i;
      const a: Answers = {};
      for (const q of worldCupQuiz.questions) {
        a[q.id] = q.options[n % q.options.length].id;
        n = Math.floor(n / q.options.length);
      }
      const s = seedFromWorldCup(a)!;
      expect(hooksIds.has(s.hooks)).toBe(true);
      expect(whereIds.has(s.where)).toBe(true);
    }
  });

  it("is deterministic and directionally sane", () => {
    const loner: Answers = { weekend: "slow", group: "quiet", pressure: "cold", friends: "intense", win: "next", problems: "grind", oneword: "relentless" };
    const social: Answers = { weekend: "chaos", group: "glue", pressure: "improv", friends: "theglue", win: "thank", problems: "rally", oneword: "magnetic" };
    expect(seedFromWorldCup(loner)).toEqual(seedFromWorldCup(loner));
    expect(seedFromWorldCup(loner)!.where).toBe("alone"); // low teamplay → listens alone
    expect(seedFromWorldCup(social)!.where).toBe("people"); // max teamplay → out loud
  });

  it("wcAnswersFrom extracts only WC qids from mixed params", () => {
    const p = new URLSearchParams("weekend=plan&group=glue&from=The+Poacher&rotation=calm");
    const a = wcAnswersFrom(p);
    expect(a).toEqual({ weekend: "plan", group: "glue" });
  });
});
