import { describe, it, expect } from "vitest";
import { buildProfile, percentileNormalize, scoreAnswers, type Answers } from "@/engine";
import { worldCup } from "@/content/world-cup";
import { buildMusicProfile, musicQuiz } from "@/content/music";
import {
  buildSignatureRows,
  FOOTBALL_SIGNATURE_LABELS,
  FOOTBALL_SIGNATURE_POLES,
  MUSIC_SIGNATURE_LABELS,
  MUSIC_SIGNATURE_POLES,
} from "./signature";

const wcAnswers: Answers = {
  weekend: "plan", group: "glue", pressure: "cold",
  friends: "reliable", win: "next", problems: "calm", oneword: "steady",
};

/** Every question's chosen label for an answer set (proofs must come from here). */
function chosenLabels(quiz: typeof worldCup.quiz, answers: Answers): Set<string> {
  return new Set(
    quiz.questions.map((q) => q.options.find((o) => o.id === answers[q.id])?.label ?? ""),
  );
}

describe("buildSignatureRows", () => {
  const profile = buildProfile(worldCup.quiz, worldCup.archetypes, worldCup.roster, wcAnswers);
  const rows = buildSignatureRows(
    worldCup.quiz, wcAnswers, profile.normalized, FOOTBALL_SIGNATURE_LABELS, FOOTBALL_SIGNATURE_POLES,
  );

  it("emits one labelled, 0–100 row per axis (declared order; chart sorts)", () => {
    expect(rows.map((r) => r.axis)).toEqual([...worldCup.quiz.dimensions]);
    for (const r of rows) {
      expect(r.value).toBeGreaterThanOrEqual(0);
      expect(r.value).toBeLessThanOrEqual(100);
      expect(r.lean).toBeGreaterThanOrEqual(0);
      expect(r.lean).toBeLessThanOrEqual(100);
      expect(r.label).toBe(FOOTBALL_SIGNATURE_LABELS[r.axis]);
    }
  });

  it("BIPOLAR: pole matches direction; lean is the distance from center", () => {
    for (const r of rows) {
      expect(r.lean).toBe(Math.abs(r.value - 50) * 2);
      if (r.direction === "high") expect(r.pole).toBe(FOOTBALL_SIGNATURE_POLES[r.axis].high);
      if (r.direction === "low") expect(r.pole).toBe(FOOTBALL_SIGNATURE_POLES[r.axis].low);
      if (r.direction === "mid") {
        expect(r.pole).toBe("Balanced");
        expect(r.lean).toBeLessThanOrEqual(20);
      }
    }
  });

  it("HONESTY: a driven proof is always a real answer the user picked — never fabricated", () => {
    const chosen = chosenLabels(worldCup.quiz, wcAnswers);
    for (const r of rows) {
      if (r.driven) expect(chosen).toContain(r.proof);
      else expect(["dead center — no lean either way", "nothing you picked leaned this way"]).toContain(r.proof);
    }
  });

  it("HIGH proof = the chosen option that loaded the axis most (traceable)", () => {
    for (const axis of worldCup.quiz.dimensions) {
      const row = rows.find((r) => r.axis === axis)!;
      if (row.direction !== "high") continue;
      let best: { label: string; w: number } | null = null;
      for (const q of worldCup.quiz.questions) {
        const o = q.options.find((x) => x.id === wcAnswers[q.id]);
        const w = o?.weights[axis] ?? 0;
        if (o && w > 0 && (!best || w > best.w)) best = { label: o.label, w };
      }
      if (best) {
        expect(row.driven).toBe(true);
        expect(row.proof).toBe(best.label);
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
    const r = buildSignatureRows(musicQuiz, a, p.normalized, MUSIC_SIGNATURE_LABELS, MUSIC_SIGNATURE_POLES);
    expect(r).toHaveLength(musicQuiz.dimensions.length);
    expect(r.every((x) => x.label === MUSIC_SIGNATURE_LABELS[x.axis])).toBe(true);
  });
});

describe("the all-low-pole answerer (the engagement fix)", () => {
  // Every pick is the low pole of its axis — the §18.D "equally ownable" user
  // the old chart punished with six empty bars + 'nothing leaned this way'.
  const allLow: Answers = {
    rotation: "calm", job: "match", hooks: "beat", lately: "comfort",
    sits: "center", sadsong: "skip", where: "alone",
  };
  const p = buildMusicProfile(allLow);
  const rows = buildSignatureRows(musicQuiz, allLow, p.normalized, MUSIC_SIGNATURE_LABELS, MUSIC_SIGNATURE_POLES);

  it("reads as STRONG NAMED LEANS, not absence (≥4 real leans)", () => {
    const leans = rows.filter((r) => r.direction === "low" && r.lean > 20);
    expect(leans.length).toBeGreaterThanOrEqual(4);
    for (const r of leans) expect(r.pole).toBe(MUSIC_SIGNATURE_POLES[r.axis].low);
  });

  it("every low lean carries a REAL picked answer as its receipt (no 'nothing leaned')", () => {
    const chosen = chosenLabels(musicQuiz, allLow);
    for (const r of rows.filter((x) => x.direction === "low")) {
      expect(r.driven, `${r.axis} should have a declining receipt`).toBe(true);
      expect(chosen).toContain(r.proof);
    }
  });

  it("the shame string never appears for a decided lean", () => {
    for (const r of rows.filter((x) => x.direction !== "mid")) {
      expect(r.proof).not.toBe("nothing you picked leaned this way");
    }
  });
});

describe("the dead-center answerer stays honest", () => {
  it("mid axes say so — no fabricated lean", () => {
    // A mixed set that lands near the middle on at least one axis.
    const a: Answers = {
      rotation: "warm", job: "scene", hooks: "texture", lately: "discover",
      sits: "popular", sadsong: "gut", where: "curate",
    };
    const p = buildMusicProfile(a);
    const rows = buildSignatureRows(musicQuiz, a, p.normalized, MUSIC_SIGNATURE_LABELS, MUSIC_SIGNATURE_POLES);
    for (const r of rows.filter((x) => x.direction === "mid")) {
      expect(r.pole).toBe("Balanced");
      expect(r.proof).toBe("dead center — no lean either way");
      expect(r.driven).toBe(false);
    }
  });
});
