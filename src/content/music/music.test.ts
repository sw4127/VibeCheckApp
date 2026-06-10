import { describe, it, expect } from "vitest";
import { buildProfile, dimensionRanges, type Answers } from "@/engine";
import {
  musicQuiz,
  musicArchetypes,
  buildMusicProfile,
  splitLanes,
  musicPremiumProfile,
  attachmentOf,
  describeState,
  ARCHETYPE_THEMES,
  QUESTION_LANES,
  REVERB,
  CUES,
  STATE_AXES,
  TRAIT_AXES,
} from "./index";

const dims = new Set(musicQuiz.dimensions);

describe("music config integrity", () => {
  it("has unique question and per-question option ids", () => {
    const qIds = musicQuiz.questions.map((q) => q.id);
    expect(new Set(qIds).size).toBe(qIds.length);
    for (const q of musicQuiz.questions) {
      const oIds = q.options.map((o) => o.id);
      expect(new Set(oIds).size).toBe(oIds.length);
    }
  });

  it("only weights declared dimensions, and every dimension has spread", () => {
    for (const q of musicQuiz.questions)
      for (const o of q.options)
        for (const d of Object.keys(o.weights)) expect(dims.has(d)).toBe(true);
    const ranges = dimensionRanges(musicQuiz);
    for (const d of musicQuiz.dimensions) expect(ranges[d].max).toBeGreaterThan(ranges[d].min);
  });

  it("has in-range centroids, unique ids, and a designed theme per archetype", () => {
    const ids = musicArchetypes.centroids.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of musicArchetypes.centroids) {
      for (const [d, v] of Object.entries(c.vector)) {
        expect(dims.has(d)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
      expect(ARCHETYPE_THEMES[c.id], `missing theme for ${c.id}`).toBeTruthy();
      expect(c.tags?.length ?? 0).toBeGreaterThanOrEqual(3);
    }
  });

  it("has reverb + cue copy for every question/option (§17.A/§18.A)", () => {
    for (const q of musicQuiz.questions) {
      expect(CUES[q.id], `missing cue for ${q.id}`).toBeTruthy();
      for (const o of q.options)
        expect(REVERB[q.id]?.[o.id], `missing reverb for ${q.id}/${o.id}`).toBeTruthy();
    }
  });
});

describe("lane purity (§17.B — GIGO guard)", () => {
  it("routes every question to a lane, and weights touch ONLY that lane's axes", () => {
    const stateSet = new Set<string>(STATE_AXES);
    const traitSet = new Set<string>(TRAIT_AXES);
    for (const q of musicQuiz.questions) {
      const lane = QUESTION_LANES[q.id];
      expect(lane, `no lane for ${q.id}`).toBeTruthy();
      const allowed = lane === "state" ? stateSet : traitSet;
      for (const o of q.options)
        for (const axis of Object.keys(o.weights))
          expect(allowed.has(axis), `${q.id}/${o.id} leaks ${axis} across the ${lane} lane`).toBe(true);
    }
  });

  it("splitLanes buckets exactly the lane axes", () => {
    const answers: Answers = {
      rotation: "calm", job: "match", hooks: "lyrics", lately: "comfort",
      sits: "center", sadsong: "sit", where: "alone",
    };
    const lanes = splitLanes(buildMusicProfile(answers));
    expect(Object.keys(lanes.state).sort()).toEqual([...STATE_AXES].sort());
    expect(Object.keys(lanes.trait).sort()).toEqual([...TRAIT_AXES].sort());
  });
});

describe("music outcomes", () => {
  function allOutcomes() {
    const counts = musicQuiz.questions.map((q) => q.options.length);
    const total = counts.reduce((a, b) => a * b, 1);
    const reached = new Map<string, number>();
    for (let i = 0; i < total; i++) {
      let n = i;
      const answers: Answers = {};
      for (const q of musicQuiz.questions) {
        const k = q.options.length;
        answers[q.id] = q.options[n % k].id;
        n = Math.floor(n / k);
      }
      const p = buildProfile(musicQuiz, musicArchetypes, musicArchetypes, answers);
      reached.set(p.archetype.id, (reached.get(p.archetype.id) ?? 0) + 1);
    }
    return { reached, total };
  }
  const { reached, total } = allOutcomes();

  it("covers the full answer space without throwing", () => {
    expect(total).toBe(3456);
  });

  it("reaches a healthy variety of archetypes (no funnel)", () => {
    expect(reached.size).toBeGreaterThanOrEqual(7);
    expect(Math.max(...reached.values()) / total).toBeLessThan(0.45);
  });

  it("is deterministic for a fixed answer set", () => {
    const a: Answers = {
      rotation: "heavy", job: "change", hooks: "texture", lately: "discover",
      sits: "offpath", sadsong: "gut", where: "curate",
    };
    expect(buildMusicProfile(a)).toEqual(buildMusicProfile(a));
  });
});

describe("musicPremiumProfile (§17.B mapping)", () => {
  const answers: Answers = {
    rotation: "calm", job: "match", hooks: "lyrics", lately: "discover",
    sits: "nobody", sadsong: "sit", where: "alone",
  };
  const profile = buildMusicProfile(answers);
  const premium = musicPremiumProfile(profile, ["Phoebe Bridgers"], ["Radiohead"]);

  it("derives O/E from the trait lane and placeholders C/A/N as Medium", () => {
    const lanes = splitLanes(profile);
    const get = (t: string) => premium.bigFive.find((b) => b.trait === t)!.level;
    expect(get("Openness")).toBe(lanes.trait.openness);
    expect(get("Extraversion")).toBe(lanes.trait.extraversion);
    expect(get("Conscientiousness")).toBe("Medium");
    expect(get("Agreeableness")).toBe("Medium");
    expect(get("Neuroticism")).toBe("Medium");
  });

  it("carries archetype, artists, a state line, and a deterministic attachment style", () => {
    expect(premium.archetype).toBe(profile.archetype.label);
    expect(premium.artistsRecent).toEqual(["Phoebe Bridgers"]);
    expect(premium.artistsDurable).toEqual(["Radiohead"]);
    expect(premium.stateLine.length).toBeGreaterThan(0);
    expect(premium.attachmentStyle).toBe(attachmentOf(splitLanes(profile).trait));
  });

  it("describeState is total over all level combos", () => {
    const L = ["High", "Medium", "Low"] as const;
    for (const e of L) for (const r of L) for (const g of L) {
      expect(describeState({ energy: e, rumination: r, regulation: g }).length).toBeGreaterThan(0);
    }
  });
});
