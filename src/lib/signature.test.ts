import { describe, it, expect } from "vitest";
import { buildProfile, percentileNormalize, scoreAnswers, type Answers } from "@/engine";
import { worldCup } from "@/content/world-cup";
import { buildMusicProfile, musicQuiz } from "@/content/music";
import {
  buildSignatureRows,
  FOOTBALL_SIGNATURE_LABELS,
  MUSIC_SIGNATURE_LABELS,
} from "./signature";

const wcAnswers: Answers = {
  weekend: "plan", group: "glue", pressure: "cold",
  friends: "reliable", win: "next", problems: "calm", oneword: "steady",
};

describe("buildSignatureRows", () => {
  const profile = buildProfile(worldCup.quiz, worldCup.archetypes, worldCup.roster, wcAnswers);
  const rows = buildSignatureRows(worldCup.quiz, wcAnswers, profile.normalized, FOOTBALL_SIGNATURE_LABELS);

  it("emits one labelled, 0–100 row per axis (declared order; chart sorts)", () => {
    expect(rows.map((r) => r.axis)).toEqual([...worldCup.quiz.dimensions]);
    for (const r of rows) {
      expect(r.value).toBeGreaterThanOrEqual(0);
      expect(r.value).toBeLessThanOrEqual(100);
      expect(r.label).toBe(FOOTBALL_SIGNATURE_LABELS[r.axis]);
    }
  });

  it("HONESTY: a driven proof is always a real answer the user picked — never fabricated", () => {
    const chosen = new Set(
      worldCup.quiz.questions.map((q) => q.options.find((o) => o.id === wcAnswers[q.id])?.label),
    );
    for (const r of rows) {
      if (r.driven) expect(chosen).toContain(r.proof);
      else expect(r.proof).toBe("nothing you picked leaned this way");
    }
  });

  it("proof = the chosen option that loaded the axis most (traceable)", () => {
    for (const axis of worldCup.quiz.dimensions) {
      let best: { label: string; w: number } | null = null;
      for (const q of worldCup.quiz.questions) {
        const o = q.options.find((x) => x.id === wcAnswers[q.id]);
        const w = o?.weights[axis] ?? 0;
        if (o && w > 0 && (!best || w > best.w)) best = { label: o.label, w };
      }
      const row = rows.find((r) => r.axis === axis)!;
      if (best) {
        expect(row.driven).toBe(true);
        expect(row.proof).toBe(best.label);
      } else {
        expect(row.driven).toBe(false);
      }
    }
  });

  it("values track the engine's normalized scores (no invented numbers)", () => {
    const norm = percentileNormalize(worldCup.quiz, scoreAnswers(worldCup.quiz, wcAnswers));
    for (const r of rows) expect(r.value).toBe(Math.round((norm[r.axis] ?? 0.5) * 100));
  });

  it("works for the 6-axis music quiz too", () => {
    const a: Answers = {
      rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
      sits: "nobody", sadsong: "sit", where: "alone",
    };
    const p = buildMusicProfile(a);
    const r = buildSignatureRows(musicQuiz, a, p.normalized, MUSIC_SIGNATURE_LABELS);
    expect(r).toHaveLength(musicQuiz.dimensions.length);
    expect(r.every((x) => x.label === MUSIC_SIGNATURE_LABELS[x.axis])).toBe(true);
  });
});
