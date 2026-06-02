import { describe, it, expect } from "vitest";
import { buildProfile, type Answers } from "@/engine";
import { worldCup } from "@/content/world-cup";
import {
  buildUserMessage,
  levelOf,
  localReading,
  worldCupReadingSchema,
  THEMES,
} from "./index";

const sample: Answers = {
  weekend: "plan",
  group: "glue",
  pressure: "cold",
  friends: "reliable",
  win: "thank",
  problems: "calm",
  oneword: "steady",
};
const profile = buildProfile(
  worldCup.quiz,
  worldCup.archetypes,
  worldCup.roster,
  sample,
);

describe("levelOf", () => {
  it("buckets percentiles into enum-locked levels", () => {
    expect(levelOf(0.9)).toBe("High");
    expect(levelOf(0.66)).toBe("High");
    expect(levelOf(0.5)).toBe("Medium");
    expect(levelOf(0.34)).toBe("Medium");
    expect(levelOf(0.1)).toBe("Low");
  });
});

describe("buildUserMessage", () => {
  const msg = buildUserMessage(profile, worldCup.quiz.dimensions);

  it("includes the computed archetype and player verbatim", () => {
    expect(msg).toContain(`ARCHETYPE: ${profile.archetype.label}`);
    expect(msg).toContain(`PLAYER: ${profile.match.label}`);
  });

  it("lists every dimension as a level, in config order", () => {
    expect(msg).toMatch(/^SCORES: /m);
    for (const dim of worldCup.quiz.dimensions) {
      const title = dim.charAt(0).toUpperCase() + dim.slice(1);
      expect(msg).toContain(`${title}=`);
    }
  });

  it("is deterministic", () => {
    expect(buildUserMessage(profile, worldCup.quiz.dimensions)).toBe(msg);
  });
});

describe("localReading (fallback / no-key path)", () => {
  const reading = localReading(profile);

  it("is always schema-valid", () => {
    expect(() => worldCupReadingSchema.parse(reading)).not.toThrow();
  });

  it("uses the engine's archetype and player (writer never decides)", () => {
    expect(reading.archetype).toBe(profile.archetype.label);
    expect(reading.player).toBe(profile.match.label);
  });

  it("emits exactly three traits and a valid theme", () => {
    expect(reading.shared_traits).toHaveLength(3);
    expect(THEMES).toContain(reading.theme);
  });

  it("picks a stable theme for a given profile", () => {
    expect(localReading(profile).theme).toBe(reading.theme);
  });
});

describe("worldCupReadingSchema", () => {
  const good = localReading(profile);

  it("rejects an invalid theme", () => {
    expect(() =>
      worldCupReadingSchema.parse({ ...good, theme: "rainbow" }),
    ).toThrow();
  });

  it("rejects fewer than two traits", () => {
    expect(() =>
      worldCupReadingSchema.parse({ ...good, shared_traits: ["solo"] }),
    ).toThrow();
  });
});
